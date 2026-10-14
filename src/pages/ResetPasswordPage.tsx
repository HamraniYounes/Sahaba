import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard, FormMessage } from "../components/AuthCard";
import { Button } from "../components/ui/button";
import { Input, Label } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

/** Le lien reçu par email ouvre cette page avec une session de récupération (gérée par supabase-js). */
export function ResetPasswordPage() {
  const { user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas.");
    setBusy(true);
    try { await updatePassword(password); setInfo("Mot de passe mis à jour."); setTimeout(() => navigate("/"), 1200); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  if (!loading && !user) {
    return (
      <AuthCard title="Lien invalide ou expiré">
        <p className="text-sm text-slate-600 mb-4">Demandez un nouveau lien de réinitialisation.</p>
        <Link to="/forgot-password" className="text-forest underline text-sm">Mot de passe oublié</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Nouveau mot de passe">
      <form onSubmit={submit} className="space-y-4">
        <div><Label htmlFor="pw">Nouveau mot de passe</Label><Input id="pw" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div><Label htmlFor="pw2">Confirmer</Label><Input id="pw2" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
        <FormMessage error={error} info={info} />
        <Button type="submit" className="w-full" disabled={busy}>Enregistrer</Button>
      </form>
    </AuthCard>
  );
}
