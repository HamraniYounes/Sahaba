import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Loader2, MapPinOff, Trash2 } from "lucide-react";
import { FormMessage } from "../../components/AuthCard";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";
import {
  bulkGeocode, countMissingCoords, createSession, deleteContactMessage, deleteSession, fetchAdminLocations,
  fetchContactMessages, fetchSessions, type ContactMessage,
} from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { ModerationSession } from "../../types";

export function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ PENDING: 0, PUBLISHED: 0, REJECTED: 0, CLAIMED: 0, flagged: 0 });
  const [missing, setMissing] = useState(0);
  const [geo, setGeo] = useState<{ done: number; total: number; name: string } | null>(null);
  const [geoRes, setGeoRes] = useState("");
  const [sessions, setSessions] = useState<ModerationSession[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [form, setForm] = useState({ title: "", date: "", time: "", note: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [locs, miss, ses, msgs] = await Promise.all([fetchAdminLocations(), countMissingCoords(), fetchSessions(), fetchContactMessages()]);
      const c = { PENDING: 0, PUBLISHED: 0, REJECTED: 0, CLAIMED: 0, flagged: 0 };
      for (const l of locs) { c[l.status]++; if (l.flagged) c.flagged++; }
      setCounts(c); setMissing(miss); setSessions(ses); setMessages(msgs);
    } catch (e) { setError((e as Error).message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const runGeo = async () => {
    setGeoRes(""); setGeo({ done: 0, total: missing, name: "" });
    try { const r = await bulkGeocode((done, total, name) => setGeo({ done, total, name })); setGeoRes(`${r.ok} / ${r.total} lieux géocodés.`); }
    catch (e) { setError((e as Error).message); }
    setGeo(null); load();
  };

  const stat = (label: string, n: number, to: string, warn = false) => (
    <Link to={to} className={`bg-white rounded-xl border p-4 hover:shadow-sm ${warn && n > 0 ? "border-amber-300" : "border-slate-200"}`}>
      <p className="text-2xl font-bold">{n}</p><p className="text-sm text-slate-500">{label}</p>
    </Link>
  );

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Tableau de bord</h1>
      <FormMessage error={error} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stat("À modérer", counts.PENDING, "/admin/moderation", true)}
        {stat("Publiés", counts.PUBLISHED + counts.CLAIMED, "/admin/places")}
        {stat("Refusés", counts.REJECTED, "/admin/places")}
        {stat("Signalés (≥ 3)", counts.flagged, "/admin/places", true)}
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-1"><MapPinOff className="w-4 h-4" />Géocodage en masse</h2>
        <p className="text-sm text-slate-600 mb-3">{missing} lieu{missing > 1 ? "x" : ""} sans coordonnées GPS (import). Géocodage via Nominatim, 1 requête par seconde.</p>
        <Button onClick={runGeo} disabled={!missing || !!geo}>{geo ? <><Loader2 className="w-4 h-4 animate-spin" />{geo.done}/{geo.total} {geo.name}</> : "Lancer le géocodage"}</Button>
        {geoRes && <p className="text-sm text-forest mt-2">{geoRes}</p>}
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-3"><CalendarPlus className="w-4 h-4" />Sessions de modération</h2>
        <form className="grid sm:grid-cols-5 gap-2 items-end mb-4" onSubmit={async (e) => {
          e.preventDefault();
          try { await createSession(form, user!.id); setForm({ title: "", date: "", time: "", note: "" }); load(); } catch (err) { setError((err as Error).message); }
        }}>
          <div className="sm:col-span-2"><Label htmlFor="st">Titre</Label><Input id="st" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label htmlFor="sd">Date</Label><Input id="sd" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><Label htmlFor="sh">Heure</Label><Input id="sh" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          <Button type="submit">Planifier</Button>
          <div className="sm:col-span-5"><Input placeholder="Note (facultatif)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
        </form>
        {sessions.length === 0 ? <p className="text-sm text-slate-500">Aucune session planifiée.</p> : (
          <ul className="divide-y divide-slate-100">{sessions.map((s) => (
            <li key={s.id} className="py-2 flex items-center justify-between gap-3 text-sm">
              <div><b>{s.title}</b> — {new Date(s.date).toLocaleDateString("fr-BE")}{s.time ? ` à ${s.time.slice(0, 5)}` : ""}{s.note && <span className="text-slate-500"> · {s.note}</span>}</div>
              <button aria-label="Supprimer" className="text-slate-400 hover:text-red-600" onClick={async () => { await deleteSession(s.id); load(); }}><Trash2 className="w-4 h-4" /></button>
            </li>))}</ul>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold mb-3">Messages de contact ({messages.length})</h2>
        {messages.length === 0 ? <p className="text-sm text-slate-500">Aucun message.</p> : (
          <ul className="divide-y divide-slate-100">{messages.map((m) => (
            <li key={m.id} className="py-3 text-sm">
              <div className="flex justify-between gap-3"><span><b>{m.name}</b> · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a>{m.subject && ` · ${m.subject}`}</span>
                <button aria-label="Supprimer" className="text-slate-400 hover:text-red-600" onClick={async () => { await deleteContactMessage(m.id); load(); }}><Trash2 className="w-4 h-4" /></button></div>
              <p className="text-slate-700 mt-1 whitespace-pre-line">{m.message}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(m.createdAt).toLocaleString("fr-BE")}</p>
            </li>))}</ul>
        )}
      </section>
    </div>
  );
}
