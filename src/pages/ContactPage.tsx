import { useState } from "react";
import { FormMessage } from "../components/AuthCard";
import { Button } from "../components/ui/button";
import { Input, Label, Textarea } from "../components/ui/input";
import { sendContact } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function ContactPage() {
  const { user } = useAuth();
  const [f, setF] = useState({ name: user?.name ?? "", email: user?.email ?? "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError("");
    try { await sendContact(f); setDone(true); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-1">Contact</h1>
      <p className="text-slate-600 mb-6">Une question, une suggestion, un problème ? Écrivez-nous.</p>
      {done ? <FormMessage info="Merci ! Votre message a bien été envoyé." /> : (
        <form onSubmit={submit} className="space-y-4 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label htmlFor="n">Nom</Label><Input id="n" required value={f.name} onChange={set("name")} /></div>
            <div><Label htmlFor="e">Email</Label><Input id="e" type="email" required value={f.email} onChange={set("email")} /></div>
          </div>
          <div><Label htmlFor="s">Sujet</Label><Input id="s" value={f.subject} onChange={set("subject")} /></div>
          <div><Label htmlFor="m">Message</Label><Textarea id="m" rows={5} required maxLength={3000} value={f.message} onChange={set("message")} /></div>
          <FormMessage error={error} />
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Envoi…" : "Envoyer"}</Button>
        </form>
      )}
    </div>
  );
}
