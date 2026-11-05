import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { newSceneId, parseStoryboard, type Storyboard } from "@/lib/storyboard";

const requestSchema = z.object({
  prompt: z.string().trim().min(12, "Descreva melhor o vídeo.").max(2400, "A descrição é demasiado longa."),
  format: z.enum(["9:16", "16:9", "1:1"]),
  duration: z.enum(["15", "30", "45", "60"]),
});

const sceneDraftSchema = z.object({
  headline: z.string().min(1).max(120),
  subline: z.string().max(200).default(""),
  template: z.enum(["kinetic-title", "split-reveal", "stat", "logo-reveal"]),
  transition: z.enum(["fade", "slide", "zoom", "wipe"]),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  speed: z.number().min(0.5).max(2).default(1),
  narration: z.string().max(1500).default(""),
});

const responseSchema = z.object({
  scenes: z.array(sceneDraftSchema).min(3).max(8),
});

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
  if (current.count >= 4) {
    throw new Error("Atingiu o limite temporário de gerações. Aguarde alguns minutos e tente novamente.");
  }
  current.count += 1;
}

function extractJson(text: string) {
  const clean = text.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("A IA não devolveu um storyboard válido. Tente novamente.");
  return JSON.parse(clean.slice(start, end + 1));
}

export async function generateStoryboardWithGemini(input: RequestData): Promise<Storyboard> {
  enforceRateLimit();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("A chave Gemini não está configurada no servidor.");

  const duration = Number(input.duration);
  const sceneCount = duration === 15 ? 3 : duration === 30 ? 4 : duration === 45 ? 5 : 6;
  const sceneSeconds = duration / sceneCount;
  const systemInstruction = [
    "És diretor criativo e realizador sénior de motion graphics publicitários.",
    "Transforma o briefing num storyboard de vídeo visualmente forte, claro e profissional.",
    "Responde exclusivamente com JSON válido, sem Markdown nem texto adicional.",
    "Cria cenas com progressão narrativa: gancho, desenvolvimento visual, benefício/prova e chamada para ação.",
    "Não inventes preços, contactos, resultados ou características que o utilizador não forneceu.",
    "Usa português natural, frases curtas e texto legível no ecrã.",
    "Escolhe animações com intenção; evita repetir o mesmo enquadramento em todas as cenas.",
    "Usa apenas estes templates: kinetic-title, split-reveal, stat, logo-reveal.",
    "Usa apenas estas transições: fade, slide, zoom, wipe.",
    "Cada cena deve conter headline, subline, template, transition, background, foreground, accent, speed e narration.",
    "As cores devem ser HEX de seis dígitos. Mantém contraste elevado.",
    "A narração deve ser texto falado natural, não instruções de câmara.",
  ].join(" ");

  const userPrompt = [
    `BRIEFING DO UTILIZADOR: ${input.prompt}`,
    `DURAÇÃO TOTAL: ${duration} segundos. Cria exatamente ${sceneCount} cenas com ${sceneSeconds} segundos cada.`,
    `FORMATO: ${input.format}.`,
    "Responde com o objeto JSON { scenes: [...] } e não incluas duração nem propriedades adicionais.",
  ].join("\n");

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 4500 },
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[Motion Rest] Gemini request failed:", response.status, detail.slice(0, 500));
    if (response.status === 429) throw new Error("A Gemini API atingiu o limite de utilização. Aguarde e tente novamente.");
    if (response.status === 401 || response.status === 403) throw new Error("A chave Gemini foi recusada. Verifique a chave configurada no Vercel.");
    throw new Error("Não foi possível gerar o vídeo agora. Tente novamente dentro de instantes.");
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text) throw new Error("A IA não conseguiu criar o storyboard. Ajuste a descrição e tente novamente.");

  let parsed: z.infer<typeof responseSchema>;
  try {
    parsed = responseSchema.parse(extractJson(text));
  } catch (error) {
    console.error("[Motion Rest] Invalid Gemini storyboard:", error);
    throw new Error("A IA devolveu uma estrutura de vídeo inválida. Tente gerar novamente.");
  }

  const scenes = parsed.scenes.slice(0, sceneCount).map((scene, index) => ({
    ...scene,
    id: newSceneId(),
    durationInFrames: Math.round(sceneSeconds * 30),
    headline: scene.headline.trim(),
    subline: scene.subline.trim(),
    narration: scene.narration.trim(),
  }));

  const storyboard = { format: input.format, scenes };
  const validated = parseStoryboard(storyboard);
  if (!validated.success) {
    console.error("[Motion Rest] Storyboard validation failed:", validated.error.flatten());
    throw new Error("O vídeo criado ultrapassou os limites de composição. Gere novamente.");
  }
  return validated.data;
}

export function validateGenerationInput(input: unknown): RequestData {
  return requestSchema.parse(input);
}
