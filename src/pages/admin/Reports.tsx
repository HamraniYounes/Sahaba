import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FormMessage } from "../../components/AuthCard";
import { Button } from "../../components/ui/button";
import { fetchReports, setReportStatus } from "../../lib/api";
import { REPORT_REASONS } from "../../lib/labels";
import type { Report } from "../../types";

const tabs: { id: Report["status"]; label: string }[] = [{ id: "pending", label: "En attente" }, { id: "resolved", label: "Traités" }, { id: "dismissed", label: "Rejetés" }];

export function Reports() {
  const [tab, setTab] = useState<Report["status"]>("pending");
  const [items, setItems] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const load = useCallback(() => { fetchReports(tab).then(setItems).catch((e: Error) => setError(e.message)); }, [tab]);
  useEffect(() => { load(); }, [load]);
  const act = async (id: string, s: Report["status"]) => { try { await setReportStatus(id, s); load(); } catch (e) { setError((e as Error).message); } };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Signalements</h1>
      <div className="flex gap-2 mb-6">{tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium text-white ${tab === t.id ? "bg-gold" : "bg-forest"}`}>{t.label}</button>)}</div>
      <FormMessage error={error} />
      {items.length === 0 ? <p className="text-slate-500">Aucun signalement.</p> : (
        <ul className="space-y-3">{items.map((r) => (
          <li key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium"><Link to={`/admin/places`} className="hover:underline">{r.locationName ?? r.locationId}</Link> <span className="text-sm font-normal text-slate-500">— {REPORT_REASONS.find((x) => x.id === r.reason)?.label}</span></p>
              {r.comment && <p className="text-sm text-slate-700 mt-1">{r.comment}</p>}
              <p className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleString("fr-BE")}</p>
            </div>
            {r.status === "pending" && <div className="flex gap-2"><Button onClick={() => act(r.id, "resolved")}>Traité</Button><Button variant="outline" onClick={() => act(r.id, "dismissed")}>Rejeter</Button></div>}
          </li>))}</ul>
      )}
    </div>
  );
}
