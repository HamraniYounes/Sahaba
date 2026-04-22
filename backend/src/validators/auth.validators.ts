// Validateurs Zod pour l'authentification

import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Adresse email invalide')
      .min(1, 'L\'email est requis'),
    password: z.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    name: z.string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    acceptTerms: z.boolean()
      .refine(val => val === true, 'Vous devez accepter les conditions d\'utilisation'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Adresse email invalide')
      .min(1, 'L\'email est requis'),
    password: z.string()
      .min(1, 'Le mot de passe est requis'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Le refresh token est requis'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères')
      .optional(),
    avatar: z.string().url('URL d\'avatar invalide').optional(),
  }),
});