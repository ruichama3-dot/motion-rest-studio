import { supabase } from "@/integrations/supabase/client";
import { validateUpload } from "./production";
export type Asset = { id: string; project_id: string; name: string; path: string; mime_type: string; size_bytes: number; kind: string; description: string; url: string };
export async function listAssets(projectId: string): Promise<Asset[]> {
  const { data, error } = await supabase.from("project_assets").select("*").eq("project_id", projectId).order("created_at");
  if (error) throw error;
  return Promise.all((data ?? []).map(async a => ({ ...a, url: await assetUrl(a.path) })));
}
export async function assetUrl(path: string) {
  const { data, error } = await supabase.storage.from("media").createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
export async function uploadAsset(projectId: string, file: File, kind: string) {
  const invalid = validateUpload(file); if (invalid) throw new Error(invalid);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Entre na sua conta para carregar materiais.");
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin";
  const path = `${auth.user.id}/${projectId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { error: dbError } = await supabase.from("project_assets").insert({ project_id: projectId, user_id: auth.user.id, name: file.name, path, mime_type: file.type, size_bytes: file.size, kind });
  if (dbError) { await supabase.storage.from("media").remove([path]); throw dbError; }
}
export async function removeAsset(asset: Asset) {
  const { error } = await supabase.storage.from("media").remove([asset.path]); if (error) throw error;
  const { error: dbError } = await supabase.from("project_assets").delete().eq("id", asset.id); if (dbError) throw dbError;
}
export async function describeAsset(id: string, description: string) {
  const { error } = await supabase.from("project_assets").update({ description }).eq("id", id); if (error) throw error;
}