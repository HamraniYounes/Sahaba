import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LocationCard } from "../components/LocationCard";
import { fetchCategories, fetchFavoriteLocations } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import type { Category, Location } from "../types";

export function FavoritesPage() {
  const { user } = useAuth();
  const { ids, toggle } = useFavorites();
  const [list, setList] = useState<Location[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchCategories().then(setCats).catch(() => undefined); }, []);
  useEffect(() => {
    if (!user) return;
    fetchFavoriteLocations(user.id).then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, [user, ids]);
  const catMap = useMemo(() => new Map(cats.map((c) => [c.id, c])), [cats]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Mes favoris</h1>
      {loading ? <p className="text-slate-500">Chargement…</p> : list.length === 0 ? (
        <p className="text-slate-500">Aucun favori pour l'instant. <Link to="/" className="underline text-forest">Explorer les lieux</Link></p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((l) => <LocationCard key={l.id} location={l} category={catMap.get(l.categoryId)} favorite={ids.has(l.id)} onToggleFavorite={(x) => { toggle(x.id); }} />)}
        </div>
      )}
    </div>
  );
}
