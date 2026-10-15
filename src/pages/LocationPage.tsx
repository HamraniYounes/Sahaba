import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Eye, ExternalLink, Flag, Heart, Mail, MapPin, Pencil, Phone, Shield, ShieldCheck, Star } from "lucide-react";
import { AdBanner } from "../components/AdBanner";
import { ClaimDialog } from "../components/ClaimDialog";
import { LocationForm } from "../components/LocationForm";
import { MapView } from "../components/MapView";
import { OpenBadge } from "../components/OpenBadge";
import { PhotoGallery } from "../components/PhotoGallery";
import { ReportDialog } from "../components/ReportDialog";
import { Reviews } from "../components/Reviews";
import { ShareButtons } from "../components/ShareButtons";
import { Button } from "../components/ui/button";
import { fetchCategories, fetchLocationBySlug, fetchMyPendingClaimLocationIds, incrementView, updateLocation } from "../lib/api";
import { formatSlots } from "../lib/hours";
import { safeHttpUrl } from "../lib/url";
import { activeBadges, DAYS, PRICE_LABELS } from "../lib/labels";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import type { Category, Location } from "../types";

export function LocationPage() {
  const { slug = "" } = useParams();
  const { user, isModerator } = useAuth();
  const { ids, toggle } = useFavorites();
  const navigate = useNavigate();
  const [l, setL] = useState<Location | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimPending, setClaimPending] = useState(false);

  const load = useCallback(async () => { const x = await fetchLocationBySlug(slug); setL(x); return x; }, [slug]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    load().then((x) => { if (active && x && (x.status === "PUBLISHED" || x.status === "CLAIMED")) incrementView(x.id); })
      .catch(() => setL(null)).finally(() => active && setLoading(false));
    fetchCategories().then(setCategories).catch(() => undefined);
    return () => { active = false; };
  }, [load]);
  useEffect(() => {
    if (user && l) fetchMyPendingClaimLocationIds(user.id).then((a) => setClaimPending(a.includes(l.id))).catch(() => undefined);
  }, [user, l?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const category = useMemo(() => categories.find((c) => c.id === l?.categoryId), [categories, l?.categoryId]);

  if (loading) return <p className="max-w-4xl mx-auto px-4 py-16 text-slate-500">Chargement…</p>;
  if (!l) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold mb-2">Lieu introuvable</h1>
      <p className="text-slate-600 mb-4">Ce lieu n'existe pas ou n'est pas encore publié.</p>
      <Link to="/"><Button>Retour à l'accueil</Button></Link>
    </div>
  );

  // propriétaire approuvé ou modérateur ; le créateur ne modifie que sa proposition non publiée et sans propriétaire
  const canEdit = !!user && (isModerator || l.ownerId === user.id
    || (l.createdBy === user.id && !l.ownerId && (l.status === "PENDING" || l.status === "REJECTED")));
  const isOwner = !!user && l.ownerId === user.id;
  const fav = ids.has(l.id);
  const photos = [l.photoUrl, ...l.photos].filter((x): x is string => !!x);
  const url = `${window.location.origin}/location/${l.slug}`;
  const published = l.status === "PUBLISHED" || l.status === "CLAIMED";
  const onFav = async () => { if ((await toggle(l.id)) === "login") navigate("/login"); };

  if (editing && user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => setEditing(false)} className="flex items-center gap-2 mb-4 text-forest"><ArrowLeft className="w-4 h-4" />Annuler</button>
        <h1 className="font-display text-2xl font-bold mb-4">Modifier « {l.name} »</h1>
        <LocationForm userId={user.id} initial={l} submitLabel="Enregistrer les modifications"
          onSubmit={async (input, regeocode) => { await updateLocation(l.id, input, regeocode); await load(); setEditing(false); }} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-forest"><ArrowLeft className="w-4 h-4" />Retour</Link>

      {!published && <p className="rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm p-3">Ce lieu n'est pas encore publié (statut : {l.status === "PENDING" ? "en attente de modération" : "refusé"}).{l.moderationNote && <> Note de modération : {l.moderationNote}</>}</p>}

      <PhotoGallery photos={photos} alt={l.name} />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-forest">{category?.name ?? l.categoryId}</p>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2 flex-wrap">
            {l.name}
            {l.status === "CLAIMED" && <span className="inline-flex items-center gap-1 text-xs font-sans font-medium bg-forest/10 text-forest rounded-full px-2.5 py-1"><ShieldCheck className="w-4 h-4" />Propriétaire vérifié</span>}
            {l.verified && <Shield className="w-5 h-5 text-forest" aria-label="Vérifié par la modération" />}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm flex-wrap">
            <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-gold text-gold" /><b>{l.reviewCount ? l.ratingAvg.toFixed(1) : "–"}</b><span className="text-slate-500">({l.reviewCount} avis)</span></span>
            <OpenBadge hours={l.openingHours} />
            {l.priceRange ? <span className="text-slate-500">{PRICE_LABELS[l.priceRange]}</span> : null}
            <span className="flex items-center gap-1 text-slate-500"><Eye className="w-4 h-4" />{l.viewCount}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onFav}><Heart className={`w-4 h-4 ${fav ? "fill-red-500 text-red-500" : ""}`} />{fav ? "Favori" : "Ajouter aux favoris"}</Button>
            {canEdit && <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="w-4 h-4" />Modifier</Button>}
          </div>
          <ShareButtons url={url} title={l.name} />
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {l.description && <p className="text-slate-700 whitespace-pre-line">{l.description}</p>}
          {activeBadges(l.metadata).length > 0 && (
            <div><h2 className="font-display text-xl font-bold mb-2">Caractéristiques</h2>
              <div className="flex flex-wrap gap-2">{activeBadges(l.metadata).map((b) => <span key={b} className="rounded-full bg-forest/10 px-3 py-1 text-sm text-forest">{b}</span>)}</div></div>
          )}
          <AdBanner placement="detail" />
          {published && <Reviews location={l} onChanged={() => { load(); }} />}
        </div>

        <aside className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 text-sm">
            <p className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{l.address}, {l.postalCode} {l.city}, {l.country}</p>
            {l.phone && <p className="flex gap-2"><Phone className="w-4 h-4 mt-0.5 shrink-0" /><a className="underline" href={`tel:${l.phone}`}>{l.phone}</a></p>}
            {l.email && <p className="flex gap-2"><Mail className="w-4 h-4 mt-0.5 shrink-0" /><a className="underline" href={`mailto:${l.email}`}>{l.email}</a></p>}
            {safeHttpUrl(l.website) && <p className="flex gap-2"><ExternalLink className="w-4 h-4 mt-0.5 shrink-0" /><a className="underline break-all" href={safeHttpUrl(l.website)!} target="_blank" rel="noreferrer noopener">{l.website}</a></p>}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h2 className="font-semibold flex items-center gap-2 mb-2"><Clock className="w-4 h-4" />Horaires</h2>
            <ul className="text-sm space-y-1">
              {DAYS.map((d) => <li key={d.key} className="flex justify-between gap-3"><span className="text-slate-600">{d.label}</span><span>{l.openingHours ? formatSlots(l.openingHours[d.key]) : "Non communiqué"}</span></li>)}
            </ul>
          </div>

          {l.latitude != null && l.longitude != null && (
            <div className="space-y-2">
              <MapView locations={[l]} selected={l} single className="h-56" />
              <a className="block text-center text-sm text-white bg-forest rounded-lg py-2" target="_blank" rel="noreferrer noopener"
                href={`https://www.openstreetmap.org/directions?to=${l.latitude},${l.longitude}`}>Itinéraire</a>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm">
            <button onClick={() => setReporting(true)} className="inline-flex items-center gap-2 text-slate-500 hover:text-red-600"><Flag className="w-4 h-4" />Signaler ce lieu</button>
            {published && !isOwner && (
              user ? (
                claimPending ? <span className="text-slate-500">Demande de réclamation en cours d'examen</span>
                  : <button onClick={() => setClaiming(true)} className="inline-flex items-center gap-2 text-forest underline">{l.ownerId ? "Demander un transfert de propriété" : "Vous gérez ce lieu ? Réclamez-le"}</button>
              ) : <Link to="/login" className="text-forest underline">Connectez-vous pour réclamer ce lieu</Link>
            )}
          </div>
        </aside>
      </div>

      {reporting && <ReportDialog location={l} onClose={() => setReporting(false)} />}
      {claiming && <ClaimDialog location={l} onClose={() => setClaiming(false)} onDone={() => setClaimPending(true)} />}
    </div>
  );
}
