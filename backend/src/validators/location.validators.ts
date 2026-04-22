// Validateurs Zod pour les lieux

import { z } from 'zod';

const metadataSchema = z.object({
  halalCertified: z.boolean().optional(),
  halalType: z.enum(['full', 'partial']).optional(),
  womenOnly: z.boolean().optional(),
  alcoholFree: z.boolean().optional(),
  prayerSpace: z.boolean().optional(),
  capacity: z.number().int().positive().optional(),
  cateringService: z.boolean().optional(),
  burkiniFriendly: z.boolean().optional(),
  womenOnlyPool: z.boolean().optional(),
}).optional();

const dayHoursSchema = z.object({
  open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide'),
  close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide'),
  closed: z.boolean().optional(),
}).optional();

const openingHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
}).optional();

export const createLocationSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
    categoryId: z.string().uuid('ID de catégorie invalide'),
    address: z.string()
      .min(5, 'L\'adresse doit contenir au moins 5 caractères'),
    city: z.string()
      .min(2, 'La ville doit contenir au moins 2 caractères'),
    postalCode: z.string().optional(),
    country: z.string().default('Belgique'),
    phone: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    website: z.string().url('URL invalide').optional().or(z.literal('')),
    description: z.string().max(2000, 'La description ne peut pas dépasser 2000 caractères').optional(),
    metadata: metadataSchema,
    openingHours: openingHoursSchema,
  }),
});

export const updateLocationSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(200, 'Le nom ne peut pas dépasser 200 caractères')
      .optional(),
    address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères').optional(),
    city: z.string().min(2, 'La ville doit contenir au moins 2 caractères').optional(),
    postalCode: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    website: z.string().url('URL invalide').optional().or(z.literal('')),
    description: z.string().max(2000, 'La description ne peut pas dépasser 2000 caractères').optional(),
    metadata: metadataSchema,
    openingHours: openingHoursSchema,
  }),
  params: z.object({
    id: z.string().uuid('ID de lieu invalide'),
  }),
});

export const searchLocationsSchema = z.object({
  query: z.object({
    lat: z.string().transform(Number).optional(),
    lng: z.string().transform(Number).optional(),
    radius: z.string().transform(Number).optional(),
    city: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(['PENDING', 'PUBLISHED', 'REJECTED', 'CLAIMED']).optional(),
    isOpenNow: z.string().transform(val => val === 'true').optional(),
    halalCertified: z.string().transform(val => val === 'true').optional(),
    womenOnly: z.string().transform(val => val === 'true').optional(),
    alcoholFree: z.string().transform(val => val === 'true').optional(),
    prayerSpace: z.string().transform(val => val === 'true').optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
    sort: z.enum(['name', 'rating', 'distance', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export const moderateLocationSchema = z.object({
  body: z.object({
    status: z.enum(['PUBLISHED', 'REJECTED']),
    rejectionReason: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid('ID de lieu invalide'),
  }),
});