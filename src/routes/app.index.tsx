import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { lazy, Suspense, useState } from "react";
import { Braces, Code2, Film, LoaderCircle, Play, Sparkles, WandSparkles, X } from "lucide-react";
import type { Storyboard, VideoFormat } from "@/lib/storyboard";
import { generateVideoStoryboard } from "@/lib/ai/generate.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const Preview = lazy(() => import("@/remotion/Preview"));

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Motion Design com IA — Motion Rest Studio" },
      { name: "description", content: "Cria animações 2D e 3D com motion design gerado por IA." },
    ],
  }),
  component: VideoStudio,
});

function VideoStudio() {
  const generate = useServerFn(generateVideoStoryboard);
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<VideoFormat>("9:16");
  const [duration, setDuration] = useState("30");
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showCode, setShowCode] = useState(false);

  async function createVideo() {
    if (busy) return;
    if (prompt.trim().length < 12) {
      setError("Descreve a animação com um pouco mais de detalhe.");
      return;
    }
    setBusy(true);
    setError("");
    setStoryboard(null);
    setShowCode(false);
    try {
      const result = await generate({ data: { prompt: prompt.trim(), format, duration: duration as "15" | "30" | "45" | "60" } });
      setStoryboard(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível criar a animação. Tenta novamente.");
    } finally {
      setBusy(false);
    }
  }

  const compositionCode = storyboard ? JSON.stringify({
    engine: "Motion Rest · Remotion",
    renderer: "validated-motion-scene",
    format: storyboard.format,
    fps: 30,
    scenes: storyboard.scenes.map(({ id, template, durationInFrames, headline, subline, background, foreground, accent, transition, layers }) => ({
      id, template, durationInFrames, headline, subline, background, foreground, accent, transition, layers,
    })),
  }, null, 2) : "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-8 md:pt-12">
      <section className="mx-auto max-w-3xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
          <span className="size-2 rounded-full bg-primary" /> MOTION REST AI STUDIO
        </div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          Cria movimento.
          <span className="block text-primary">Dá vida às tuas ideias.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          Descreve a tua ideia e a IA constrói uma composição de motion design 2D e 3D. Vê a animação a funcionar e consulta a estrutura que a criou.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
          {["Tipografia cinética", "Formas 2D", "Objetos 3D", "Profundidade", "Partículas", "Transições"].map((item) => (
            <span key={item} className="rounded-full border bg-background px-3 py-1.5">{item}</span>
          ))}
        </div>
      </section>

      <section className="glass mx-auto mt-9 max-w-4xl rounded-3xl p-4 md:p-7">
        <label htmlFor="video-prompt" className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <WandSparkles className="size-4 text-primary" /> O que queres animar?
        </label>
        <Textarea
          id="video-prompt"
          value={prompt}
          onChange={(event) => { setPrompt(event.target.value); if (error) setError(""); }}
          placeholder="Ex.: Cria uma animação 3D premium para uma marca de tecnologia. Um cubo metálico vermelho roda lentamente no centro, linhas de luz percorrem as arestas, partículas flutuam no fundo escuro e o nome da marca surge com tipografia cinética. Termina com o slogan..."
          rows={6}
          maxLength={2400}
          className="resize-y rounded-2xl bg-background text-base leading-7"
          disabled={busy}
        />
        <div className="mt-2 flex justify-end text-xs text-muted-foreground">{prompt.length}/2400</div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Formato da composição
            <select value={format} onChange={(event) => { setFormat(event.target.value as VideoFormat); setStoryboard(null); }} disabled={busy} className="h-11 w-full rounded-xl border bg-background px-3">
              <option value="9:16">Vertical · 9:16</option>
              <option value="16:9">Horizontal · 16:9</option>
              <option value="1:1">Quadrado · 1:1</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Duração da animação
            <select value={duration} onChange={(event) => { setDuration(event.target.value); setStoryboard(null); }} disabled={busy} className="h-11 w-full rounded-xl border bg-background px-3">
              <option value="15">15 segundos</option>
              <option value="30">30 segundos</option>
              <option value="45">45 segundos</option>
              <option value="60">60 segundos</option>
            </select>
          </label>
        </div>

        <Button onClick={createVideo} disabled={busy || prompt.trim().length < 12} size="lg" className="mt-6 h-12 w-full rounded-xl text-base">
          {busy ? <><LoaderCircle className="animate-spin" /> A construir a animação…</> : <><Sparkles /> Criar animação com IA</>}
        </Button>
        {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
        <p className="mt-4 text-center text-xs text-muted-foreground">A Gemini cria a estrutura visual. O motor Remotion executa os movimentos na pré-visualização.</p>
      </section>

      {busy && (
        <div className="mx-auto mt-8 flex max-w-4xl items-center gap-3 rounded-2xl border bg-background p-5 text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin text-primary" />
          A direção de arte está a ser convertida numa composição de camadas, movimentos e profundidade 2D/3D…
        </div>
      )}

      {storyboard && (
        <section className="fade-up mx-auto mt-10 max-w-5xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Film className="size-4" /> ANIMAÇÃO PRONTA</div>
              <h2 className="mt-1 text-2xl font-bold">{storyboard.scenes[0]?.headline ?? "A tua composição"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{duration}s · {format} · {storyboard.scenes.length} cenas · {storyboard.scenes.reduce((n, scene) => n + scene.layers.length, 0)} camadas animadas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setShowCode((value) => !value)}>
                {showCode ? <X /> : <Code2 />} {showCode ? "Fechar código" : "Ver código"}
              </Button>
              <Button variant="outline" onClick={createVideo} disabled={busy}><WandSparkles /> Nova versão</Button>
            </div>
          </div>

          <div className={`mx-auto overflow-hidden rounded-3xl border bg-[#080A12] shadow-2xl ${format === "9:16" ? "max-w-sm" : format === "1:1" ? "max-w-xl" : "max-w-5xl"}`}>
            <div className={format === "9:16" ? "aspect-[9/16]" : format === "1:1" ? "aspect-square" : "aspect-video"}>
              <Suspense fallback={<div className="flex h-full items-center justify-center text-white"><LoaderCircle className="animate-spin" /> A preparar a animação…</div>}>
                <Preview storyboard={storyboard} />
              </Suspense>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Play className="size-4" /> Reproduz, pausa e percorre a animação nos controlos do leitor.
          </div>

          {showCode && (
            <div className="mt-6 overflow-hidden rounded-2xl border bg-[#11131a] text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Braces className="size-4 text-primary" /> Estrutura da composição</div>
                <span className="text-xs text-white/50">JSON validado · Remotion</span>
              </div>
              <pre className="max-h-[560px] overflow-auto p-4 text-xs leading-6 text-emerald-200 md:text-sm"><code>{compositionCode}</code></pre>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
