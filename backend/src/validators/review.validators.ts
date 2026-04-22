// Validateurs Zod pour les avis

import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    locationId: z.string().uuid('ID de lieu invalide'),
    rating: z.number().int().min(1, 'La note minimale est 1').max(5, 'La note maximale est 5'),
    comment: z.string()
      .max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères')
      .optional(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'La note minimale est 1').max(5, 'La note maximale est 5').optional(),
    comment: z.string()
      .max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères')
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid('ID d\'avis invalide'),
  }),
});