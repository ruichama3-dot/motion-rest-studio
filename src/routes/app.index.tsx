import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { lazy, Suspense, useState } from "react";
import { Film, LoaderCircle, Play, Sparkles, WandSparkles } from "lucide-react";
import type { Storyboard, VideoFormat } from "@/lib/storyboard";
import { generateVideoStoryboard } from "@/lib/ai/generate.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const Preview = lazy(() => import("@/remotion/Preview"));

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Criar vídeo com IA — Motion Rest" },
      { name: "description", content: "Descreva a sua ideia e veja a IA transformá-la num vídeo motion graphics." },
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

  async function createVideo() {
    if (busy) return;
    if (prompt.trim().length < 12) {
      setError("Descreva o vídeo com um pouco mais de detalhe.");
      return;
    }
    setBusy(true);
    setError("");
    setStoryboard(null);
    try {
      const result = await generate({ data: { prompt: prompt.trim(), format, duration: duration as "15" | "30" | "45" | "60" } });
      setStoryboard(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar o vídeo. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 md:px-8 md:pt-14">
      <section className="mx-auto max-w-3xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
          <span className="size-2 rounded-full bg-primary" /> MOTION REST AI STUDIO
        </div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          A tua ideia.
          <span className="block text-primary">Um vídeo em movimento.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          Explica o que queres ver. A inteligência artificial cria as cenas, escolhe os movimentos e monta uma pré-visualização animada automaticamente.
        </p>
      </section>

      <section className="glass mx-auto mt-9 max-w-3xl rounded-3xl p-4 md:p-7">
        <label htmlFor="video-prompt" className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <WandSparkles className="size-4 text-primary" /> Como imaginas o teu vídeo?
        </label>
        <Textarea
          id="video-prompt"
          value={prompt}
          onChange={(event) => { setPrompt(event.target.value); if (error) setError(""); }}
          placeholder="Ex.: Cria um anúncio cinematográfico de 30 segundos para uma pizzaria. Quero planos aproximados da pizza, queijo a derreter, textos grandes em movimento, transições suaves, ambiente noturno elegante e uma chamada para encomendar pelo WhatsApp..."
          rows={6}
          maxLength={2400}
          className="resize-y rounded-2xl bg-background text-base leading-7"
          disabled={busy}
        />
        <div className="mt-2 flex justify-end text-xs text-muted-foreground">{prompt.length}/2400</div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Formato do vídeo
            <select value={format} onChange={(event) => setFormat(event.target.value as VideoFormat)} disabled={busy} className="h-11 w-full rounded-xl border bg-background px-3">
              <option value="9:16">Vertical · 9:16 (Reels / TikTok)</option>
              <option value="16:9">Horizontal · 16:9 (YouTube)</option>
              <option value="1:1">Quadrado · 1:1 (Feed)</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Duração pretendida
            <select value={duration} onChange={(event) => setDuration(event.target.value)} disabled={busy} className="h-11 w-full rounded-xl border bg-background px-3">
              <option value="15">15 segundos</option>
              <option value="30">30 segundos</option>
              <option value="45">45 segundos</option>
              <option value="60">60 segundos</option>
            </select>
          </label>
        </div>

        <Button onClick={createVideo} disabled={busy || prompt.trim().length < 12} size="lg" className="mt-6 h-12 w-full rounded-xl text-base">
          {busy ? <><LoaderCircle className="animate-spin" /> A criar o teu vídeo…</> : <><Sparkles /> Gerar vídeo com inteligência artificial</>}
        </Button>
        {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
        <p className="mt-4 text-center text-xs text-muted-foreground">A IA cria a estrutura visual. A pré-visualização é reproduzida diretamente nesta página.</p>
      </section>

      {busy && (
        <div className="mx-auto mt-8 flex max-w-3xl items-center gap-3 rounded-2xl border bg-background p-5 text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin text-primary" />
          A direção criativa está a ser preparada pela Gemini. Isto pode demorar alguns segundos.
        </div>
      )}

      {storyboard && (
        <section className="fade-up mx-auto mt-10 max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Film className="size-4" /> PRÉ-VISUALIZAÇÃO GERADA</div>
              <h2 className="mt-1 text-2xl font-bold">{storyboard.scenes[0]?.headline ?? "O teu vídeo"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{duration}s · {format} · {storyboard.scenes.length} cenas</p>
            </div>
            <Button variant="outline" onClick={createVideo} disabled={busy}><WandSparkles /> Gerar outra versão</Button>
          </div>
          <div className={`mx-auto overflow-hidden rounded-3xl border bg-black shadow-2xl ${format === "9:16" ? "max-w-sm" : format === "1:1" ? "max-w-xl" : "max-w-4xl"}`}>
            <div className={format === "9:16" ? "aspect-[9/16]" : format === "1:1" ? "aspect-square" : "aspect-video"}>
              <Suspense fallback={<div className="flex h-full items-center justify-center text-white"><LoaderCircle className="animate-spin" /> A preparar o vídeo…</div>}>
                <Preview storyboard={storyboard} />
              </Suspense>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Play className="size-4" /> Usa os controlos do leitor para reproduzir e pausar.
          </div>
        </section>
      )}
    </div>
  );
}
