import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Redo2, Save, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { getProject, saveProject } from "@/lib/projects";
import {
  FPS, MAX_SCENES, MAX_SCENE_SECONDS, MIN_SCENE_SECONDS, SCENE_TEMPLATES, TRANSITIONS,
  newSceneId, parseStoryboard, totalFrames, type Scene, type Storyboard, type VideoFormat,
} from "@/lib/storyboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const Preview = lazy(() => import("@/remotion/Preview"));

export const Route = createFileRoute("/app/projects/$id")({
  head: () => ({
    meta: [
      { title: "Editor — Motion Rest" },
      { name: "description", content: "Edite as cenas, cores e animações do seu vídeo." },
      { property: "og:title", content: "Editor — Motion Rest" },
      { property: "og:description", content: "Edite as cenas, cores e animações do seu vídeo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Editor,
});

const TEMPLATE_LABEL: Record<string, string> = { "kinetic-title": "Kinetic Typography", "split-reveal": "Split Reveal", stat: "Número em destaque", "logo-reveal": "Logo Reveal" };
const TRANSITION_LABEL: Record<string, string> = { fade: "Dissolver", slide: "Deslizar", zoom: "Zoom", wipe: "Revelação" };
const ASPECT: Record<VideoFormat, string> = { "16:9": "aspect-video", "9:16": "aspect-[9/16] max-h-[70vh]", "1:1": "aspect-square max-h-[70vh]" };

function Editor() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data, error, refetch, isFetching } = useQuery({ queryKey: ["project", id], queryFn: () => getProject(id), retry: false });

  const [name, setName] = useState("");
  const [hist, setHist] = useState<{ past: Storyboard[]; present: Storyboard | null; future: Storyboard[] }>({ past: [], present: null, future: [] });
  const [sel, setSel] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !hist.present) {
      setName(data.name);
      setHist({ past: [], present: data.storyboard, future: [] });
    }
  }, [data, hist.present]);

  const sb = hist.present;
  const commit = useCallback((next: Storyboard) => {
    setHist((h) => ({ past: [...h.past.slice(-49), h.present!], present: next, future: [] }));
    setDirty(true);
  }, []);
  const undo = () => setHist((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1]!, future: [h.present!, ...h.future] } : h));
  const redo = () => setHist((h) => (h.future.length ? { past: [...h.past, h.present!], present: h.future[0]!, future: h.future.slice(1) } : h));

  if (error) return (
    <section className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">{error.message === "Projeto indisponível" ? "Projeto indisponível" : "Não foi possível abrir o projeto"}</h1>
      <p className="mt-3 text-muted-foreground">{error.message === "Projeto indisponível" ? "Este projeto não existe ou não está disponível para a sua conta." : "Os seus projetos não foram alterados. Pode tentar novamente."}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild><Link to="/app"><ArrowLeft /> Voltar aos projetos</Link></Button>
        {error.message !== "Projeto indisponível" && <Button variant="outline" disabled={isFetching} onClick={() => refetch()}>Tentar novamente</Button>}
      </div>
    </section>
  );
  if (!sb) return <div className="p-10 text-muted-foreground">A carregar projeto…</div>;

  const scene = sb.scenes[Math.min(sel, sb.scenes.length - 1)]!;
  const valid = parseStoryboard(sb);
  const patch = (p: Partial<Scene>) => commit({ ...sb, scenes: sb.scenes.map((s) => (s.id === scene.id ? { ...s, ...p } : s)) });
  const move = (dir: -1 | 1) => {
    const i = sb.scenes.indexOf(scene), j = i + dir;
    if (j < 0 || j >= sb.scenes.length) return;
    const scenes = [...sb.scenes];
    [scenes[i], scenes[j]] = [scenes[j]!, scenes[i]!];
    commit({ ...sb, scenes });
    setSel(j);
  };
  const add = () => {
    if (sb.scenes.length >= MAX_SCENES) { toast.error(`Máximo de ${MAX_SCENES} cenas`); return; }
    commit({ ...sb, scenes: [...sb.scenes, { ...scene, id: newSceneId(), headline: "Nova cena", subline: "" }] });
    setSel(sb.scenes.length);
  };
  const remove = () => {
    if (sb.scenes.length <= 1) return;
    commit({ ...sb, scenes: sb.scenes.filter((s) => s.id !== scene.id) });
    setSel(Math.max(0, sel - 1));
  };

  async function save() {
    setSaving(true);
    try {
      await saveProject(id, name, sb!);
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Alterações guardadas");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const total = totalFrames(sb.scenes);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-none border-x-0 border-t-0 px-4 py-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar"><Link to="/app"><ArrowLeft /></Link></Button>
        <Input value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} className="h-9 max-w-xs border-transparent bg-transparent font-semibold shadow-none focus-visible:border-input" />
        <div className="ml-auto flex items-center gap-1">
          <div className="mr-2 flex rounded-full bg-secondary p-1">
            {(["9:16", "16:9", "1:1"] as const).map((f) => (
              <button key={f} onClick={() => commit({ ...sb, format: f })} className={`rounded-full px-3 py-1 text-xs font-semibold ${sb.format === f ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"}`}>{f}</button>
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={undo} disabled={!hist.past.length} aria-label="Desfazer"><Undo2 /></Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!hist.future.length} aria-label="Refazer"><Redo2 /></Button>
          <Button onClick={save} disabled={!dirty || saving || !valid.success}><Save /> {saving ? "A guardar…" : "Guardar"}</Button>
        </div>
      </header>

      {!valid.success && <p className="bg-accent px-4 py-2 text-sm text-accent-foreground">{valid.error.issues[0]?.message}</p>}

      <div className="grid flex-1 gap-5 p-4 lg:grid-cols-[1fr_340px] md:p-6">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex justify-center rounded-3xl bg-foreground/5 p-3 md:p-6">
            <div className={`${ASPECT[sb.format]} w-full overflow-hidden rounded-2xl bg-background shadow-soft ${sb.format !== "16:9" ? "w-auto" : ""}`}>
              <Suspense fallback={<div className="flex h-full items-center justify-center text-muted-foreground">A preparar pré-visualização…</div>}>
                <Preview storyboard={sb} />
              </Suspense>
            </div>
          </div>

          <section className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Timeline · {(total / FPS).toFixed(1)}s</h2>
              <Button size="sm" variant="outline" onClick={add}><Plus /> Cena</Button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {sb.scenes.map((s, i) => (
                <button key={s.id} onClick={() => setSel(i)} style={{ flexGrow: s.durationInFrames, background: s.background, color: s.foreground }}
                  className={`min-w-24 basis-0 truncate rounded-xl border-2 px-3 py-3 text-left text-xs font-semibold ${s.id === scene.id ? "border-primary" : "border-border"}`}>
                  <span className="block opacity-60">{i + 1} · {(s.durationInFrames / FPS).toFixed(1)}s</span>
                  {s.headline}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Faixas de narração, música e efeitos sonoros chegam nas próximas fases.</p>
          </section>
        </div>

        <aside className="glass h-fit space-y-5 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Cena {sb.scenes.indexOf(scene) + 1}</h2>
            <div className="flex">
              <Button variant="ghost" size="icon" onClick={() => move(-1)} aria-label="Mover para trás"><ArrowUp /></Button>
              <Button variant="ghost" size="icon" onClick={() => move(1)} aria-label="Mover para a frente"><ArrowDown /></Button>
              <Button variant="ghost" size="icon" onClick={remove} disabled={sb.scenes.length <= 1} aria-label="Eliminar cena"><Trash2 /></Button>
            </div>
          </div>
          <Field label="Animação">
            <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={scene.template} onChange={(e) => patch({ template: e.target.value as Scene["template"] })}>
              {SCENE_TEMPLATES.map((t) => <option key={t} value={t}>{TEMPLATE_LABEL[t]}</option>)}
            </select>
          </Field>
          <Field label="Título"><Input value={scene.headline} maxLength={120} onChange={(e) => patch({ headline: e.target.value })} /></Field>
          <Field label="Subtítulo"><Textarea value={scene.subline} maxLength={200} rows={2} onChange={(e) => patch({ subline: e.target.value })} /></Field>
          <Field label="Transição de entrada">
            <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={scene.transition} onChange={(e) => patch({ transition: e.target.value as Scene["transition"] })}>
              {TRANSITIONS.map((t) => <option key={t} value={t}>{TRANSITION_LABEL[t]}</option>)}
            </select>
          </Field>
          <Field label={`Duração · ${(scene.durationInFrames / FPS).toFixed(1)}s`}>
            <Slider min={MIN_SCENE_SECONDS * FPS} max={MAX_SCENE_SECONDS * FPS} step={5} value={[scene.durationInFrames]} onValueChange={([v]) => patch({ durationInFrames: v! })} />
          </Field>
          <Field label={`Velocidade da animação · ${scene.speed.toFixed(1)}x`}>
            <Slider min={0.5} max={2} step={0.1} value={[scene.speed]} onValueChange={([v]) => patch({ speed: v! })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            {(["background", "foreground", "accent"] as const).map((k) => (
              <Field key={k} label={{ background: "Fundo", foreground: "Texto", accent: "Destaque" }[k]}>
                <input type="color" value={scene[k]} onChange={(e) => patch({ [k]: e.target.value.toUpperCase() })} className="h-9 w-full cursor-pointer rounded-md border bg-background" />
              </Field>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}
