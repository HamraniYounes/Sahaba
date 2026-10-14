import { supabase } from "./supabase";
import { isOpenNow, normalizeHours, distanceKm } from "./hours";
import type {
  Ad, AdminUser, Category, Claim, Filters, Location, LocationMetadata, LocationStatus, ModerationSession,
  OpeningHours, OwnerReply, Report, ReportReason, Review, Role,
} from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}
function check(res: { error: { message: string } | null }) {
  if (res.error) throw new Error(res.error.message);
}

/* ───────────── Mapping ───────────── */
export function mapLocation(r: Row): Location {
  return {
    id: r.id, slug: r.slug, name: r.name, categoryId: r.category_id,
    address: r.address, city: r.city, postalCode: r.postal_code, country: r.country,
    latitude: r.latitude, longitude: r.longitude,
    phone: r.phone, email: r.email, website: r.website, description: r.description,
    photoUrl: r.photo_url, photos: r.photos ?? [],
    openingHours: normalizeHours(r.opening_hours),
    priceRange: r.price_range, metadata: r.metadata ?? {},
    status: r.status, flagged: r.flagged, moderationNote: r.moderation_note, verified: r.verified,
    ownerId: r.owner_id, createdBy: r.created_by,
    ratingAvg: Number(r.rating_avg ?? 0), reviewCount: r.review_count ?? 0,
    viewCount: r.view_count ?? 0, favoriteCount: r.favorite_count ?? 0,
    createdAt: r.created_at,
  };
}
const mapReply = (r: Row): OwnerReply => ({ id: r.id, reviewId: r.review_id, content: r.content, hidden: r.hidden, createdAt: r.created_at });

/* ───────────── Catégories ───────────── */
export async function fetchCategories(): Promise<Category[]> {
  return unwrap(await supabase.from("categories").select("id,name,icon").order("sort")) ?? [];
}

/* ───────────── Lieux (public) ───────────── */
export async function fetchLocations(f: Filters): Promise<Location[]> {
  let q = supabase.from("locations").select("*").in("status", ["PUBLISHED", "CLAIMED"]);
  if (f.category !== "all") q = q.eq("category_id", f.category);
  if (f.city.trim()) q = q.ilike("city", `%${f.city.trim()}%`);
  if (f.priceRange) q = q.eq("price_range", f.priceRange);
  if (f.query.trim()) {
    const t = f.query.trim().replace(/[%,()]/g, " ");
    q = q.or(`name.ilike.%${t}%,address.ilike.%${t}%,city.ilike.%${t}%,description.ilike.%${t}%`);
  }
  for (const k of f.meta) q = q.contains("metadata", { [k]: true });
  const rows = unwrap(await q.order("created_at", { ascending: false }).limit(1000)) as Row[];
  let list = (rows ?? []).map(mapLocation);

  if (f.openNow) list = list.filter((l) => isOpenNow(l.openingHours) === true);
  if (f.near) {
    const near = f.near;
    list = list
      .map((l) => ({ l, d: l.latitude != null && l.longitude != null ? distanceKm(near, { lat: l.latitude, lng: l.longitude }) : Infinity }))
      .filter((x) => x.d <= f.radiusKm)
      .map((x) => Object.assign(x.l, { distanceKm: x.d }));
  }
  switch (f.sort) {
    case "rating": list.sort((a, b) => b.ratingAvg - a.ratingAvg || b.reviewCount - a.reviewCount); break;
    case "date": list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break;
    case "distance":
      if (f.near) list.sort((a, b) => ((a as any).distanceKm ?? 1e9) - ((b as any).distanceKm ?? 1e9));
      break;
    default: // pertinence : mieux notés, plus consultés, plus favoris
      list.sort((a, b) => (b.ratingAvg * 2 + Math.log1p(b.viewCount) + Math.log1p(b.favoriteCount)) - (a.ratingAvg * 2 + Math.log1p(a.viewCount) + Math.log1p(a.favoriteCount)));
  }
  return list;
}

export function distanceOf(l: Location): number | null {
  const d = (l as any).distanceKm;
  return typeof d === "number" && isFinite(d) ? d : null;
}

export async function fetchLocationBySlug(slug: string): Promise<Location | null> {
  const row = unwrap(await supabase.from("locations").select("*").eq("slug", slug).maybeSingle());
  return row ? mapLocation(row as Row) : null;
}

export async function incrementView(id: string) {
  await supabase.rpc("increment_view", { loc: id });
}

/* ───────────── Avis & réponses ───────────── */
export async function fetchReviews(locationId: string): Promise<Review[]> {
  const rows = unwrap(
    await supabase.from("reviews").select("id, location_id, user_id, rating, comment, created_at")
      .eq("location_id", locationId).order("created_at", { ascending: false })
  ) as Row[];
  if (!rows?.length) return [];
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const [profiles, replies] = await Promise.all([
    supabase.from("public_profiles").select("id,name").in("id", ids),
    supabase.from("owner_replies").select("*").eq("location_id", locationId),
  ]);
  const names = new Map<string, string>(((profiles.data ?? []) as Row[]).map((p) => [p.id, p.name]));
  const reps = new Map<string, OwnerReply>(((replies.data ?? []) as Row[]).map((r) => [r.review_id, mapReply(r)]));
  return rows.map((r) => ({
    id: r.id, locationId: r.location_id, userId: r.user_id,
    userName: names.get(r.user_id) || "Membre", rating: r.rating, comment: r.comment, createdAt: r.created_at,
    reply: reps.get(r.id) ?? null,
  }));
}
export async function upsertReview(locationId: string, userId: string, rating: number, comment: string) {
  check(await supabase.from("reviews").upsert(
    { location_id: locationId, user_id: userId, rating, comment: comment.trim() || null }, { onConflict: "location_id,user_id" }));
}
export async function deleteReview(id: string) { check(await supabase.from("reviews").delete().eq("id", id)); }

export async function upsertReply(reviewId: string, locationId: string, ownerId: string, content: string) {
  check(await supabase.from("owner_replies").upsert(
    { review_id: reviewId, location_id: locationId, owner_id: ownerId, content: content.trim() }, { onConflict: "review_id" }));
}
export async function setReplyHidden(id: string, hidden: boolean) { check(await supabase.from("owner_replies").update({ hidden }).eq("id", id)); }
export async function deleteReply(id: string) { check(await supabase.from("owner_replies").delete().eq("id", id)); }

/* ───────────── Favoris ───────────── */
export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const rows = unwrap(await supabase.from("favorites").select("location_id").eq("user_id", userId)) as Row[];
  return (rows ?? []).map((r) => r.location_id);
}
export async function fetchFavoriteLocations(userId: string): Promise<Location[]> {
  const rows = unwrap(
    await supabase.from("favorites").select("locations(*)").eq("user_id", userId).order("created_at", { ascending: false })
  ) as Row[];
  return (rows ?? []).map((r) => r.locations).filter(Boolean).map(mapLocation);
}
export async function setFavorite(userId: string, locationId: string, on: boolean) {
  check(on
    ? await supabase.from("favorites").upsert({ user_id: userId, location_id: locationId })
    : await supabase.from("favorites").delete().eq("user_id", userId).eq("location_id", locationId));
}

/* ───────────── Photos ───────────── */
const MAX_PHOTO = 5 * 1024 * 1024;
export async function uploadPhoto(userId: string, file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Format non supporté (JPEG, PNG ou WebP).");
  if (file.size > MAX_PHOTO) throw new Error("Image trop lourde (5 Mo maximum).");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  check(await supabase.storage.from("location-photos").upload(path, file, { contentType: file.type, cacheControl: "31536000" }));
  return supabase.storage.from("location-photos").getPublicUrl(path).data.publicUrl;
}
export async function uploadClaimDocument(userId: string, file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Fichier trop lourd (10 Mo maximum).");
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${userId}/${crypto.randomUUID()}-${safe}`;
  check(await supabase.storage.from("claim-documents").upload(path, file, { contentType: file.type }));
  return path;
}
export async function claimDocumentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from("claim-documents").createSignedUrl(path, 300);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

/* ───────────── Soumission / édition ───────────── */
export interface LocationInput {
  name: string;
  categoryId: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  photoUrl?: string | null;
  photos?: string[];
  openingHours?: OpeningHours | null;
  priceRange?: number | null;
  metadata: LocationMetadata;
  latitude?: number | null;
  longitude?: number | null;
}

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Géocodage Nominatim (OpenStreetMap) */
export async function geocode(address: string, city: string, postalCode?: string, country = "Belgique") {
  const params = new URLSearchParams({ format: "json", limit: "1", street: address, city, country });
  if (postalCode) params.set("postalcode", postalCode);
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { "Accept-Language": "fr" } });
  if (!res.ok) throw new Error("Géocodage indisponible");
  const data = (await res.json()) as { lat: string; lon: string }[];
  if (!data.length) throw new Error("Adresse introuvable. Vérifiez l'adresse, la ville et le code postal.");
  return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
}

function toRow(i: LocationInput) {
  return {
    name: i.name.trim(), category_id: i.categoryId, address: i.address.trim(), city: i.city.trim(),
    postal_code: i.postalCode?.trim() || null, country: i.country?.trim() || "Belgique",
    phone: i.phone?.trim() || null, email: i.email?.trim() || null, website: i.website?.trim() || null,
    description: i.description?.trim() || null,
    photo_url: i.photoUrl ?? null, photos: i.photos ?? [],
    opening_hours: i.openingHours ?? null, price_range: i.priceRange || null, metadata: i.metadata,
  };
}

export async function submitLocation(input: LocationInput, userId: string) {
  let { latitude, longitude } = input;
  if (latitude == null || longitude == null) ({ latitude, longitude } = await geocode(input.address, input.city, input.postalCode, input.country));
  const slug = `${slugify(input.name)}-${slugify(input.city)}-${Math.random().toString(36).slice(2, 6)}`;
  check(await supabase.from("locations").insert({
    ...toRow(input), slug, latitude, longitude, status: "PENDING", verified: false, created_by: userId,
  }));
  return slug;
}

export async function updateLocation(id: string, input: LocationInput, regeocode: boolean) {
  const patch: Row = toRow(input);
  if (regeocode) Object.assign(patch, await geocode(input.address, input.city, input.postalCode, input.country));
  else if (input.latitude != null && input.longitude != null) { patch.latitude = input.latitude; patch.longitude = input.longitude; }
  check(await supabase.from("locations").update(patch).eq("id", id));
}

export async function fetchMyLocations(userId: string): Promise<Location[]> {
  const rows = unwrap(await supabase.from("locations").select("*")
    .or(`created_by.eq.${userId},owner_id.eq.${userId}`).order("created_at", { ascending: false })) as Row[];
  return (rows ?? []).map(mapLocation);
}
export async function fetchMyReviewCount(userId: string): Promise<number> {
  const { count } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", userId);
  return count ?? 0;
}
export interface MyReview { id: string; rating: number; comment?: string | null; createdAt: string; locationName: string; locationSlug: string }
export async function fetchMyReviews(userId: string): Promise<MyReview[]> {
  const rows = unwrap(await supabase.from("reviews").select("id,rating,comment,created_at,locations(name,slug)")
    .eq("user_id", userId).order("created_at", { ascending: false })) as Row[];
  return (rows ?? []).map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, createdAt: r.created_at, locationName: r.locations?.name ?? "", locationSlug: r.locations?.slug ?? "" }));
}

/* ───────────── Signalements & réclamations ───────────── */
export async function createReport(locationId: string, reason: ReportReason, comment: string, reporterId?: string) {
  check(await supabase.from("reports").insert({ location_id: locationId, reason, comment: comment.trim() || null, reporter_id: reporterId ?? null }));
}
export async function fetchReports(status: Report["status"]): Promise<Report[]> {
  const rows = unwrap(await supabase.from("reports").select("*, locations(name)").eq("status", status).order("created_at", { ascending: false })) as Row[];
  return (rows ?? []).map((r) => ({ id: r.id, locationId: r.location_id, locationName: r.locations?.name, reason: r.reason, comment: r.comment, status: r.status, createdAt: r.created_at }));
}
export async function setReportStatus(id: string, status: Report["status"]) {
  check(await supabase.from("reports").update({ status }).eq("id", id));
}

export async function createClaim(locationId: string, userId: string, message: string, files: File[], isTransfer: boolean) {
  const documents: string[] = [];
  for (const f of files) documents.push(await uploadClaimDocument(userId, f));
  check(await supabase.from("claims").insert({ location_id: locationId, user_id: userId, message: message.trim() || null, documents, is_transfer: isTransfer }));
}
export async function fetchClaims(status: Claim["status"]): Promise<Claim[]> {
  const rows = unwrap(await supabase.from("claims").select("*, locations(name)").eq("status", status).order("created_at", { ascending: false })) as Row[];
  const ids = [...new Set((rows ?? []).map((r) => r.user_id))];
  const names = new Map<string, string>();
  if (ids.length) {
    const { data } = await supabase.from("profiles").select("id,name,email").in("id", ids);
    for (const p of (data ?? []) as Row[]) names.set(p.id, `${p.name || "?"} (${p.email ?? ""})`);
  }
  return (rows ?? []).map((r) => ({
    id: r.id, locationId: r.location_id, locationName: r.locations?.name, userId: r.user_id, userName: names.get(r.user_id),
    message: r.message, documents: r.documents ?? [], isTransfer: r.is_transfer, status: r.status, adminNote: r.admin_note, createdAt: r.created_at,
  }));
}
export async function approveClaim(id: string) { check(await supabase.rpc("approve_claim", { claim: id })); }
export async function rejectClaim(id: string, note: string) {
  check(await supabase.from("claims").update({ status: "rejected", admin_note: note.trim() || null }).eq("id", id));
}
export async function fetchMyPendingClaimLocationIds(userId: string): Promise<string[]> {
  const rows = unwrap(await supabase.from("claims").select("location_id").eq("user_id", userId).eq("status", "pending")) as Row[];
  return (rows ?? []).map((r) => r.location_id);
}

/* ───────────── Publicité ───────────── */
export async function fetchActiveAds(placement: "home" | "detail"): Promise<Ad[]> {
  const rows = unwrap(await supabase.from("ads").select("*").eq("active", true).in("placement", [placement, "both"]).order("created_at", { ascending: false })) as Row[];
  return (rows ?? []).map(mapAd);
}
const mapAd = (r: Row): Ad => ({ id: r.id, title: r.title, description: r.description, cta: r.cta, url: r.url, imageUrl: r.image_url, placement: r.placement, active: r.active });
export async function fetchAllAds(): Promise<Ad[]> {
  return ((unwrap(await supabase.from("ads").select("*").order("created_at", { ascending: false })) as Row[]) ?? []).map(mapAd);
}
export async function saveAd(ad: Partial<Ad> & { title: string }) {
  const row = { title: ad.title, description: ad.description || null, cta: ad.cta || null, url: ad.url || null, image_url: ad.imageUrl || null, placement: ad.placement ?? "both", active: ad.active ?? true };
  check(ad.id ? await supabase.from("ads").update(row).eq("id", ad.id) : await supabase.from("ads").insert(row));
}
export async function deleteAd(id: string) { check(await supabase.from("ads").delete().eq("id", id)); }

/* ───────────── Contact ───────────── */
export async function sendContact(m: { name: string; email: string; subject: string; message: string }) {
  check(await supabase.from("contact_messages").insert({ name: m.name.trim(), email: m.email.trim(), subject: m.subject.trim() || null, message: m.message.trim() }));
}
export interface ContactMessage { id: string; name: string; email: string; subject?: string | null; message: string; createdAt: string }
export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const rows = unwrap(await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(50)) as Row[];
  return (rows ?? []).map((r) => ({ id: r.id, name: r.name, email: r.email, subject: r.subject, message: r.message, createdAt: r.created_at }));
}
export async function deleteContactMessage(id: string) { check(await supabase.from("contact_messages").delete().eq("id", id)); }

/* ───────────── Profil ───────────── */
export async function updateProfileName(userId: string, name: string) {
  check(await supabase.from("profiles").update({ name: name.trim() }).eq("id", userId));
}
export async function deleteMyAccount() { check(await supabase.rpc("delete_my_account")); await supabase.auth.signOut(); }

/* ───────────── Administration ───────────── */
export async function fetchAdminLocations(status?: LocationStatus): Promise<Location[]> {
  let q = supabase.from("locations").select("*");
  if (status) q = q.eq("status", status);
  const rows = unwrap(await q.order("created_at", { ascending: false }).limit(2000)) as Row[];
  return (rows ?? []).map(mapLocation);
}
export async function moderateLocation(id: string, patch: { status?: LocationStatus; verified?: boolean; flagged?: boolean; moderationNote?: string | null }) {
  const row: Row = {};
  if (patch.status) row.status = patch.status;
  if (patch.verified !== undefined) row.verified = patch.verified;
  if (patch.flagged !== undefined) row.flagged = patch.flagged;
  if (patch.moderationNote !== undefined) row.moderation_note = patch.moderationNote;
  check(await supabase.from("locations").update(row).eq("id", id));
}
export async function deleteLocation(id: string) { check(await supabase.from("locations").delete().eq("id", id)); }

/** Géocode en masse les lieux sans coordonnées (1 requête/s, limite Nominatim). */
export async function bulkGeocode(onProgress: (done: number, total: number, name: string) => void) {
  const rows = unwrap(await supabase.from("locations").select("id,name,address,city,postal_code,country").is("latitude", null).limit(500)) as Row[];
  let ok = 0;
  for (let i = 0; i < (rows?.length ?? 0); i++) {
    const r = rows[i];
    onProgress(i, rows.length, r.name);
    try {
      const g = await geocode(r.address, r.city, r.postal_code ?? undefined, r.country ?? "Belgique");
      check(await supabase.from("locations").update(g).eq("id", r.id));
      ok++;
    } catch { /* adresse introuvable : on passe */ }
    await new Promise((res) => setTimeout(res, 1100));
  }
  onProgress(rows?.length ?? 0, rows?.length ?? 0, "");
  return { total: rows?.length ?? 0, ok };
}
export async function countMissingCoords(): Promise<number> {
  const { count } = await supabase.from("locations").select("id", { count: "exact", head: true }).is("latitude", null);
  return count ?? 0;
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const rows = unwrap(await supabase.from("profiles").select("id,email,name,role,created_at").order("created_at", { ascending: false }).limit(1000)) as Row[];
  return (rows ?? []).map((r) => ({ id: r.id, email: r.email ?? "", name: r.name, role: r.role as Role, createdAt: r.created_at }));
}
export async function setUserRole(id: string, role: Role) { check(await supabase.from("profiles").update({ role }).eq("id", id)); }

export async function fetchSessions(): Promise<ModerationSession[]> {
  const rows = unwrap(await supabase.from("moderation_sessions").select("*").order("date", { ascending: true })) as Row[];
  return (rows ?? []).map((r) => ({ id: r.id, title: r.title, date: r.date, time: r.time, note: r.note }));
}
export async function createSession(s: { title: string; date: string; time?: string; note?: string }, userId: string) {
  check(await supabase.from("moderation_sessions").insert({ title: s.title.trim(), date: s.date, time: s.time || null, note: s.note?.trim() || null, created_by: userId }));
}
export async function deleteSession(id: string) { check(await supabase.from("moderation_sessions").delete().eq("id", id)); }

export interface TopContributor { userId: string; name: string; places: number }
export async function fetchTopContributors(): Promise<TopContributor[]> {
  const rows = unwrap(await supabase.from("locations").select("created_by").in("status", ["PUBLISHED", "CLAIMED"]).not("created_by", "is", null).limit(5000)) as Row[];
  const counts = new Map<string, number>();
  for (const r of rows ?? []) counts.set(r.created_by, (counts.get(r.created_by) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (!top.length) return [];
  const { data } = await supabase.from("public_profiles").select("id,name").in("id", top.map(([id]) => id));
  const names = new Map<string, string>(((data ?? []) as Row[]).map((p) => [p.id, p.name]));
  return top.map(([userId, places]) => ({ userId, name: names.get(userId) || "Membre", places }));
}
