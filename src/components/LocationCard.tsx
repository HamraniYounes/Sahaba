import { Heart, MapPin, Navigation, Shield, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Category, Location } from "../types";
import { activeBadges, PRICE_LABELS } from "../lib/labels";
import { distanceOf } from "../lib/api";
import { OpenBadge } from "./OpenBadge";

interface Props {
  location: Location;
  category?: Category;
  favorite: boolean;
  onToggleFavorite: (l: Location) => void;
  onHover?: (l: Location | null) => void;
  selected?: boolean;
}

export function LocationCard({ location: l, category, favorite, onToggleFavorite, onHover, selected }: Props) {
  const d = distanceOf(l);
  const near = d !== null && d < 1;
  return (
    <article
      onMouseEnter={() => onHover?.(l)} onMouseLeave={() => onHover?.(null)}
      className={`group rounded-2xl border bg-white overflow-hidden shadow-sm transition hover:shadow-md ${selected ? "border-gold ring-2 ring-gold/30" : near ? "border-forest ring-1 ring-forest/30" : "border-slate-200"}`}
    >
      <Link to={`/location/${l.slug}`} className="block">
        {l.photoUrl && <img src={l.photoUrl} alt={l.name} loading="lazy" className="h-36 w-full object-cover" />}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-forest">{category?.name ?? l.categoryId}</p>
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span className="truncate">{l.name}</span>
                {l.status === "CLAIMED" && <Shield className="w-4 h-4 text-forest shrink-0" aria-label="Propriétaire vérifié" />}
              </h3>
            </div>
            <OpenBadge hours={l.openingHours} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="w-4 h-4 shrink-0" /><span className="truncate">{l.address}, {l.city}</span></p>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-gold text-gold" /><b>{l.reviewCount ? l.ratingAvg.toFixed(1) : "–"}</b><span className="text-slate-500">({l.reviewCount})</span></span>
            {l.priceRange ? <span className="text-slate-500">{PRICE_LABELS[l.priceRange]}</span> : null}
            {d !== null && <span className={`ml-auto flex items-center gap-1 ${near ? "text-forest font-medium" : "text-slate-500"}`}><Navigation className="w-3.5 h-3.5" />{d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`}</span>}
          </div>
          {near && <p className="mt-2 text-xs text-forest bg-forest/10 rounded-md px-2 py-1">À moins d'1 km de vous</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeBadges(l.metadata).slice(0, 4).map((b) => <span key={b} className="rounded-full bg-forest/10 px-2 py-0.5 text-xs text-forest">{b}</span>)}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-3 -mt-1 flex justify-end">
        <button onClick={() => onToggleFavorite(l)} aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"} className="p-1.5 rounded-full hover:bg-slate-100">
          <Heart className={`w-5 h-5 ${favorite ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
        </button>
      </div>
    </article>
  );
}
