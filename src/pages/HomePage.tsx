import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, List, Map as MapIcon, RefreshCw } from "lucide-react";
import { AdBanner } from "../components/AdBanner";
import { FilterBar } from "../components/FilterBar";
import { LocationCard } from "../components/LocationCard";
import { MapView } from "../components/MapView";
import { ShareButtons } from "../components/ShareButtons";
import { fetchCategories, fetchLocations } from "../lib/api";
import { supabaseConfigured } from "../lib/supabase";
import { useFavorites } from "../context/FavoritesContext";
import type { Category, Filters, Location } from "../types";

const initial: Filters = { query: "", city: "", category: "all", meta: [], openNow: false, priceRange: 0, sort: "relevance", radiusKm: 20, near: null };

export function HomePage() {
  const navigate = useNavigate();
  const { ids, toggle } = useFavorites();
  const [filters, setFilters] = useState<Filters>(initial);
  const [debounced, setDebounced] = useState<Filters>(initial);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [hovered, setHovered] = useState<Location | null>(null);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [loading, setLoading] = useState(supabaseConfigured);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => { const t = setTimeout(() => setDebounced(filters), 300); return () => clearTimeout(t); }, [filters]);
  useEffect(() => { if (supabaseConfigured) fetchCategories().then(setCategories).catch(() => undefined); }, []);
  useEffect(() => {
    if (!supabaseConfigured) return;
    let active = true;
    setLoading(true); setError("");
    fetchLocations(debounced)
      .then((r) => { if (active) setLocations(r); })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [debounced, reload]);

  // pull-to-refresh (mobile)
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const onTouchStart = (e: React.TouchEvent) => { if (window.scrollY === 0) startY.current = e.touches[0].clientY; };
  const onTouchMove = (e: React.TouchEvent) => { if (startY.current !== null) setPull(Math.max(0, Math.min(90, e.touches[0].clientY - startY.current))); };
  const onTouchEnd = () => { if (pull > 70) setReload((n) => n + 1); startY.current = null; setPull(0); };

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const onFav = useCallback(async (l: Location) => { if ((await toggle(l.id)) === "login") navigate("/login"); }, [toggle, navigate]);
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {pull > 0 && <div className="flex justify-center text-slate-500" style={{ height: pull / 2 }}><RefreshCw className={`w-5 h-5 ${pull > 70 ? "text-forest" : ""}`} /></div>}

      <section className="bg-gradient-to-br from-forest to-forest/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Les lieux de la communauté musulmane d'Europe</h1>
            <p className="mt-2 text-white/85 max-w-2xl">Restaurants halal, mosquées, écoles coraniques, commerces et services — proposés et évalués par la communauté.</p>
          </div>
          <div className="text-slate-900"><ShareButtons url={shareUrl} title="Sahaba — annuaire halal et musulman d'Europe" /></div>
        </div>
      </section>

      <FilterBar filters={filters} setFilters={setFilters} categories={categories} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{loading ? "Chargement…" : `${locations.length} lieu${locations.length > 1 ? "x" : ""}`}</p>
          <div className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden text-sm">
            <button onClick={() => setView("grid")} className={`px-3 py-1.5 inline-flex items-center gap-1.5 ${view === "grid" ? "bg-forest text-white" : ""}`}><List className="w-4 h-4" />Liste</button>
            <button onClick={() => setView("map")} className={`px-3 py-1.5 inline-flex items-center gap-1.5 ${view === "map" ? "bg-forest text-white" : ""}`}><MapIcon className="w-4 h-4" />Carte</button>
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</p>}
        {loading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
        {!loading && !error && locations.length === 0 && supabaseConfigured && <p className="text-slate-500">Aucun lieu ne correspond à votre recherche.</p>}

        <AdBanner placement="home" />

        {view === "map" ? (
          <MapView locations={locations} selected={hovered} near={debounced.near} radiusKm={debounced.near ? debounced.radiusKm : undefined} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((l) => (
              <LocationCard key={l.id} location={l} category={catMap.get(l.categoryId)} favorite={ids.has(l.id)} onToggleFavorite={onFav} onHover={setHovered} selected={hovered?.id === l.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
