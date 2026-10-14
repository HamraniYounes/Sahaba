import { useEffect, useState } from "react";
import { ImagePlus, LocateFixed, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input, Label, Textarea } from "./ui/input";
import { FormMessage } from "./AuthCard";
import { DAYS, META_KEYS, META_LABELS, PRICE_LABELS } from "../lib/labels";
import { fetchCategories, uploadPhoto, type LocationInput } from "../lib/api";
import type { Category, DayKey, Location, MetaKey, OpeningHours } from "../types";

const MAX_PHOTOS = 6;

interface DayState { closed: boolean; unknown: boolean; open: string; close: string }
const defaultDay = (): DayState => ({ closed: false, unknown: true, open: "09:00", close: "18:00" });

function hoursToState(h?: OpeningHours | null): Record<DayKey, DayState> {
  const out = {} as Record<DayKey, DayState>;
  for (const { key } of DAYS) {
    const slots = h?.[key];
    out[key] = !h || slots === undefined ? defaultDay()
      : slots.length === 0 ? { closed: true, unknown: false, open: "09:00", close: "18:00" }
      : { closed: false, unknown: false, open: slots[0].open, close: slots[0].close };
  }
  return out;
}
function stateToHours(s: Record<DayKey, DayState>): OpeningHours | null {
  if (DAYS.every(({ key }) => s[key].unknown)) return null;
  const h: OpeningHours = {};
  for (const { key } of DAYS) {
    const d = s[key];
    if (d.unknown) continue;
    h[key] = d.closed ? [] : [{ open: d.open, close: d.close }];
  }
  return h;
}

interface Props {
  userId: string;
  initial?: Location;
  submitLabel: string;
  onSubmit: (input: LocationInput, addressChanged: boolean) => Promise<void>;
}

export function LocationForm({ userId, initial, submitLabel, onSubmit }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [f, setF] = useState({
    name: initial?.name ?? "", categoryId: initial?.categoryId ?? "", address: initial?.address ?? "", city: initial?.city ?? "",
    postalCode: initial?.postalCode ?? "", country: initial?.country ?? "Belgique", phone: initial?.phone ?? "", email: initial?.email ?? "",
    website: initial?.website ?? "", description: initial?.description ?? "", priceRange: initial?.priceRange ?? 0,
  });
  const [meta, setMeta] = useState<Partial<Record<MetaKey, boolean>>>(initial?.metadata ?? {});
  const [hours, setHours] = useState(hoursToState(initial?.openingHours));
  const [photos, setPhotos] = useState<string[]>(initial ? [initial.photoUrl, ...initial.photos].filter((x): x is string => !!x) : []);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchCategories().then(setCategories).catch(() => undefined); }, []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const setDay = (k: DayKey, patch: Partial<DayState>) => setHours({ ...hours, [k]: { ...hours[k], ...patch } });

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true); setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) urls.push(await uploadPhoto(userId, file));
      setPhotos((p) => [...p, ...urls]);
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); }
  };

  const useMyPosition = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setCoords({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => setError("Impossible d'obtenir votre position.")
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.categoryId) return setError("Choisissez une catégorie.");
    setBusy(true); setError("");
    const addressChanged = !initial || initial.address !== f.address || initial.city !== f.city || (initial.postalCode ?? "") !== f.postalCode || initial.country !== f.country;
    try {
      await onSubmit({
        name: f.name, categoryId: f.categoryId, address: f.address, city: f.city, postalCode: f.postalCode, country: f.country,
        phone: f.phone, email: f.email, website: f.website, description: f.description, priceRange: Number(f.priceRange) || null,
        photoUrl: photos[0] ?? null, photos: photos.slice(1), openingHours: stateToHours(hours),
        metadata: Object.fromEntries(META_KEYS.filter((k) => meta[k]).map((k) => [k, true])),
        latitude: coords?.latitude ?? (addressChanged ? null : initial?.latitude ?? null),
        longitude: coords?.longitude ?? (addressChanged ? null : initial?.longitude ?? null),
      }, addressChanged && !coords);
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-6 bg-white rounded-2xl border border-slate-200 p-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label htmlFor="n">Nom du lieu *</Label><Input id="n" required value={f.name} onChange={set("name")} /></div>
        <div>
          <Label htmlFor="c">Catégorie *</Label>
          <select id="c" required value={f.categoryId} onChange={set("categoryId")} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">Choisir…</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold mb-1">Adresse</legend>
        <div><Label htmlFor="a">Rue et numéro *</Label><Input id="a" required value={f.address} onChange={set("address")} /></div>
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-2"><Label htmlFor="p">Code postal</Label><Input id="p" value={f.postalCode} onChange={set("postalCode")} /></div>
          <div className="col-span-4 sm:col-span-2"><Label htmlFor="v">Ville *</Label><Input id="v" required value={f.city} onChange={set("city")} /></div>
          <div className="col-span-6 sm:col-span-2"><Label htmlFor="co">Pays</Label><Input id="co" value={f.country} onChange={set("country")} /></div>
        </div>
        <button type="button" onClick={useMyPosition} className="inline-flex items-center gap-1.5 text-sm text-forest underline"><LocateFixed className="w-4 h-4" />Utiliser ma position GPS actuelle</button>
        {coords && <p className="text-xs text-slate-500">Position enregistrée ({coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}). Sinon l'adresse sera géolocalisée automatiquement.</p>}
      </fieldset>

      <fieldset className="grid sm:grid-cols-3 gap-4">
        <legend className="text-sm font-semibold mb-1">Contact</legend>
        <div><Label htmlFor="t">Téléphone</Label><Input id="t" type="tel" value={f.phone} onChange={set("phone")} /></div>
        <div><Label htmlFor="e">Email</Label><Input id="e" type="email" value={f.email} onChange={set("email")} /></div>
        <div><Label htmlFor="w">Site web</Label><Input id="w" type="url" placeholder="https://" value={f.website} onChange={set("website")} /></div>
      </fieldset>

      <div><Label htmlFor="d">Description</Label><Textarea id="d" rows={3} maxLength={2000} value={f.description} onChange={set("description")} /></div>

      <div>
        <Label htmlFor="pr">Gamme de prix</Label>
        <select id="pr" value={f.priceRange} onChange={set("priceRange")} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value={0}>Non applicable</option>{[1, 2, 3, 4].map((p) => <option key={p} value={p}>{PRICE_LABELS[p]}</option>)}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold mb-2">Caractéristiques</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {META_KEYS.map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(meta[k])} onChange={(e) => setMeta({ ...meta, [k]: e.target.checked })} />{META_LABELS[k]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold mb-2">Horaires d'ouverture <span className="font-normal text-slate-500">(un créneau par jour ; fermeture après minuit acceptée, ex. 18:00 → 02:00)</span></legend>
        <div className="space-y-2">
          {DAYS.map(({ key, label }) => {
            const d = hours[key];
            return (
              <div key={key} className="grid grid-cols-[5.5rem_1fr] sm:grid-cols-[6rem_9rem_1fr] items-center gap-2 text-sm">
                <span className="font-medium">{label}</span>
                <select value={d.unknown ? "unknown" : d.closed ? "closed" : "open"} onChange={(e) => setDay(key, { unknown: e.target.value === "unknown", closed: e.target.value === "closed" })}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5">
                  <option value="unknown">Non communiqué</option><option value="open">Ouvert</option><option value="closed">Fermé</option>
                </select>
                {!d.unknown && !d.closed && (
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
                    <Input type="time" value={d.open} onChange={(e) => setDay(key, { open: e.target.value })} className="w-32" />
                    <span>→</span>
                    <Input type="time" value={d.close} onChange={(e) => setDay(key, { close: e.target.value })} className="w-32" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold mb-2">Photos ({photos.length}/{MAX_PHOTOS}) — la première est la photo principale</legend>
        <div className="flex flex-wrap gap-3">
          {photos.map((u, i) => (
            <div key={u} className="relative">
              <img src={u} alt="" className="h-24 w-24 object-cover rounded-lg border border-slate-200" />
              {i === 0 && <span className="absolute left-1 top-1 text-[10px] bg-gold text-white rounded px-1">Principale</span>}
              <button type="button" aria-label="Retirer la photo" onClick={() => setPhotos(photos.filter((x) => x !== u))} className="absolute -right-2 -top-2 bg-white border border-slate-300 rounded-full p-0.5"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="h-24 w-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-xs text-slate-500 cursor-pointer hover:bg-slate-50">
              <ImagePlus className="w-5 h-5 mb-1" />{uploading ? "Envoi…" : "Ajouter"}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading} onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
            </label>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">JPEG, PNG ou WebP — 5 Mo maximum par photo.</p>
      </fieldset>

      <FormMessage error={error} />
      <Button type="submit" disabled={busy || uploading} className="w-full">{busy ? "Enregistrement…" : submitLabel}</Button>
    </form>
  );
}
