import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { parseStoryboard, starterStoryboard, totalFrames, FPS, type Storyboard, type VideoFormat } from "./storyboard";

export type Project = {
  id: string;
  name: string;
  format: string;
  status: string;
  storyboard: Storyboard;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
};

const cols = "id,name,format,status,storyboard,duration_seconds,created_at,updated_at";

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from("projects").select(cols).order("updated_at", { ascending: false });
  if (error) throw error;
  return data as unknown as Project[];
}

export async function getProject(id: string): Promise<Project> {
  if (!z.string().uuid().safeParse(id).success) throw new Error("Projeto indisponível");
  const { data, error } = await supabase.from("projects").select(cols).eq("id", id).single();
  if (error?.code === "PGRST116") throw new Error("Projeto indisponível");
  if (error) throw new Error("Não foi possível carregar o projeto. Tente novamente.");
  return data as unknown as Project;
}

export async function createProject(name: string, format: VideoFormat = "16:9", storyboard?: Storyboard) {
  const sb = storyboard ?? starterStoryboard(format);
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Entre na sua conta para criar um vídeo.");
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: u.user.id,
      name,
      format,
      storyboard: sb as never,
      duration_seconds: totalFrames(sb.scenes) / FPS,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function saveProject(id: string, name: string, storyboard: Storyboard) {
  const parsed = parseStoryboard(storyboard);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Storyboard inválido");
  const { error } = await supabase
    .from("projects")
    .update({
      name,
      format: parsed.data.format,
      storyboard: parsed.data as never,
      duration_seconds: totalFrames(parsed.data.scenes) / FPS,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function duplicateProject(p: Project) {
  return createProject(`${p.name} (cópia)`, p.storyboard.format, p.storyboard);
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
