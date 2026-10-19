import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutGrid, LogOut, Menu, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { createProject } from "@/lib/projects";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">A carregar…</div>;

  async function newVideo() {
    try {
      const id = await createProject("Novo vídeo");
      setOpen(false);
      nav({ to: "/app/projects/$id", params: { id } });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-6 px-2 pt-1"><Logo /></div>
      <Button onClick={newVideo} className="mb-4 justify-start"><Plus /> Criar novo vídeo</Button>
      <Link to="/app" activeOptions={{ exact: true }} onClick={() => setOpen(false)}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground">
        <LayoutGrid className="size-4" /> Projetos
      </Link>
      <div className="mt-auto border-t pt-4">
        <p className="truncate px-3 text-xs text-muted-foreground">{user.email}</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary">
          <LogOut className="size-4" /> Sair
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-secondary md:flex">
      <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 rounded-none border-y-0 border-l-0 md:block">{sidebar}</aside>
      <div className="glass sticky top-0 z-30 flex items-center justify-between rounded-none border-x-0 border-t-0 px-4 py-3 md:hidden">
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Menu"><Menu /></Button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 bg-foreground/30 md:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-72 bg-background" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-2"><Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fechar"><X /></Button></div>
            {sidebar}
          </aside>
        </div>
      )}
      <main className="min-w-0 flex-1"><Outlet /></main>
    </div>
  );
}
