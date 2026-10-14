import { useState } from "react";
import { Loader2, LocateFixed, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "./ui/input";
import { META_KEYS, META_LABELS, PRICE_LABELS, QUICK_FILTERS } from "../lib/labels";
import type { Category, Filters, MetaKey, SortKey } from "../types";

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  categories: Category[];
}

export function FilterBar({ filters, setFilters, categories }: Props) {
  const [more, setMore] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  const toggleMeta = (k: MetaKey) => set({ meta: filters.meta.includes(k) ? filters.meta.filter((x) => x !== k) : [...filters.meta, k] });

  const locate = () => {
    if (!navigator.geolocation) return setGeoError("Géolocalisation non supportée par ce navigateur.");
    setLocating(true); setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocating(false); set({ near: { lat: p.coords.latitude, lng: p.coords.longitude }, sort: "distance" }); },
      () => { setLocating(false); setGeoError("Impossible d'obtenir votre position (autorisation refusée ?)."); },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const chip = (active: boolean) => `cursor-pointer rounded-full border px-3 py-1 text-sm select-none ${active ? "border-forest bg-forest/10 text-forest" : "border-slate-300 text-slate-600 bg-white"}`;

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input className="pl-9" placeholder="Rechercher un lieu, une adresse, une ville…" value={filters.query} onChange={(e) => set({ query: e.target.value })} />
          </div>
          <Input className="sm:w-48" placeholder="Ville" value={filters.city} onChange={(e) => set({ city: e.target.value })} />
          <button onClick={filters.near ? () => set({ near: null, sort: "relevance" }) : locate}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${filters.near ? "bg-forest text-white border-forest" : "bg-white text-slate-700 border-slate-300"}`}>
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : filters.near ? <X className="w-4 h-4" /> : <LocateFixed className="w-4 h-4" />}
            {filters.near ? "Autour de moi" : "Me localiser"}
          </button>
        </div>
        {geoError && <p className="text-sm text-red-600">{geoError}</p>}

        {filters.near && (
          <div className="flex items-center gap-3 text-sm">
            <label htmlFor="radius" className="text-slate-600 whitespace-nowrap">Rayon : <b>{filters.radiusKm} km</b></label>
            <input id="radius" type="range" min={1} max={100} value={filters.radiusKm} onChange={(e) => set({ radiusKm: Number(e.target.value) })} className="flex-1 accent-[#476E55]" />
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[{ id: "all", name: "Tous" }, ...categories].map((c) => (
            <button key={c.id} onClick={() => set({ category: c.id })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap text-white transition ${filters.category === c.id ? "bg-gold" : "bg-forest hover:opacity-90"}`}>{c.name}</button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {QUICK_FILTERS.map((k) => (
            <label key={k} className={chip(filters.meta.includes(k))}>
              <input type="checkbox" className="sr-only" checked={filters.meta.includes(k)} onChange={() => toggleMeta(k)} />{META_LABELS[k]}
            </label>
          ))}
          <label className={chip(filters.openNow)}>
            <input type="checkbox" className="sr-only" checked={filters.openNow} onChange={(e) => set({ openNow: e.target.checked })} />Ouvert maintenant
          </label>
          <button onClick={() => setMore(!more)} className="ml-auto inline-flex items-center gap-1.5 text-sm text-slate-600"><SlidersHorizontal className="w-4 h-4" />{more ? "Moins" : "Plus de filtres"}</button>
          <select aria-label="Tri" value={filters.sort} onChange={(e) => set({ sort: e.target.value as SortKey })} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm">
            <option value="relevance">Pertinence</option><option value="date">Plus récents</option><option value="rating">Mieux notés</option>
            <option value="distance" disabled={!filters.near}>Distance</option>
          </select>
        </div>

        {more && (
          <div className="rounded-xl bg-slate-50 p-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {META_KEYS.filter((k) => !QUICK_FILTERS.includes(k)).map((k) => (
                <label key={k} className={chip(filters.meta.includes(k))}>
                  <input type="checkbox" className="sr-only" checked={filters.meta.includes(k)} onChange={() => toggleMeta(k)} />{META_LABELS[k]}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Gamme de prix :</span>
              {[0, 1, 2, 3, 4].map((p) => (
                <button key={p} onClick={() => set({ priceRange: p })} className={chip(filters.priceRange === p)}>{p === 0 ? "Tous" : PRICE_LABELS[p]}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
