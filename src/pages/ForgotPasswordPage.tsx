import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthCard, FormMessage } from "../components/AuthCard";
import { Button } from "../components/ui/button";
import { Input, Label } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export function ForgotPasswordPage() {
  const { sendResetEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(""); setInfo("");
    try { await sendResetEmail(email.trim()); setInfo("Si un compte existe pour cette adresse, un email de réinitialisation vient d'être envoyé."); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <AuthCard title="Mot de passe oublié" subtitle="Nous vous enverrons un lien pour en choisir un nouveau.">
      <form onSubmit={submit} className="space-y-4">
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <FormMessage error={error} info={info} />
        <Button type="submit" className="w-full" disabled={busy}>Envoyer le lien</Button>
      </form>
      <p className="mt-4 text-sm text-center"><Link to="/login" className="text-forest underline">Retour à la connexion</Link></p>
    </AuthCard>
  );
}
