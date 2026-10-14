import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthCard, FormMessage } from "../components/AuthCard";
import { Button } from "../components/ui/button";
import { Input, Label } from "../components/ui/input";
import { GoogleButton } from "../components/GoogleButton";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await signIn(email.trim(), password); navigate(from, { replace: true }); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <AuthCard title="Connexion" subtitle="Heureux de vous revoir.">
      <GoogleButton onError={setError} />
      <div className="my-4 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />ou<span className="h-px flex-1 bg-slate-200" /></div>
      <form onSubmit={submit} className="space-y-4">
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label htmlFor="pw">Mot de passe</Label><Input id="pw" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <FormMessage error={error} />
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</Button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link to="/forgot-password" className="text-forest underline">Mot de passe oublié ?</Link>
        <Link to="/register" className="text-forest underline">Créer un compte</Link>
      </div>
    </AuthCard>
  );
}
