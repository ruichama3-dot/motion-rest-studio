import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Film, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createProject, deleteProject, duplicateProject, listProjects, type Project } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Projetos — Motion Rest" },
      { name: "description", content: "Os seus projetos de vídeo Motion Rest." },
      { property: "og:title", content: "Projetos — Motion Rest" },
      { property: "og:description", content: "Os seus projetos de vídeo Motion Rest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const STATUS: Record<string, string> = { draft: "Rascunho", rendering: "A renderizar", done: "Exportado", failed: "Falhou" };

function Dashboard() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data, isLoading, error } = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const refresh = () => qc.invalidateQueries({ queryKey: ["projects"] });

  const create = useMutation({
    mutationFn: () => createProject("Novo vídeo"),
    onSuccess: (id) => nav({ to: "/app/projects/$id", params: { id } }),
    onError: (e) => toast.error(e.message),
  });
  const dup = useMutation({ mutationFn: duplicateProject, onSuccess: () => { toast.success("Projeto duplicado"); refresh(); }, onError: (e) => toast.error(e.message) });
  const del = useMutation({ mutationFn: deleteProject, onSuccess: () => { toast.success("Projeto eliminado"); refresh(); }, onError: (e) => toast.error(e.message) });

  return (
    <div className="mx-auto max-w-6xl p-5 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projetos</h1>
          <p className="mt-1 text-muted-foreground">Os seus vídeos, guardados e prontos a editar.</p>
        </div>
        <Button onClick={() => create.mutate()} disabled={create.isPending}><Plus /> Criar novo vídeo</Button>
      </div>

      {error && <p className="mt-8 text-destructive">Não foi possível carregar os projetos: {error.message}</p>}
      {isLoading && <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="aspect-video animate-pulse rounded-2xl bg-muted" />)}</div>}

      {data && data.length === 0 && (
        <div className="glass mt-10 flex flex-col items-center rounded-3xl px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent"><Film className="size-6 text-primary" /></div>
          <h2 className="mt-5 text-xl font-semibold">Ainda não há projetos</h2>
          <p className="mt-1 max-w-sm text-muted-foreground">Crie o primeiro vídeo e edite cada cena ao seu gosto.</p>
          <Button className="mt-6" disabled={create.isPending} onClick={() => create.mutate()}><Plus /> Criar novo vídeo</Button>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => <ProjectCard key={p.id} p={p} onDup={() => dup.mutate(p)} onDel={() => confirm(`Eliminar "${p.name}"?`) && del.mutate(p.id)} />)}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ p, onDup, onDel }: { p: Project; onDup: () => void; onDel: () => void }) {
  const first = p.storyboard?.scenes?.[0];
  return (
    <div className="glass fade-up group overflow-hidden rounded-2xl">
      <Link to="/app/projects/$id" params={{ id: p.id }} className="block">
        <div className="flex aspect-video items-center justify-center p-4 text-center" style={{ background: first?.background, color: first?.foreground }}>
          <span className="line-clamp-2 font-display text-lg font-bold">{first?.headline ?? p.name}</span>
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{p.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(p.created_at).toLocaleDateString("pt-PT")} · {Number(p.duration_seconds).toFixed(1)}s · {p.format} · {STATUS[p.status] ?? p.status}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Ações"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link to="/app/projects/$id" params={{ id: p.id }}><Pencil /> Abrir e editar</Link></DropdownMenuItem>
            <DropdownMenuItem onClick={onDup}><Copy /> Duplicar</DropdownMenuItem>
            <DropdownMenuItem onClick={onDel} className="text-destructive"><Trash2 /> Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
