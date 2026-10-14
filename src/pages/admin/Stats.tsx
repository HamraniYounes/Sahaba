import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Eye, Heart, MapPin, MessageSquare } from "lucide-react";
import { FormMessage } from "../../components/AuthCard";
import { fetchAdminLocations, fetchCategories, fetchTopContributors, type TopContributor } from "../../lib/api";
import type { Category, Location } from "../../types";

const COLORS = ["#476E55", "#D4A843", "#7C9A87", "#B8893A", "#2F4B3A", "#E3C477", "#5E8A70", "#8C6A2A"];
const short = (s: string) => (s.length > 16 ? s.slice(0, 15) + "…" : s);

export function Stats() {
  const [locs, setLocs] = useState<Location[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [top, setTop] = useState<TopContributor[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([fetchAdminLocations(), fetchCategories(), fetchTopContributors()])
      .then(([l, c, t]) => { setLocs(l); setCats(c); setTop(t); }).catch((e: Error) => setError(e.message));
  }, []);

  const published = useMemo(() => locs.filter((l) => l.status === "PUBLISHED" || l.status === "CLAIMED"), [locs]);
  const totals = useMemo(() => ({
    places: published.length,
    views: published.reduce((s, l) => s + l.viewCount, 0),
    favs: published.reduce((s, l) => s + l.favoriteCount, 0),
    reviews: published.reduce((s, l) => s + l.reviewCount, 0),
  }), [published]);
  const byViews = useMemo(() => [...published].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8), [published]);
  const byFavs = useMemo(() => [...published].sort((a, b) => b.favoriteCount - a.favoriteCount).slice(0, 8), [published]);
  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of published) m.set(l.categoryId, (m.get(l.categoryId) ?? 0) + 1);
    return [...m.entries()].map(([id, value]) => ({ name: cats.find((c) => c.id === id)?.name ?? id, value })).sort((a, b) => b.value - a.value);
  }, [published, cats]);

  const card = (I: typeof Eye, n: number, l: string) => <div className="bg-white rounded-xl border border-slate-200 p-4"><I className="w-5 h-5 text-forest mb-1" /><p className="text-2xl font-bold">{n}</p><p className="text-sm text-slate-500">{l}</p></div>;
  const bar = (data: Location[], key: "viewCount" | "favoriteCount", color: string) => (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data.map((l) => ({ name: short(l.name), value: l[key] }))} layout="vertical" margin={{ left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
        <Tooltip /><Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Statistiques</h1>
      <FormMessage error={error} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{card(MapPin, totals.places, "Lieux publiés")}{card(Eye, totals.views, "Vues totales")}{card(Heart, totals.favs, "Favoris totaux")}{card(MessageSquare, totals.reviews, "Avis totaux")}</div>
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-slate-200 p-4"><h2 className="font-semibold mb-2">Lieux les plus consultés</h2>{bar(byViews, "viewCount", "#476E55")}</section>
        <section className="bg-white rounded-xl border border-slate-200 p-4"><h2 className="font-semibold mb-2">Lieux les plus mis en favoris</h2>{bar(byFavs, "favoriteCount", "#D4A843")}</section>
        <section className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="font-semibold mb-2">Répartition par catégorie</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={byCat} dataKey="value" nameKey="name" outerRadius={100} label={(e) => e.value}>{byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
          <ul className="text-xs grid grid-cols-2 gap-x-3">{byCat.map((c, i) => <li key={c.name} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{c.name} ({c.value})</li>)}</ul>
        </section>
        <section className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="font-semibold mb-2">Classement des contributeurs</h2>
          {top.length === 0 ? <p className="text-sm text-slate-500">Pas encore de contributions.</p> : (
            <ol className="space-y-1.5 text-sm">{top.map((t, i) => <li key={t.userId} className="flex justify-between"><span>{i + 1}. {t.name}</span><b>{t.places} lieu{t.places > 1 ? "x" : ""}</b></li>)}</ol>
          )}
          <h3 className="font-semibold mt-4 mb-2">Top lieux</h3>
          <ol className="space-y-1 text-sm">{byViews.slice(0, 5).map((l, i) => <li key={l.id} className="flex justify-between gap-2"><Link className="hover:underline truncate" to={`/location/${l.slug}`}>{i + 1}. {l.name}</Link><span className="text-slate-500 whitespace-nowrap">{l.viewCount} vues · {l.favoriteCount} ♥</span></li>)}</ol>
        </section>
      </div>
    </div>
  );
}
