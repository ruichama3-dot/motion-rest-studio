import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { newSceneId, parseStoryboard, type Storyboard } from "@/lib/storyboard";

const requestSchema = z.object({
  prompt: z.string().trim().min(12, "Descreva melhor a animação.").max(2400, "A descrição é demasiado longa."),
  format: z.enum(["9:16", "16:9", "1:1"]),
  duration: z.enum(["15", "30", "45", "60"]),
});

const layerDraftSchema = z.object({
  id: z.string().min(1).max(40),
  type: z.enum(["text", "rectangle", "circle", "ring", "line", "cube", "sphere", "grid", "particle"]),
  text: z.string().max(180).optional(),
  x: z.number().min(-100).max(200).default(50),
  y: z.number().min(-100).max(200).default(50),
  width: z.number().min(1).max(100).default(30),
  height: z.number().min(1).max(100).default(20),
  depth: z.number().min(-500).max(500).default(0),
  rotation: z.number().min(-360).max(360).default(0),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  opacity: z.number().min(0).max(1).default(1),
  fontSize: z.number().min(8).max(180).default(48),
  weight: z.enum(["400", "500", "600", "700", "800", "900"]).default("700"),
  motion: z.enum(["rise", "drop", "slide-left", "slide-right", "scale", "rotate", "float", "pulse", "orbit", "reveal"]).default("rise"),
  delay: z.number().int().min(0).max(240).default(0),
  duration: z.number().int().min(6).max(450).default(30),
  radius: z.number().min(0).max(100).default(8),
});

const sceneDraftSchema = z.object({
  headline: z.string().min(1).max(120),
  subline: z.string().max(200).default(""),
  transition: z.enum(["fade", "slide", "zoom", "wipe", "rotate"]),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  speed: z.number().min(0.5).max(2).default(1),
  narration: z.string().max(1500).default(""),
  layers: z.array(layerDraftSchema).min(2).max(12),
});

const responseSchema = z.object({ scenes: z.array(sceneDraftSchema).min(2).max(8) });
type RequestData = z.infer<typeof requestSchema>;
type RateEntry = { count: number; resetAt: number };
const rateWindow = new Map<string, RateEntry>();

function enforceRateLimit() {
  const ip = getRequestIP({ xForwardedFor: true }) || "unknown";
  const now = Date.now();
  const current = rateWindow.get(ip);
  if (!current || current.resetAt <= now) {
    rateWindow.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return;
  }
  if (current.count >= 4) throw new Error("Atingiste o limite temporário de gerações. Aguarda alguns minutos e tenta novamente.");
  current.count += 1;
}

function extractJson(text: string) {
  const clean = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("A IA não devolveu uma composição válida.");
  return JSON.parse(clean.slice(start, end + 1));
}

export async function generateStoryboardWithGemini(input: RequestData): Promise<Storyboard> {
  enforceRateLimit();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("A chave Gemini não está configurada no servidor.");

  const duration = Number(input.duration);
  const sceneCount = duration === 15 ? 2 : duration === 30 ? 3 : duration === 45 ? 4 : 5;
  const sceneSeconds = duration / sceneCount;
  const systemInstruction = [
    "És um diretor de motion design e creative coder especializado em animação 2D, 2.5D e 3D.",
    "Cria uma composição visual animada, NÃO um vídeo filmado, storyboard textual ou cenas com pessoas reais.",
    "A saída é uma árvore de camadas declarativas que o motor Remotion vai executar. Não escrevas JavaScript executável.",
    "Usa tipografia cinética, formas geométricas, cubos, esferas, anéis, grelhas, partículas, profundidade, rotação, parallax e transições.",
    "Cada cena deve ter entre 3 e 8 camadas com posições variadas, hierarquia, escala e movimento intencional.",
    "Usa 2D e 3D quando fizer sentido. Cubos e esferas usam profundidade e transformação 3D simulada.",
    "Não repitas a mesma composição em todas as cenas. Cria início, desenvolvimento e conclusão visual.",
    "Não inventes preços, contactos, resultados ou características que o utilizador não forneceu.",
    "Responde exclusivamente com JSON válido, sem Markdown.",
    "Tipos de camada: text, rectangle, circle, ring, line, cube, sphere, grid, particle.",
    "Movimentos: rise, drop, slide-left, slide-right, scale, rotate, float, pulse, orbit, reveal.",
    "Cada camada: id, type, text opcional, x, y, width, height, depth, rotation, color HEX, opacity, fontSize, weight, motion, delay, duration, radius.",
    "x e y são posições percentuais no canvas. width e height são percentuais. depth é profundidade em pixels.",
    "Cada cena: headline, subline, transition, background, foreground, accent, speed, narration, layers.",
    "Transições permitidas: fade, slide, zoom, wipe, rotate. Mantém contraste e composição profissional.",
  ].join(" ");

  const userPrompt = [
    `BRIEFING: ${input.prompt}`,
    `DURAÇÃO: ${duration}s. Cria exatamente ${sceneCount} cenas com ${sceneSeconds}s cada.`,
    `FORMATO: ${input.format}.`,
    "Responde com { scenes: [...] }. Cada cena deve ter pelo menos duas camadas visuais.",
  ].join("\n");

  const models = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash"];
  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 7000, temperature: 0.8 },
  });

  let response: Response | null = null;
  let lastFailure = "";
  for (const model of models) {
    try {
      const candidate = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: requestBody,
        signal: AbortSignal.timeout(18000),
      });
      if (candidate.ok) { response = candidate; break; }
      lastFailure = await candidate.text().catch(() => "");
      console.error(`[Motion Rest] Gemini ${model} failed:`, candidate.status, lastFailure.slice(0, 350));
      if (![404, 429, 500, 502, 503, 504].includes(candidate.status)) { response = candidate; break; }
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
      console.error(`[Motion Rest] Gemini ${model} request error:`, lastFailure);
    }
  }

  if (!response || !response.ok) {
    const status = response?.status;
    if (status === 429) throw new Error("A Gemini API atingiu o limite de utilização. Aguarda e tenta novamente.");
    if (status === 401 || status === 403) throw new Error("A chave Gemini foi recusada. Verifica a configuração no Vercel.");
    console.error("[Motion Rest] Gemini generation failed:", status ?? "timeout", lastFailure.slice(0, 500));
    throw new Error("Não foi possível criar a composição agora. Tenta novamente dentro de instantes.");
  }

  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const output = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!output) throw new Error("A IA não devolveu uma composição. Ajusta a descrição e tenta novamente.");

  let parsed: z.infer<typeof responseSchema>;
  try {
    parsed = responseSchema.parse(extractJson(output));
  } catch (error) {
    console.error("[Motion Rest] Invalid motion composition:", error);
    throw new Error("A composição gerada não passou na validação. Tenta novamente.");
  }

  const scenes = parsed.scenes.slice(0, sceneCount).map((scene) => ({
    ...scene,
    id: newSceneId(),
    template: "motion-scene" as const,
    durationInFrames: Math.round(sceneSeconds * 30),
    headline: scene.headline.trim(),
    subline: scene.subline.trim(),
    narration: scene.narration.trim(),
  }));
  const validated = parseStoryboard({ format: input.format, scenes });
  if (!validated.success) {
    console.error("[Motion Rest] Composition validation failed:", validated.error.flatten());
    throw new Error("A composição ultrapassou os limites permitidos. Gera novamente.");
  }
  return validated.data;
}

export function validateGenerationInput(input: unknown): RequestData {
  return requestSchema.parse(input);
}
