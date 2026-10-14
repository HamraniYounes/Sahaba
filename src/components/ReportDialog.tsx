import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui/button";
import { Label, Textarea } from "./ui/input";
import { FormMessage } from "./AuthCard";
import { createReport } from "../lib/api";
import { REPORT_REASONS } from "../lib/labels";
import { useAuth } from "../context/AuthContext";
import type { Location, ReportReason } from "../types";

export function ReportDialog({ location, onClose }: { location: Location; onClose: () => void }) {
  const { user } = useAuth();
  const [reason, setReason] = useState<ReportReason>("incorrect");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError("");
    try { await createReport(location.id, reason, comment, user?.id); setDone(true); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Signaler « ${location.name} »`} onClose={onClose}>
      {done ? (
        <div className="space-y-4"><FormMessage info="Merci, votre signalement a été transmis à l'équipe de modération." /><Button onClick={onClose}>Fermer</Button></div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <fieldset className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm"><input type="radio" name="reason" checked={reason === r.id} onChange={() => setReason(r.id)} />{r.label}</label>
            ))}
          </fieldset>
          <div><Label htmlFor="rc">Précisions (facultatif)</Label><Textarea id="rc" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} /></div>
          <FormMessage error={error} />
          <Button type="submit" disabled={busy} className="w-full">Envoyer le signalement</Button>
        </form>
      )}
    </Modal>
  );
}
