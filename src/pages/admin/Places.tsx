import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Flag, Trash2 } from "lucide-react";
import { FormMessage } from "../../components/AuthCard";
import { Input } from "../../components/ui/input";
import { deleteLocation, fetchAdminLocations, moderateLocation } from "../../lib/api";
import { STATUS_LABELS } from "../../lib/labels";
import type { Location, LocationStatus } from "../../types";

type SortKey = "createdAt" | "status" | "name" | "viewCount";

export function Places() {
  const [items, setItems] = useState<Location[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LocationStatus | "all" | "flagged">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "createdAt", dir: -1 });
  const [error, setError] = useState("");

  const load = useCallback(() => { fetchAdminLocations().then(setItems).catch((e: Error) => setError(e.message)); }, []);
  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items
      .filter((l) => (status === "all" ? true : status === "flagged" ? l.flagged : l.status === status))
      .filter((l) => !t || `${l.name} ${l.city} ${l.address}`.toLowerCase().includes(t))
      .sort((a, b) => {
        const av = sort.key === "createdAt" ? +new Date(a.createdAt) : a[sort.key], bv = sort.key === "createdAt" ? +new Date(b.createdAt) : b[sort.key];
        return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
      });
  }, [items, q, status, sort]);

  const head = (key: SortKey, label: string) => (
    <th className="text-left px-3 py-2 font-medium cursor-pointer select-none whitespace-nowrap" onClick={() => setSort({ key, dir: sort.key === key ? (sort.dir === 1 ? -1 : 1) : 1 })}>
      {label}{sort.key === key && (sort.dir === 1 ? <ArrowUp className="inline w-3 h-3 ml-1" /> : <ArrowDown className="inline w-3 h-3 ml-1" />)}
    </th>
  );
  const act = async (fn: () => Promise<void>) => { try { await fn(); load(); } catch (e) { setError((e as Error).message); } };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Gestion des lieux <span className="text-base font-normal text-slate-500">({rows.length})</span></h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input placeholder="Rechercher (nom, ville, adresse)…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:w-48">
          <option value="all">Tous les statuts</option><option value="PENDING">En attente</option><option value="PUBLISHED">Publiés</option>
          <option value="CLAIMED">Réclamés</option><option value="REJECTED">Refusés</option><option value="flagged">Signalés</option>
        </select>
      </div>
      <FormMessage error={error} />
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr>{head("name", "Nom")}<th className="text-left px-3 py-2 font-medium">Ville</th>{head("status", "Statut")}{head("viewCount", "Vues")}{head("createdAt", "Créé le")}<th className="px-3 py-2" /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((l) => (
              <tr key={l.id}>
                <td className="px-3 py-2"><Link to={`/location/${l.slug}`} className="font-medium hover:underline">{l.name}</Link>{l.flagged && <Flag className="inline w-3.5 h-3.5 ml-1 text-amber-600" />}</td>
                <td className="px-3 py-2">{l.city}</td>
                <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[l.status].cls}`}>{STATUS_LABELS[l.status].text}</span></td>
                <td className="px-3 py-2">{l.viewCount}</td>
                <td className="px-3 py-2 whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString("fr-BE")}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right space-x-2">
                  {l.status === "PENDING" && <button className="text-forest underline" onClick={() => act(() => moderateLocation(l.id, { status: "PUBLISHED", verified: true }))}>Publier</button>}
                  {(l.status === "PUBLISHED" || l.status === "CLAIMED") && <button className="underline text-slate-600" onClick={() => act(() => moderateLocation(l.id, { status: "REJECTED", verified: false }))}>Dépublier</button>}
                  {l.flagged && <button className="underline text-slate-600" onClick={() => act(() => moderateLocation(l.id, { flagged: false }))}>Lever le signalement</button>}
                  <button aria-label="Supprimer" className="text-slate-400 hover:text-red-600 align-middle" onClick={() => { if (confirm(`Supprimer « ${l.name} » ?`)) act(() => deleteLocation(l.id)); }}><Trash2 className="inline w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Aucun résultat.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
