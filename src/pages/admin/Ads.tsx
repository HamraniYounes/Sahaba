import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { FormMessage } from "../../components/AuthCard";
import { Button } from "../../components/ui/button";
import { Input, Label, Textarea } from "../../components/ui/input";
import { deleteAd, fetchAllAds, saveAd } from "../../lib/api";
import type { Ad } from "../../types";

const empty: Partial<Ad> & { title: string } = { title: "", description: "", cta: "", url: "", imageUrl: "", placement: "both", active: true };

export function Ads() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [form, setForm] = useState<Partial<Ad> & { title: string }>(empty);
  const [error, setError] = useState("");
  const load = useCallback(() => { fetchAllAds().then(setAds).catch((e: Error) => setError(e.message)); }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try { await saveAd(form); setForm(empty); load(); } catch (err) { setError((err as Error).message); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Publicité</h1>
      <p className="text-sm text-slate-600">Annonces affichées sur l'accueil et/ou les fiches. Pour Google AdSense, ajoutez le script fourni par Google dans <code>index.html</code>.</p>
      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-4 grid sm:grid-cols-2 gap-3">
        <div><Label htmlFor="at">Titre *</Label><Input id="at" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label htmlFor="ap">Emplacement</Label>
          <select id="ap" value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value as Ad["placement"] })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="both">Accueil et fiches</option><option value="home">Accueil</option><option value="detail">Fiches</option></select></div>
        <div className="sm:col-span-2"><Label htmlFor="ad">Description</Label><Textarea id="ad" rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><Label htmlFor="ac">Texte du bouton</Label><Input id="ac" value={form.cta ?? ""} onChange={(e) => setForm({ ...form, cta: e.target.value })} /></div>
        <div><Label htmlFor="au">URL du bouton</Label><Input id="au" type="url" value={form.url ?? ""} onChange={(e) => setForm({ ...form, url: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label htmlFor="ai">URL de l'image</Label><Input id="ai" type="url" value={form.imageUrl ?? ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Active</label>
        <div className="sm:col-span-2 flex gap-2"><Button type="submit">{form.id ? "Mettre à jour" : "Créer l'annonce"}</Button>{form.id && <Button type="button" variant="ghost" onClick={() => setForm(empty)}>Annuler</Button>}</div>
      </form>
      <FormMessage error={error} />
      <ul className="space-y-2">{ads.map((a) => (
        <li key={a.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
          <div><p className="font-medium">{a.title} {!a.active && <span className="text-xs text-slate-500">(inactive)</span>}</p><p className="text-xs text-slate-500">Emplacement : {a.placement}</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => setForm(a)}>Modifier</Button>
            <Button variant="danger" aria-label="Supprimer" onClick={async () => { if (confirm("Supprimer cette annonce ?")) { await deleteAd(a.id); load(); } }}><Trash2 className="w-4 h-4" /></Button></div>
        </li>))}</ul>
    </div>
  );
}
