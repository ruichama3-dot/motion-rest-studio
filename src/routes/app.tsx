import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen bg-secondary">
      <header className="glass sticky top-0 z-30 flex items-center justify-between border-x-0 border-t-0 px-4 py-3 md:px-8">
        <Logo />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-primary" />
          <span className="hidden sm:inline">Estúdio automático de vídeo IA</span>
          <Button asChild size="sm" variant="ghost">
            <Link to="/"><ArrowLeft className="size-4" /> Início</Link>
          </Button>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
