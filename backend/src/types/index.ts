// Types et interfaces TypeScript

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

export interface SearchFilters {
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  category?: string;
  status?: string;
  isOpenNow?: boolean;
  halalCertified?: boolean;
  womenOnly?: boolean;
  alcoholFree?: boolean;
  prayerSpace?: boolean;
  page?: number;
  limit?: number;
}

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}