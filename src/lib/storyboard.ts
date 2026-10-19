import { z } from "zod";

/** Approved scene templates. The AI may only pick from this list — no free code. */
export const SCENE_TEMPLATES = ["kinetic-title", "split-reveal", "stat", "logo-reveal"] as const;
export const TRANSITIONS = ["fade", "slide", "zoom", "wipe"] as const;
export const FORMATS = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
} as const;

export const FPS = 30;
export const MAX_SCENES = 12;
export const MIN_SCENE_SECONDS = 1;
export const MAX_SCENE_SECONDS = 15;
export const MAX_TOTAL_SECONDS = 90;

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida");

export const sceneSchema = z.object({
  id: z.string().min(1),
  template: z.enum(SCENE_TEMPLATES),
  durationInFrames: z
    .number()
    .int()
    .min(MIN_SCENE_SECONDS * FPS)
    .max(MAX_SCENE_SECONDS * FPS),
  headline: z.string().max(120),
  subline: z.string().max(200).default(""),
  transition: z.enum(TRANSITIONS).default("fade"),
  background: hex,
  foreground: hex,
  accent: hex,
  speed: z.number().min(0.5).max(2).default(1),
});

export const storyboardSchema = z
  .object({
    format: z.enum(["16:9", "9:16", "1:1"]),
    scenes: z.array(sceneSchema).min(1).max(MAX_SCENES),
  })
  .refine((s) => totalFrames(s.scenes) <= MAX_TOTAL_SECONDS * FPS, {
    message: `Duração total acima de ${MAX_TOTAL_SECONDS}s`,
  });

export type Scene = z.infer<typeof sceneSchema>;
export type Storyboard = z.infer<typeof storyboardSchema>;
export type VideoFormat = Storyboard["format"];

export function totalFrames(scenes: Pick<Scene, "durationInFrames">[]) {
  return scenes.reduce((n, s) => n + s.durationInFrames, 0);
}

export function parseStoryboard(input: unknown) {
  return storyboardSchema.safeParse(input);
}

let counter = 0;
export const newSceneId = () => `s${Date.now().toString(36)}${(counter++).toString(36)}`;

export function starterStoryboard(format: VideoFormat = "16:9"): Storyboard {
  const base = { background: "#FFFFFF", foreground: "#171717", accent: "#E52535", speed: 1 };
  return {
    format,
    scenes: [
      { id: newSceneId(), template: "kinetic-title", durationInFrames: 90, headline: "O seu produto em movimento", subline: "Escreva o briefing e edite cada cena", transition: "fade", ...base },
      { id: newSceneId(), template: "stat", durationInFrames: 75, headline: "3x", subline: "mais atenção com vídeo", transition: "slide", ...base, background: "#171717", foreground: "#FFFFFF" },
      { id: newSceneId(), template: "logo-reveal", durationInFrames: 75, headline: "MOTION REST", subline: "Comece hoje", transition: "zoom", ...base },
    ],
  };
}
