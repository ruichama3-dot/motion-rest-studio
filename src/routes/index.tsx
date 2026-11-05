import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Film, Sparkles, Wand2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Motion Rest — Vídeos motion graphics com IA" },
      { name: "description", content: "Transforme uma descrição num storyboard animado e veja o resultado em pré-visualização." },
      { property: "og:title", content: "Motion Rest — Vídeos motion graphics com IA" },
      { property: "og:description", content: "Transforme uma descrição num vídeo animado, narrado e pronto a exportar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <Button asChild variant="ghost"><Link to="/app">Abrir estúdio</Link></Button>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-16 md:pt-28">
        <p className="fade-up mb-5 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          <span className="size-1.5 rounded-full bg-primary" /> Estúdio de motion graphics
        </p>
        <h1 className="fade-up max-w-3xl text-5xl font-bold leading-[1.02] md:text-7xl">
          Escreva a ideia.<br /><span className="text-primary">Receba o vídeo.</span>
        </h1>
        <p className="fade-up mt-6 max-w-xl text-lg text-muted-foreground">
          Descreva a sua ideia. A Gemini cria as cenas e o Remotion apresenta o vídeo em 9:16, 16:9 ou 1:1.
        </p>
        <div className="fade-up mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link to="/app">Criar um vídeo <ArrowRight /></Link></Button>
        </div>
        <div className="mt-24 grid gap-4 md:grid-cols-3">
          {[
            { i: Wand2, t: "Criação por IA", d: "A Gemini transforma a sua descrição num guião visual dividido por cenas." },
            { i: Film, t: "Pré-visualização animada", d: "Veja a composição em movimento com o motor Remotion, sem editar manualmente." },
            { i: Sparkles, t: "Formatos profissionais", d: "Crie versões verticais, horizontais e quadradas para as suas redes." },
          ].map(({ i: I, t, d }) => (
            <div key={t} className="glass rounded-2xl p-6">
              <I className="size-5 text-primary" />
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
