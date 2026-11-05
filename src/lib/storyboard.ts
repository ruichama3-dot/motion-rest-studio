import { z } from "zod";

export const SCENE_TEMPLATES = ["kinetic-title", "split-reveal", "stat", "logo-reveal", "media-showcase", "motion-scene"] as const;
export const TRANSITIONS = ["fade", "slide", "zoom", "wipe", "rotate"] as const;
export const LAYER_TYPES = ["text", "rectangle", "circle", "ring", "line", "cube", "sphere", "grid", "particle"] as const;
export const LAYER_MOTIONS = ["rise", "drop", "slide-left", "slide-right", "scale", "rotate", "float", "pulse", "orbit", "reveal"] as const;
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

export const layerSchema = z.object({
  id: z.string().min(1).max(40),
  type: z.enum(LAYER_TYPES),
  text: z.string().max(180).optional(),
  x: z.number().min(-100).max(200).default(50),
  y: z.number().min(-100).max(200).default(50),
  width: z.number().min(1).max(100).default(30),
  height: z.number().min(1).max(100).default(20),
  depth: z.number().min(-500).max(500).default(0),
  rotation: z.number().min(-360).max(360).default(0),
  color: hex,
  opacity: z.number().min(0).max(1).default(1),
  fontSize: z.number().min(8).max(180).default(48),
  weight: z.enum(["400", "500", "600", "700", "800", "900"]).default("700"),
  motion: z.enum(LAYER_MOTIONS).default("rise"),
  delay: z.number().int().min(0).max(240).default(0),
  duration: z.number().int().min(6).max(450).default(30),
  radius: z.number().min(0).max(100).default(8),
});

export const sceneSchema = z.object({
  id: z.string().min(1),
  template: z.enum(SCENE_TEMPLATES),
  durationInFrames: z.number().int().min(MIN_SCENE_SECONDS * FPS).max(MAX_SCENE_SECONDS * FPS),
  headline: z.string().max(120),
  subline: z.string().max(200).default(""),
  transition: z.enum(TRANSITIONS).default("fade"),
  background: hex,
  foreground: hex,
  accent: hex,
  speed: z.number().min(0.5).max(2).default(1),
  narration: z.string().max(1500).optional(),
  visual: z.string().max(1000).optional(),
  layers: z.array(layerSchema).max(12).default([]),
  mediaPath: z.string().max(500).optional(),
  mediaType: z.enum(["image", "video"]).optional(),
  audioPath: z.string().max(500).optional(),
  audioVolume: z.number().min(0).max(1).optional(),
  captions: z.boolean().optional(),
});

export const storyboardSchema = z.object({
  format: z.enum(["16:9", "9:16", "1:1"]),
  scenes: z.array(sceneSchema).min(1).max(MAX_SCENES),
  musicPath: z.string().max(500).optional(),
  musicVolume: z.number().min(0).max(1).optional(),
}).refine((s) => totalFrames(s.scenes) <= MAX_TOTAL_SECONDS * FPS, {
  message: `Duração total acima de ${MAX_TOTAL_SECONDS}s`,
});

export type Layer = z.infer<typeof layerSchema>;
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
  const base = { background: "#10121C", foreground: "#FFFFFF", accent: "#E52535", speed: 1 };
  return {
    format,
    scenes: [
      { id: newSceneId(), template: "motion-scene", durationInFrames: 90, headline: "Motion Rest", subline: "Ideias transformadas em movimento", transition: "fade", ...base, layers: [
        { id: "title", type: "text", text: "MOTION REST", x: 50, y: 43, width: 80, height: 18, color: "#FFFFFF", fontSize: 88, weight: "900", motion: "rise", delay: 0, duration: 32 },
        { id: "orb", type: "sphere", x: 50, y: 72, width: 18, height: 18, depth: 90, color: "#E52535", opacity: 0.9, motion: "float", delay: 8, duration: 60 },
        { id: "ring", type: "ring", x: 50, y: 72, width: 27, height: 27, depth: 30, color: "#FFFFFF", opacity: 0.5, motion: "orbit", delay: 0, duration: 90 },
      ] },
      { id: newSceneId(), template: "motion-scene", durationInFrames: 75, headline: "Cria sem limites", subline: "2D · 3D · Motion Graphics", transition: "zoom", ...base, layers: [
        { id: "cube", type: "cube", x: 50, y: 48, width: 28, height: 28, depth: 120, color: "#E52535", motion: "rotate", delay: 0, duration: 75 },
        { id: "label", type: "text", text: "2D  /  3D", x: 50, y: 82, width: 70, height: 12, color: "#FFFFFF", fontSize: 52, weight: "800", motion: "rise", delay: 12, duration: 28 },
      ] },
    ],
  };
}
