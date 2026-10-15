export type Role = "USER" | "OWNER" | "MODERATOR" | "ADMIN";
export type LocationStatus = "PENDING" | "PUBLISHED" | "REJECTED" | "CLAIMED";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

/** Clés de métadonnées (booléens) d'un lieu */
export type MetaKey =
  | "halal_full" | "alcohol_free" | "women_only" | "prayer_room" | "wudu_facilities"
  | "burkini_friendly" | "vegetarian_options" | "vegan_options" | "accessible" | "parking";
export type LocationMetadata = Partial<Record<MetaKey, boolean>>;

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export interface TimeSlot { open: string; close: string }
export type OpeningHours = Partial<Record<DayKey, TimeSlot[]>>;

export interface Location {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  address: string;
  city: string;
  postalCode?: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  photoUrl?: string | null;
  photos: string[];
  openingHours?: OpeningHours | null;
  priceRange?: number | null;
  metadata: LocationMetadata;
  status: LocationStatus;
  flagged: boolean;
  moderationNote?: string | null;
  verified: boolean;
  ownerId?: string | null;
  createdBy?: string | null;
  ratingAvg: number;
  reviewCount: number;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
}

export interface OwnerReply {
  id: string;
  reviewId: string;
  content: string;
  hidden: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  reply?: OwnerReply | null;
}

export type ReportReason = "obsolete" | "incorrect" | "inappropriate" | "closed" | "other";
export interface Report {
  id: string;
  locationId: string;
  locationName?: string;
  reason: ReportReason;
  comment?: string | null;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export interface Claim {
  id: string;
  locationId: string;
  locationName?: string;
  userId: string;
  userName?: string;
  message?: string | null;
  documents: string[];
  isTransfer: boolean;
  status: "pending" | "approved" | "rejected";
  adminNote?: string | null;
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  description?: string | null;
  cta?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  placement: "home" | "detail" | "both";
  active: boolean;
}

export interface ModerationSession {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  note?: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export type SortKey = "relevance" | "date" | "rating" | "distance";

export interface Filters {
  query: string;
  city: string;
  category: string; // "all" ou id
  meta: MetaKey[];
  openNow: boolean;
  priceRange: number; // 0 = tous
  sort: SortKey;
  radiusKm: number;
  near: { lat: number; lng: number } | null;
}
