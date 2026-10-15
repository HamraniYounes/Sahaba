import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeOff, Eye, MessageSquare, Star, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/input";
import { deleteReply, deleteReview, fetchReviews, setReplyHidden, upsertReply, upsertReview } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Location, Review } from "../types";

export function Reviews({ location: l, onChanged }: { location: Location; onChanged: () => void }) {
  const { user, isModerator } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const isOwner = !!user && l.ownerId === user.id;
  const load = useCallback(() => fetchReviews(l.id).then(setReviews).catch(() => setReviews([])), [l.id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const mine = reviews.find((r) => r.userId === user?.id);
    setRating(mine?.rating ?? 0); setComment(mine?.comment ?? "");
  }, [reviews, user?.id]);

  const run = async (fn: () => Promise<void>) => {
    setError("");
    try { await fn(); await load(); onChanged(); } catch (e) { setError((e as Error).message); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!rating) return setError("Choisissez une note.");
    setBusy(true);
    run(() => upsertReview(l.id, user.id, rating, comment)).finally(() => setBusy(false));
  };

  return (
    <section>
      <h2 className="font-display text-xl font-bold mb-3">Avis ({reviews.length})</h2>
      {isOwner ? <p className="mb-6 text-sm text-slate-500">Vous êtes propriétaire de ce lieu : vous pouvez répondre aux avis mais pas en publier un.</p> : (
      <form onSubmit={submit} className="space-y-2 mb-6 bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex gap-1" role="radiogroup" aria-label="Note">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} étoiles`}>
              <Star className={`w-7 h-7 ${n <= rating ? "fill-gold text-gold" : "text-slate-300"}`} />
            </button>
          ))}
        </div>
        <Textarea rows={2} placeholder={user ? "Votre commentaire (facultatif)" : "Connectez-vous pour laisser un avis"} value={comment} onChange={(e) => setComment(e.target.value)} disabled={!user} maxLength={1000} />
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <Button type="submit" disabled={busy}>{user ? "Publier mon avis" : "Se connecter"}</Button>
      </form>)}

      {reviews.length === 0 ? <p className="text-sm text-slate-500">Aucun avis pour le moment.</p> : (
        <ul className="space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.userName}</span>
                <span className="flex items-center gap-2">
                  <span className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />)}</span>
                  {(r.userId === user?.id || isModerator) && (
                    <button onClick={() => run(() => deleteReview(r.id))} aria-label="Supprimer l'avis" className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  )}
                </span>
              </div>
              {r.comment && <p className="text-slate-700 mt-1">{r.comment}</p>}
              <p className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString("fr-BE")}</p>

              {r.reply && (!r.reply.hidden || isModerator || isOwner) && (
                <div className={`mt-2 ml-4 border-l-2 pl-3 ${r.reply.hidden ? "border-red-300 opacity-60" : "border-forest"}`}>
                  <p className="text-xs font-medium text-forest">Réponse du propriétaire{r.reply.hidden ? " (masquée)" : ""}</p>
                  <p className="text-slate-700">{r.reply.content}</p>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    {isModerator && <button className="inline-flex items-center gap-1" onClick={() => run(() => setReplyHidden(r.reply!.id, !r.reply!.hidden))}>
                      {r.reply.hidden ? <><Eye className="w-3 h-3" />Afficher</> : <><EyeOff className="w-3 h-3" />Masquer</>}</button>}
                    {isOwner && <>
                      <button onClick={() => { setReplying(r.id); setReplyText(r.reply!.content); }}>Modifier</button>
                      <button onClick={() => run(() => deleteReply(r.reply!.id))}>Supprimer</button>
                    </>}
                  </div>
                </div>
              )}
              {isOwner && !r.reply && replying !== r.id && (
                <button className="mt-2 inline-flex items-center gap-1 text-xs text-forest" onClick={() => { setReplying(r.id); setReplyText(""); }}><MessageSquare className="w-3.5 h-3.5" />Répondre</button>
              )}
              {isOwner && replying === r.id && user && (
                <div className="mt-2 ml-4 space-y-2">
                  <Textarea rows={2} value={replyText} onChange={(e) => setReplyText(e.target.value)} maxLength={1000} />
                  <div className="flex gap-2">
                    <Button disabled={!replyText.trim()} onClick={() => run(async () => { await upsertReply(r.id, l.id, user.id, replyText); setReplying(null); })}>Publier</Button>
                    <Button variant="ghost" onClick={() => setReplying(null)}>Annuler</Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
