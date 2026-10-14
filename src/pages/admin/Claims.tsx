import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { FormMessage } from "../../components/AuthCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { approveClaim, claimDocumentUrl, fetchClaims, rejectClaim } from "../../lib/api";
import type { Claim } from "../../types";

const tabs: { id: Claim["status"]; label: string }[] = [{ id: "pending", label: "En attente" }, { id: "approved", label: "Approuvées" }, { id: "rejected", label: "Rejetées" }];

export function Claims() {
  const [tab, setTab] = useState<Claim["status"]>("pending");
  const [items, setItems] = useState<Claim[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const load = useCallback(() => { fetchClaims(tab).then(setItems).catch((e: Error) => setError(e.message)); }, [tab]);
  useEffect(() => { load(); }, [load]);
  const act = async (fn: () => Promise<void>) => { try { await fn(); load(); } catch (e) { setError((e as Error).message); } };
  const open = async (path: string) => { try { window.open(await claimDocumentUrl(path), "_blank", "noopener"); } catch (e) { setError((e as Error).message); } };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Réclamations</h1>
      <div className="flex gap-2 mb-6">{tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium text-white ${tab === t.id ? "bg-gold" : "bg-forest"}`}>{t.label}</button>)}</div>
      <FormMessage error={error} />
      {items.length === 0 ? <p className="text-slate-500">Aucune réclamation.</p> : (
        <ul className="space-y-3">{items.map((c) => (
          <li key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <p className="font-medium">{c.locationName ?? c.locationId} {c.isTransfer && <span className="ml-1 text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">Transfert de propriété</span>}</p>
            <p className="text-sm text-slate-600">Demandeur : {c.userName ?? c.userId}</p>
            {c.message && <p className="text-sm text-slate-700 whitespace-pre-line">{c.message}</p>}
            <div className="flex flex-wrap gap-2">{c.documents.map((d, i) => <button key={d} onClick={() => open(d)} className="inline-flex items-center gap-1 text-sm underline text-forest"><FileText className="w-4 h-4" />Justificatif {i + 1}</button>)}</div>
            {c.adminNote && <p className="text-xs text-slate-500">Note : {c.adminNote}</p>}
            {c.status === "pending" && (
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Input placeholder="Motif du refus (facultatif)" value={notes[c.id] ?? ""} onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })} />
                <Button onClick={() => act(() => approveClaim(c.id))}>Approuver</Button>
                <Button variant="outline" onClick={() => act(() => rejectClaim(c.id, notes[c.id] ?? ""))}>Rejeter</Button>
              </div>
            )}
          </li>))}</ul>
      )}
    </div>
  );
}
