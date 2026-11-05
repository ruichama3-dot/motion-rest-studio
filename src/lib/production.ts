import { z } from "zod";
import { starterStoryboard, type Storyboard, type VideoFormat } from "./storyboard";

export const CATEGORIES = [
  { id: "product", label: "Um produto", description: "Produtos, coleções e lançamentos", icon: "package" },
  { id: "business", label: "Um negócio ou marca", description: "Empresas, lojas e marcas pessoais", icon: "store" },
  { id: "place", label: "Um lugar", description: "Espaços, imóveis e destinos", icon: "map" },
  { id: "service", label: "Um serviço", description: "Soluções e serviços profissionais", icon: "briefcase" },
  { id: "other", label: "Outro tipo de vídeo", description: "Educação, eventos e apresentações", icon: "film" },
] as const;
export type Category = typeof CATEGORIES[number]["id"];
export const STYLE_NAMES = ["Cinematic Advertising", "Kinetic Typography", "Product Showcase", "Luxury Brand", "Modern Corporate", "App and Website Promo", "Explainer Motion", "Location Promotion", "Social Media Advertising", "Minimal Motion", "Futuristic Technology", "Editorial Motion", "Educational Content", "Logo Reveal", "2.5D Motion", "Bold Typography", "Documentary Style"] as const;
export type ProductionBrief = {
  category: Category; fields: Record<string, string>; style: string; duration: number; format: VideoFormat;
  narration: boolean; captions: boolean; voice: "Kore" | "Puck"; tone: string;
  concept?: Concept; approved?: boolean; step?: number; referenceMode?: string;
};
export const defaultBrief = (): ProductionBrief => ({ category: "product", fields: {}, style: "Cinematic Advertising", duration: 20, format: "16:9", narration: true, captions: true, voice: "Kore", tone: "Publicitário", step: 0 });
export function readBrief(input: unknown): ProductionBrief {
  const base = defaultBrief();
  if (!input || typeof input !== "object" || Array.isArray(input)) return base;
  const value = input as Partial<ProductionBrief>;
  return { ...base, ...value, fields: value.fields ?? {} };
}
export const FIELD_GROUPS: Record<Category, { id: string; label: string; required?: boolean }[]> = {
  product: [{ id: "name", label: "Nome do produto", required: true }, { id: "description", label: "Características principais", required: true }, { id: "benefits", label: "Benefícios comprovados" }, { id: "problem", label: "Problema que resolve" }, { id: "differences", label: "Diferenciais" }, { id: "audience", label: "Público-alvo" }, { id: "price", label: "Preço e condições (opcional)" }, { id: "promotion", label: "Promoções e condições" }, { id: "contact", label: "Contacto ou forma de compra" }, { id: "cta", label: "Chamada para ação" }],
  business: [{ id: "name", label: "Nome do negócio", required: true }, { id: "description", label: "Descrição do negócio", required: true }, { id: "offer", label: "Produtos ou serviços" }, { id: "audience", label: "Público-alvo" }, { id: "location", label: "Localização e área de atuação" }, { id: "problem", label: "Problemas dos clientes" }, { id: "benefits", label: "Vantagens reais" }, { id: "contact", label: "Contactos e redes sociais" }, { id: "goal", label: "Objetivo da campanha" }],
  place: [{ id: "name", label: "Nome do lugar", required: true }, { id: "description", label: "Características do espaço", required: true }, { id: "location", label: "Localização" }, { id: "offer", label: "Serviços e experiências" }, { id: "audience", label: "Público que pretende atrair" }, { id: "conditions", label: "Horários, preços e condições" }, { id: "contact", label: "Contactos" }, { id: "goal", label: "Objetivo do vídeo" }],
  service: [{ id: "name", label: "Nome do serviço", required: true }, { id: "description", label: "Descrição do serviço", required: true }, { id: "problem", label: "Problema que resolve" }, { id: "audience", label: "Público-alvo" }, { id: "process", label: "Processo de trabalho" }, { id: "benefits", label: "Benefícios comprovados" }, { id: "differences", label: "Diferenciais" }, { id: "price", label: "Preço (opcional)" }, { id: "location", label: "Área de atuação" }, { id: "contact", label: "Contactos" }, { id: "cta", label: "Chamada para ação" }],
  other: [{ id: "name", label: "Nome do projeto", required: true }, { id: "description", label: "Tema e objetivo", required: true }, { id: "audience", label: "Público" }, { id: "goal", label: "Resultado pretendido" }, { id: "materials", label: "Materiais disponíveis" }, { id: "cta", label: "Mensagem final" }],
};
export function validateBrief(brief: ProductionBrief) {
  return FIELD_GROUPS[brief.category].filter(f => f.required && !brief.fields[f.id]?.trim()).map(f => f.label);
}
export const conceptSchema = z.object({
  name: z.string(), idea: z.string(), hook: z.string(), objective: z.string(), visualDirection: z.string(), musicPlan: z.string(), cta: z.string(),
  scenes: z.array(z.object({ headline: z.string(), subline: z.string(), narration: z.string(), visual: z.string(), template: z.enum(["kinetic-title", "split-reveal", "stat", "logo-reveal", "media-showcase"]), transition: z.enum(["fade", "slide", "zoom", "wipe"]), assetId: z.string() })),
});
export type Concept = z.infer<typeof conceptSchema>;
export const UPLOAD_LIMIT_BYTES = 50 * 1024 * 1024;
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/ogg"];
export function validateUpload(file: Pick<File, "size" | "type">) {
  if (file.size <= 0 || file.size > UPLOAD_LIMIT_BYTES) return "O ficheiro deve ter entre 1 byte e 50 MB.";
  if (!ALLOWED_MIME.includes(file.type)) return "Formato não suportado. Use JPG, PNG, WEBP, MP4, WEBM, MP3, WAV, M4A ou OGG.";
  return null;
}
// Concrete, reusable motion directions. Previews use the same scene engine as projects.
export function styleStoryboard(style: string, format: VideoFormat = "16:9"): Storyboard {
  const sb = starterStoryboard(format);
  const i = Math.max(0, STYLE_NAMES.indexOf(style as typeof STYLE_NAMES[number]));
  const templates = ["kinetic-title", "split-reveal", "logo-reveal", "stat"] as const;
  const transitions = ["fade", "slide", "wipe", "zoom"] as const;
  const dark = [0, 3, 10, 14, 15].includes(i);
  return { ...sb, scenes: sb.scenes.map((s, n) => ({ ...s, headline: n === 0 ? style : n === 1 ? "A sua história" : "MOTION REST", subline: n === 1 ? "Ideias em movimento" : "", template: templates[(i + n) % templates.length] ?? "kinetic-title", transition: transitions[i % transitions.length] ?? "fade", durationInFrames: 150, speed: i % 3 === 0 ? 0.7 : i % 3 === 1 ? 1.4 : 1, background: dark ? "#171717" : "#FFFFFF", foreground: dark ? "#FFFFFF" : "#171717" })) };
}