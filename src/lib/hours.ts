import type { DayKey, OpeningHours, TimeSlot } from "../types";

const ORDER: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]; // Date.getDay()
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0); };

/** Nettoie des horaires importés (texte libre, null, structure incomplète). */
export function normalizeHours(raw: unknown): OpeningHours | null {
  if (!raw || typeof raw !== "object") return null;
  const out: OpeningHours = {};
  let any = false;
  for (const k of ORDER) {
    const v = (raw as Record<string, unknown>)[k];
    if (!Array.isArray(v)) continue;
    const slots = v.filter((s): s is TimeSlot => !!s && typeof (s as TimeSlot).open === "string" && typeof (s as TimeSlot).close === "string"
      && /^\d{1,2}:\d{2}$/.test((s as TimeSlot).open) && /^\d{1,2}:\d{2}$/.test((s as TimeSlot).close));
    out[k] = slots; any = true;
  }
  return any ? out : null;
}

/** true/false, ou null si les horaires sont inconnus (NC). Gère les créneaux après minuit (close <= open). */
export function isOpenNow(hours: OpeningHours | null | undefined, now = new Date()): boolean | null {
  if (!hours) return null;
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = hours[ORDER[day]] ?? [];
  const yesterday = hours[ORDER[(day + 6) % 7]] ?? [];
  for (const s of today) {
    const o = toMin(s.open), c = toMin(s.close);
    if (c > o ? minutes >= o && minutes < c : minutes >= o) return true; // nocturne : ouvert jusqu'à minuit ici
  }
  for (const s of yesterday) {
    const o = toMin(s.open), c = toMin(s.close);
    if (c <= o && minutes < c) return true; // créneau d'hier qui déborde après minuit
  }
  return false;
}

export function formatSlots(slots: TimeSlot[] | undefined): string {
  if (!slots) return "Non communiqué";
  if (!slots.length) return "Fermé";
  return slots.map((s) => `${s.open} – ${s.close}`).join(", ");
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
