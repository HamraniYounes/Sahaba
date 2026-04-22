// Types et interfaces TypeScript pour le frontend

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'GUEST' | 'USER' | 'MODERATOR' | 'ADMIN';
  avatar?: string;
}

export interface Location {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  website?: string;
  phone?: string;
  email?: string;
  description?: string;
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'CLAIMED';
  verified: boolean;
  verifiedAt?: string;
  categoryId: string;
  category: Category;
  metadata: LocationMetadata;
  openingHours?: OpeningHours;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  images: LocationImage[];
  createdAt: string;
  updatedAt: string;
}

export interface LocationMetadata {
  halalCertified?: boolean;
  halalType?: 'full' | 'partial';
  womenOnly?: boolean;
  alcoholFree?: boolean;
  prayerSpace?: boolean;
  capacity?: number;
  cateringService?: boolean;
  burkiniFriendly?: boolean;
  womenOnlyPool?: boolean;
  womenOnlyHours?: {
    start: string;
    end: string;
    days: string[];
  };
}

export interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface LocationImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase: boolean;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface Favorite {
  id: string;
  locationId: string;
  location: Location;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export type Page = 'home' | 'login' | 'register' | 'propose' | 'profile' | 'favorites' | 'admin';

export interface SearchFilters {
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  category?: string;
  isOpenNow?: boolean;
  halalCertified?: boolean;
  womenOnly?: boolean;
  alcoholFree?: boolean;
  prayerSpace?: boolean;
  page?: number;
  limit?: number;
  sort?: 'name' | 'rating' | 'distance' | 'createdAt';
  order?: 'asc' | 'desc';
}