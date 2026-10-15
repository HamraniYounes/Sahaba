import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui/button";
import { Label, Textarea } from "./ui/input";
import { FormMessage } from "./AuthCard";
import { createClaim } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Location } from "../types";

export function ClaimDialog({ location, onClose, onDone }: { location: Location; onClose: () => void; onDone: () => void }) {
  const { user, canClaim, becomeOwner } = useAuth();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const transfer = !!location.ownerId;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!files.length) return setError("Joignez au moins un justificatif (registre de commerce, facture, bail…).");
    setBusy(true); setError("");
    try { await createClaim(location.id, user.id, message, files, transfer); setDone(true); onDone(); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };

  const upgrade = async () => {
    setBusy(true); setError("");
    try { await becomeOwner(); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };

  return (
    <Modal title={transfer ? "Demander le transfert de propriété" : "Réclamer ce lieu"} onClose={onClose}>
      {!canClaim ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Seuls les comptes <b>propriétaire</b> peuvent réclamer un lieu. Passez votre compte en propriétaire : cela ne donne aucun droit sur une fiche tant que la modération n'a pas validé votre réclamation.</p>
          <FormMessage error={error} />
          <div className="flex gap-2"><Button disabled={busy} onClick={upgrade}>{busy ? "…" : "Je suis propriétaire ou gérant"}</Button><Button variant="outline" onClick={onClose}>Annuler</Button></div>
        </div>
      ) : done ? (
        <div className="space-y-4"><FormMessage info="Votre demande a été envoyée. Nous reviendrons vers vous après vérification." /><Button onClick={onClose}>Fermer</Button></div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-slate-600">Vous gérez « {location.name} » ? Prouvez-le pour pouvoir modifier la fiche et répondre aux avis.{transfer && " Ce lieu a déjà un propriétaire : la demande sera examinée comme un transfert."}</p>
          <div><Label htmlFor="cm">Message</Label><Textarea id="cm" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} placeholder="Votre rôle, comment nous contacter…" /></div>
          <div>
            <Label htmlFor="cf">Justificatifs *</Label>
            <input id="cf" type="file" multiple accept="image/*,application/pdf" onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 5))} className="text-sm" />
            <p className="text-xs text-slate-500 mt-1">PDF ou images, 10 Mo max chacun. Ils restent privés (modération uniquement).</p>
          </div>
          <FormMessage error={error} />
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Envoi…" : "Envoyer la demande"}</Button>
        </form>
      )}
    </Modal>
  );
}
