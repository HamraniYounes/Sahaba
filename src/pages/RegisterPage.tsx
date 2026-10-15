import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard, FormMessage } from "../components/AuthCard";
import { GoogleButton } from "../components/GoogleButton";
import { Button } from "../components/ui/button";
import { Input, Label } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

/** Inscription en 2 étapes : formulaire → code OTP reçu par email (Supabase « Confirm signup »). */
export function RegisterPage() {
  const { signUp, verifySignUpOtp, resendSignUpOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [asOwner, setAsOwner] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo("");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas.");
    setBusy(true);
    try {
      const { needsConfirmation } = await signUp(name.trim(), email.trim(), password, asOwner);
      if (needsConfirmation) setStep("otp"); else navigate("/", { replace: true });
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setInfo(""); setBusy(true);
    try { await verifySignUpOtp(email.trim(), code); navigate("/", { replace: true }); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  if (step === "otp") {
    return (
      <AuthCard title="Vérifiez votre email" subtitle={`Nous avons envoyé un code de confirmation à ${email}.`}>
        <form onSubmit={verify} className="space-y-4">
          <div><Label htmlFor="code">Code de vérification</Label>
            <Input id="code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} className="tracking-widest text-center text-lg" /></div>
          <FormMessage error={error} info={info} />
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Vérification…" : "Valider"}</Button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <button className="text-forest underline" onClick={async () => { setError(""); try { await resendSignUpOtp(email.trim()); setInfo("Un nouveau code vient d'être envoyé."); } catch (e) { setError((e as Error).message); } }}>Renvoyer le code</button>
          <button className="text-slate-500 underline" onClick={() => setStep("form")}>Modifier mon email</button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Créer un compte" subtitle="Rejoignez la communauté Sahaba.">
      <GoogleButton onError={setError} />
      <div className="my-4 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />ou<span className="h-px flex-1 bg-slate-200" /></div>
      <form onSubmit={submit} className="space-y-4">
        <div><Label htmlFor="name">Nom</Label><Input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label htmlFor="pw">Mot de passe</Label><Input id="pw" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div><Label htmlFor="pw2">Confirmer le mot de passe</Label><Input id="pw2" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={asOwner} onChange={(e) => setAsOwner(e.target.checked)} />
          <span>Je suis propriétaire ou gérant d'un établissement <span className="block text-xs text-slate-500">Vous pourrez réclamer votre fiche ; elle sera modifiable après vérification par notre équipe.</span></span>
        </label>
        <p className="text-xs text-slate-500">En vous inscrivant, vous acceptez les <Link className="underline" to="/legal/cgu">CGU</Link> et la <Link className="underline" to="/legal/rgpd">politique de confidentialité</Link>.</p>
        <FormMessage error={error} />
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Création…" : "S'inscrire"}</Button>
      </form>
      <p className="mt-4 text-sm text-center">Déjà inscrit ? <Link to="/login" className="text-forest underline">Se connecter</Link></p>
    </AuthCard>
  );
}
