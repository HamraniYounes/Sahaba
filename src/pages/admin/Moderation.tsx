import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { FormMessage } from "../../components/AuthCard";
import { LocationForm } from "../../components/LocationForm";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { deleteLocation, fetchAdminLocations, moderateLocation, updateLocation } from "../../lib/api";
import { activeBadges } from "../../lib/labels";
import { useAuth } from "../../context/AuthContext";
import type { Location, LocationStatus } from "../../types";

const tabs: { id: LocationStatus; label: string }[] = [
  { id: "PENDING", label: "À modérer" }, { id: "PUBLISHED", label: "Publiés" }, { id: "CLAIMED", label: "Réclamés" }, { id: "REJECTED", label: "Refusés" },
];

export function Moderation() {
  const { user } = useAuth();
  const [tab, setTab] = useState<LocationStatus>("PENDING");
  const [items, setItems] = useState<Location[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Location | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await fetchAdminLocations(tab)); } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }, [tab]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<void>) => { try { await fn(); await load(); } catch (e) { setError((e as Error).message); } };

  if (editing && user) {
    return (
      <div>
        <button onClick={() => setEditing(null)} className="mb-4 text-forest">← Retour à la file</button>
        <h1 className="font-display text-2xl font-bold mb-4">Modifier « {editing.name} »</h1>
        <LocationForm userId={user.id} initial={editing} submitLabel="Enregistrer"
          onSubmit={async (input, regeocode) => { await updateLocation(editing.id, input, regeocode); setEditing(null); load(); }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Modération</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium text-white ${tab === t.id ? "bg-gold" : "bg-forest"}`}>{t.label}</button>)}
      </div>
      <FormMessage error={error} />
      {loading ? <p className="text-slate-500">Chargement…</p> : items.length === 0 ? <p className="text-slate-500">Rien ici.</p> : (
        <ul className="space-y-3">
          {items.map((l) => (
            <li key={l.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0 flex gap-3">
                  {l.photoUrl && <img src={l.photoUrl} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" />}
                  <div className="min-w-0">
                    <Link to={`/location/${l.slug}`} className="font-semibold hover:underline">{l.name}</Link> <span className="text-xs text-slate-500">({l.categoryId})</span>
                    {l.flagged && <span className="ml-2 text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">Signalé</span>}
                    <p className="text-sm text-slate-600">{l.address}, {l.postalCode} {l.city}, {l.country}</p>
                    {l.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{l.description}</p>}
                    <div className="mt-1 flex flex-wrap gap-1">{activeBadges(l.metadata).map((b) => <span key={b} className="text-xs bg-forest/10 text-forest rounded-full px-2 py-0.5">{b}</span>)}</div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  {l.status !== "PUBLISHED" && l.status !== "CLAIMED" && <Button onClick={() => act(() => moderateLocation(l.id, { status: "PUBLISHED", verified: true, moderationNote: notes[l.id] ?? l.moderationNote ?? null }))}><Check className="w-4 h-4" />Publier</Button>}
                  {l.status !== "REJECTED" && <Button variant="outline" onClick={() => act(() => moderateLocation(l.id, { status: "REJECTED", verified: false, moderationNote: notes[l.id] ?? l.moderationNote ?? null }))}><X className="w-4 h-4" />Refuser</Button>}
                  <Button variant="outline" aria-label="Modifier" onClick={() => setEditing(l)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="danger" aria-label="Supprimer" onClick={() => { if (confirm(`Supprimer « ${l.name} » définitivement ?`)) act(() => deleteLocation(l.id)); }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <Input placeholder="Note de modération (visible par le créateur si refusé)" value={notes[l.id] ?? l.moderationNote ?? ""} onChange={(e) => setNotes({ ...notes, [l.id]: e.target.value })} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
