// Routes des lieux

import { Router } from 'express';
import { 
  searchLocations, 
  getLocationById, 
  getLocationBySlug,
  createLocation, 
  updateLocation, 
  deleteLocation, 
  moderateLocation,
  getPendingLocations,
  getLocationsByUser 
} from '../controllers/location.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  createLocationSchema, 
  updateLocationSchema, 
  searchLocationsSchema,
  moderateLocationSchema 
} from '../validators/location.validators';

const router = Router();

// Routes publiques
router.get('/', validate(searchLocationsSchema), searchLocations);
router.get('/slug/:slug', getLocationBySlug);
router.get('/:id', getLocationById);

// Routes protégées (authentification requise)
router.post('/', authenticate, validate(createLocationSchema), createLocation);
router.get('/user/mine', authenticate, getLocationsByUser);
router.put('/:id', authenticate, validate(updateLocationSchema), updateLocation);
router.delete('/:id', authenticate, deleteLocation);

// Routes admin/modérateur
router.get('/admin/pending', authenticate, authorize('MODERATOR', 'ADMIN'), getPendingLocations);
router.patch('/admin/moderate/:id', authenticate, authorize('MODERATOR', 'ADMIN'), validate(moderateLocationSchema), moderateLocation);

export default router;