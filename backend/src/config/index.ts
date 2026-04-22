// Configuration de l'application

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sahaba',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  
  bcrypt: {
    saltRounds: 12,
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    authMaxRequests: 5,
  },
  
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  geocoding: {
    provider: process.env.GEOCODING_PROVIDER || 'osm', // 'google', 'mapbox', 'osm'
    apiKey: process.env.GEOCODING_API_KEY || '',
  },
};