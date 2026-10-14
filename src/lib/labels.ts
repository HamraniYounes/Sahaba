import type { DayKey, LocationMetadata, MetaKey } from "../types";

export const META_LABELS: Record<MetaKey, string> = {
  halal_full: "100 % halal",
  alcohol_free: "Sans alcool",
  prayer_room: "Salle de prière",
  wudu_facilities: "Espace d'ablutions",
  women_only: "Réservé aux femmes",
  burkini_friendly: "Burkini accepté",
  vegetarian_options: "Options végétariennes",
  vegan_options: "Options véganes",
  accessible: "Accessible PMR",
  parking: "Parking",
};
export const META_KEYS = Object.keys(META_LABELS) as MetaKey[];
/** Filtres rapides affichés sur la page d'accueil */
export const QUICK_FILTERS: MetaKey[] = ["halal_full", "alcohol_free", "prayer_room", "women_only"];

export function activeBadges(m: LocationMetadata): string[] {
  return META_KEYS.filter((k) => m[k]).map((k) => META_LABELS[k]);
}

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Lundi" }, { key: "tue", label: "Mardi" }, { key: "wed", label: "Mercredi" },
  { key: "thu", label: "Jeudi" }, { key: "fri", label: "Vendredi" }, { key: "sat", label: "Samedi" },
  { key: "sun", label: "Dimanche" },
];

export const PRICE_LABELS = ["", "€", "€€", "€€€", "€€€€"];

export const REPORT_REASONS = [
  { id: "obsolete", label: "Informations obsolètes" },
  { id: "incorrect", label: "Informations incorrectes" },
  { id: "inappropriate", label: "Contenu inapproprié" },
  { id: "closed", label: "Lieu fermé définitivement" },
  { id: "other", label: "Autre" },
] as const;

export const STATUS_LABELS = {
  PENDING: { text: "En attente", cls: "bg-amber-100 text-amber-800" },
  PUBLISHED: { text: "Publié", cls: "bg-emerald-100 text-emerald-800" },
  REJECTED: { text: "Refusé", cls: "bg-red-100 text-red-800" },
  CLAIMED: { text: "Réclamé", cls: "bg-sky-100 text-sky-800" },
} as const;

/** Badge de contribution selon le nombre de lieux + avis */
export function contributionBadge(places: number, reviews: number) {
  const score = places * 3 + reviews;
  if (score >= 30) return { label: "Ambassadeur", next: null, pct: 100 };
  if (score >= 15) return { label: "Contributeur confirmé", next: "Ambassadeur", pct: Math.round(((score - 15) / 15) * 100) };
  if (score >= 5) return { label: "Contributeur", next: "Contributeur confirmé", pct: Math.round(((score - 5) / 10) * 100) };
  return { label: "Nouveau membre", next: "Contributeur", pct: Math.round((score / 5) * 100) };
}
