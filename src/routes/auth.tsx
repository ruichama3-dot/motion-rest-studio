import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Motion Rest" },
      { name: "description", content: "Entre ou crie a sua conta Motion Rest." },
      { property: "og:title", content: "Entrar — Motion Rest" },
      { property: "og:description", content: "Entre ou crie a sua conta Motion Rest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav({ to: "/app" });
  }, [user, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/app" } });
        if (error) throw error;
        toast.success("Verifique o seu email para confirmar a conta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error(r.error.message ?? "Falha no login com Google");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="glass fade-up w-full max-w-sm rounded-3xl p-8">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold">{mode === "in" ? "Bem-vindo de volta" : "Criar conta"}</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5"><Label htmlFor="e">Email</Label><Input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="p">Palavra-passe</Label><Input id="p" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={busy}>{mode === "in" ? "Entrar" : "Criar conta"}</Button>
        </form>
        <Button variant="outline" className="mt-3 w-full" onClick={google}>Continuar com Google</Button>
        <button className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Ainda não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
