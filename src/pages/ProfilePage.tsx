import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, Eye, Heart, MapPin, MessageSquare, Star, Trash2 } from "lucide-react";
import { FormMessage } from "../components/AuthCard";
import { Modal } from "../components/Modal";
import { Button } from "../components/ui/button";
import { Input, Label } from "../components/ui/input";
import { deleteMyAccount, fetchFavoriteLocations, fetchMyLocations, fetchMyReviews, updateProfileName, type MyReview } from "../lib/api";
import { contributionBadge, STATUS_LABELS } from "../lib/labels";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import type { Location } from "../types";

type Tab = "favorites" | "reviews" | "owner" | "places";

export function ProfilePage() {
  const { user, refreshProfile, isModerator } = useAuth();
  const { ids } = useFavorites();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("favorites");
  const [name, setName] = useState(user?.name ?? "");
  const [msg, setMsg] = useState({ error: "", info: "" });
  const [favs, setFavs] = useState<Location[]>([]);
  const [mine, setMine] = useState<Location[]>([]);
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (user) fetchFavoriteLocations(user.id).then(setFavs).catch(() => setFavs([])); }, [user, ids]);
  useEffect(() => {
    if (!user) return;
    fetchMyLocations(user.id).then(setMine).catch(() => setMine([]));
    fetchMyReviews(user.id).then(setReviews).catch(() => setReviews([]));
  }, [user]);
  if (!user) return null;

  const created = mine.filter((l) => l.createdBy === user.id);
  const owned = mine.filter((l) => l.ownerId === user.id);
  const badge = contributionBadge(created.length, reviews.length);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await updateProfileName(user.id, name); await refreshProfile(); setMsg({ error: "", info: "Profil mis à jour." }); }
    catch (err) { setMsg({ error: (err as Error).message, info: "" }); }
  };
  const del = async () => {
    setDeleting(true);
    try { await deleteMyAccount(); navigate("/", { replace: true }); }
    catch (err) { setMsg({ error: (err as Error).message, info: "" }); setConfirmDelete(false); setDeleting(false); }
  };

  const tabBtn = (id: Tab, label: string, n: number) => (
    <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${tab === id ? "border-gold text-slate-900" : "border-transparent text-slate-500"}`}>{label} ({n})</button>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <header className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center font-display text-2xl font-bold">{(user.name || user.email)[0]?.toUpperCase()}</div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{user.name || "Mon profil"}</h1>
          <p className="text-sm text-slate-600">{user.email}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-forest"><Award className="w-4 h-4" />{badge.label}</p>
          <div className="mt-1 h-1.5 w-48 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gold" style={{ width: `${badge.pct}%` }} /></div>
          {badge.next && <p className="text-xs text-slate-500 mt-1">Prochain badge : {badge.next}</p>}
        </div>
        {isModerator && <Link to="/admin"><Button variant="outline">Espace modération</Button></Link>}
      </header>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[{ icon: MapPin, n: created.length, l: "Lieux ajoutés" }, { icon: MessageSquare, n: reviews.length, l: "Avis" }, { icon: Heart, n: favs.length, l: "Favoris" }].map(({ icon: I, n, l }) => (
          <div key={l} className="bg-white rounded-xl border border-slate-200 p-4"><I className="w-5 h-5 mx-auto text-forest mb-1" /><p className="text-2xl font-bold">{n}</p><p className="text-xs text-slate-500">{l}</p></div>
        ))}
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold mb-4">Informations</h2>
        <form onSubmit={save} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1"><Label htmlFor="name">Nom affiché</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <Button type="submit">Enregistrer</Button>
        </form>
        <div className="mt-3"><FormMessage error={msg.error} info={msg.info} /></div>
      </section>

      <section>
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide">
          {tabBtn("favorites", "Favoris", favs.length)}{tabBtn("reviews", "Mes avis", reviews.length)}
          {tabBtn("places", "Mes propositions", created.length)}{tabBtn("owner", "Mes établissements", owned.length)}
        </div>
        <div className="pt-4">
          {tab === "favorites" && (favs.length === 0 ? <p className="text-sm text-slate-500">Aucun favori.</p> : (
            <ul className="grid sm:grid-cols-2 gap-3">{favs.map((l) => <li key={l.id}><Link to={`/location/${l.slug}`} className="block bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm"><p className="font-medium">{l.name}</p><p className="text-sm text-slate-600">{l.address}, {l.city}</p></Link></li>)}</ul>
          ))}
          {tab === "reviews" && (reviews.length === 0 ? <p className="text-sm text-slate-500">Vous n'avez pas encore publié d'avis.</p> : (
            <ul className="space-y-3">{reviews.map((r) => (
              <li key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between"><Link className="font-medium underline" to={`/location/${r.locationSlug}`}>{r.locationName}</Link>
                  <span className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />)}</span></div>
                {r.comment && <p className="text-sm text-slate-700 mt-1">{r.comment}</p>}
              </li>))}</ul>
          ))}
          {tab === "places" && (created.length === 0 ? <p className="text-sm text-slate-500">Rien proposé pour l'instant. <Link className="underline text-forest" to="/submit">Proposer un lieu</Link></p> : (
            <ul className="space-y-2">{created.map((l) => (
              <li key={l.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
                <Link to={`/location/${l.slug}`} className="min-w-0"><p className="font-medium truncate">{l.name}</p><p className="text-sm text-slate-600">{l.city}</p></Link>
                <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_LABELS[l.status].cls}`}>{STATUS_LABELS[l.status].text}</span>
              </li>))}</ul>
          ))}
          {tab === "owner" && (owned.length === 0 ? <p className="text-sm text-slate-500">Vous n'êtes propriétaire d'aucun lieu. Ouvrez la fiche de votre établissement pour le réclamer.</p> : (
            <ul className="space-y-2">{owned.map((l) => (
              <li key={l.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
                <Link to={`/location/${l.slug}`} className="min-w-0"><p className="font-medium truncate">{l.name}</p>
                  <p className="text-sm text-slate-600 flex items-center gap-3"><span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{l.viewCount}</span><span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{l.favoriteCount}</span><span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{l.reviewCount ? l.ratingAvg.toFixed(1) : "–"} ({l.reviewCount})</span></p></Link>
                <Link to={`/location/${l.slug}`}><Button variant="outline">Gérer</Button></Link>
              </li>))}</ul>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="font-semibold text-red-800 mb-1">Supprimer mon compte</h2>
        <p className="text-sm text-slate-600 mb-3">Votre compte, vos avis et vos favoris seront supprimés définitivement. Les lieux que vous avez proposés restent dans l'annuaire, sans lien avec vous.</p>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 className="w-4 h-4" />Supprimer mon compte</Button>
      </section>

      {confirmDelete && (
        <Modal title="Supprimer votre compte ?" onClose={() => !deleting && setConfirmDelete(false)}>
          <p className="text-sm text-slate-600 mb-4">Cette action est irréversible.</p>
          <div className="flex gap-2"><Button variant="danger" disabled={deleting} onClick={del}>{deleting ? "Suppression…" : "Oui, supprimer"}</Button><Button variant="outline" disabled={deleting} onClick={() => setConfirmDelete(false)}>Annuler</Button></div>
        </Modal>
      )}
    </div>
  );
}
