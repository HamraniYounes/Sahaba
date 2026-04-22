// Contrôleur des lieux (version complète avec géocodage)

import { Request, Response } from 'express';
import { prisma } from '../db/client';
import { geocodeAddress, calculateDistance } from '../utils/geocoding';
import { generateSlug } from '../utils/slug';
import { config } from '../config';

export const searchLocations = async (req: Request, res: Response) => {
  try {
    const {
      lat,
      lng,
      radius,
      city,
      category,
      status = 'PUBLISHED',
      isOpenNow,
      halalCertified,
      womenOnly,
      alcoholFree,
      prayerSpace,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
    } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), config.pagination.maxLimit);

    // Construire les filtres
    const where: any = { status };

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (category) {
      where.category = { slug: category };
    }

    // Filtres sur les métadonnées JSON
    const metadataFilters: any = {};
    
    if (halalCertified === true || halalCertified === 'true') {
      metadataFilters.halalCertified = true;
    }
    if (womenOnly === true || womenOnly === 'true') {
      metadataFilters.womenOnly = true;
    }
    if (alcoholFree === true || alcoholFree === 'true') {
      metadataFilters.alcoholFree = true;
    }
    if (prayerSpace === true || prayerSpace === 'true') {
      metadataFilters.prayerSpace = true;
    }

    if (Object.keys(metadataFilters).length > 0) {
      where.metadata = {
        path: ['$',
        equals: metadataFilters
      };
    }

    // Recherche spatiale
    let locations;
    let total;

    if (lat && lng && radius) {
      // Recherche par rayon
      const allLocations = await prisma.location.findMany({
        where,
        include: {
          category: true,
          reviews: { select: { rating: true } },
          images: { where: { isPrimary: true } },
        },
      });

      // Filtrer par distance
      locations = allLocations.filter(loc => {
        const distance = calculateDistance(
          Number(lat),
          Number(lng),
          loc.latitude,
          loc.longitude
        );
        return distance <= Number(radius);
      });

      // Trier par distance
      locations.sort((a, b) => {
        const distA = calculateDistance(Number(lat), Number(lng), a.latitude, a.longitude);
        const distB = calculateDistance(Number(lat), Number(lng), b.latitude, b.longitude);
        return distA - distB;
      });

      total = locations.length;
      locations = locations.slice(skip, skip + take);
    } else {
      // Recherche standard avec pagination
      const orderBy: any = {};
      orderBy[sort] = order;

      [locations, total] = await Promise.all([
        prisma.location.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            category: true,
            reviews: { select: { rating: true } },
            images: { where: { isPrimary: true } },
          },
        }),
        prisma.location.count({ where }),
      ]);
    }

    // Calculer les notes moyennes et le statut d'ouverture
    const locationsWithRating = locations.map(loc => {
      const avgRating = loc.reviews.length > 0
        ? loc.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / loc.reviews.length
        : null;

      // Calculer si le lieu est ouvert maintenant
      const isOpen = checkIfOpenNow(loc.openingHours as any);

      return {
        id: loc.id,
        slug: loc.slug,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        postalCode: loc.postalCode,
        country: loc.country,
        latitude: loc.latitude,
        longitude: loc.longitude,
        phone: loc.phone,
        website: loc.website,
        category: loc.category,
        rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: loc.reviews.length,
        image: loc.images[0]?.url || null,
        verified: loc.verified,
        metadata: loc.metadata,
        openingHours: loc.openingHours,
        isOpen,
      };
    });

    res.json({
      success: true,
      data: {
        data: locationsWithRating,
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Search locations error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche de lieux',
    });
  }
};

// Fonction utilitaire pour vérifier si le lieu est ouvert
function checkIfOpenNow(openingHours: any): boolean {
  if (!openingHours) return false;

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const dayHours = openingHours[currentDay];

  if (!dayHours || dayHours.closed) return false;

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = dayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime <= closeTime;
}

export const getLocationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { reviews: true, favorites: true },
        },
      },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Lieu non trouvé',
      });
    }

    // Calculer la note moyenne
    const avgRating = location.reviews.length > 0
      ? location.reviews.reduce((sum, r) => sum + r.rating, 0) / location.reviews.length
      : null;

    const isOpen = checkIfOpenNow(location.openingHours as any);

    res.json({
      success: true,
      data: {
        ...location,
        rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        isOpen,
      },
    });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du lieu',
    });
  }
};

export const getLocationBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const location = await prisma.location.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { reviews: true, favorites: true },
        },
      },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Lieu non trouvé',
      });
    }

    const avgRating = location.reviews.length > 0
      ? location.reviews.reduce((sum, r) => sum + r.rating, 0) / location.reviews.length
      : null;

    const isOpen = checkIfOpenNow(location.openingHours as any);

    res.json({
      success: true,
      data: {
        ...location,
        rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        isOpen,
      },
    });
  } catch (error) {
    console.error('Get location by slug error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du lieu',
    });
  }
};

export const createLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const locationData = req.body;

    // Vérifier les doublons (fuzzy matching sur nom + ville)
    const existingLocation = await prisma.location.findFirst({
      where: {
        name: { contains: locationData.name, mode: 'insensitive' },
        city: { contains: locationData.city, mode: 'insensitive' },
      },
    });

    if (existingLocation) {
      return res.status(409).json({
        success: false,
        error: 'Un lieu similaire existe déjà',
        data: { existingLocation },
      });
    }

    // Géocodage de l'adresse
    const geocodingResult = await geocodeAddress(locationData.address, locationData.city);

    if (!geocodingResult) {
      return res.status(400).json({
        success: false,
        error: 'Impossible de géocoder cette adresse. Vérifiez l\'adresse et la ville.',
      });
    }

    // Générer un slug unique
    const baseSlug = generateSlug(locationData.name);
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.location.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer le lieu
    const location = await prisma.location.create({
      data: {
        slug,
        name: locationData.name,
        address: locationData.address,
        city: locationData.city,
        postalCode: locationData.postalCode,
        country: locationData.country || 'Belgique',
        phone: locationData.phone,
        email: locationData.email,
        website: locationData.website,
        description: locationData.description,
        latitude: geocodingResult.latitude,
        longitude: geocodingResult.longitude,
        categoryId: locationData.categoryId,
        userId,
        metadata: locationData.metadata || {},
        openingHours: locationData.openingHours,
        status: 'PENDING',
        verified: false,
      },
      include: {
        category: true,
      },
    });

    // Notifier les modérateurs
    const moderators = await prisma.user.findMany({
      where: { role: { in: ['MODERATOR', 'ADMIN'] } },
    });

    await prisma.notification.createMany({
      data: moderators.map(mod => ({
        userId: mod.id,
        title: 'Nouvelle proposition de lieu',
        message: `${locationData.name} à ${locationData.city} a été proposé par un utilisateur`,
        type: 'LOCATION_PENDING',
      })),
    });

    res.status(201).json({
      success: true,
      data: location,
      message: 'Lieu proposé avec succès. Il sera visible après validation par notre équipe.',
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du lieu',
    });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const updateData = req.body;

    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Lieu non trouvé',
      });
    }

    // Vérifier les droits: seul le créateur ou un admin/modérateur peut modifier
    if (location.userId !== userId && !['ADMIN', 'MODERATOR'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Vous n\'êtes pas autorisé à modifier ce lieu',
      });
    }

    // Si l'adresse change, refaire le géocodage
    let latitude = location.latitude;
    let longitude = location.longitude;

    if (updateData.address || updateData.city) {
      const newAddress = updateData.address || location.address;
      const newCity = updateData.city || location.city;
      const geocodingResult = await geocodeAddress(newAddress, newCity);

      if (geocodingResult) {
        latitude = geocodingResult.latitude;
        longitude = geocodingResult.longitude;
      }
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        ...updateData,
        latitude,
        longitude,
      },
      include: {
        category: true,
      },
    });

    res.json({
      success: true,
      data: updatedLocation,
      message: 'Lieu mis à jour avec succès',
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du lieu',
    });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Lieu non trouvé',
      });
    }

    // Vérifier les droits
    if (location.userId !== userId && !['ADMIN', 'MODERATOR'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Vous n\'êtes pas autorisé à supprimer ce lieu',
      });
    }

    await prisma.location.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Lieu supprimé avec succès',
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du lieu',
    });
  }
};

export const moderateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const moderatorId = req.user!.userId;

    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Lieu non trouvé',
      });
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        status,
        verified: status === 'PUBLISHED',
        verifiedAt: status === 'PUBLISHED' ? new Date() : null,
        verifiedBy: status === 'PUBLISHED' ? moderatorId : null,
      },
    });

    // Notifier l'utilisateur qui a proposé le lieu
    if (location.userId) {
      await prisma.notification.create({
        data: {
          userId: location.userId,
          title: status === 'PUBLISHED' ? 'Lieu validé !' : 'Proposition refusée',
          message: status === 'PUBLISHED'
            ? `Votre proposition "${location.name}" a été validée et est maintenant visible.`
            : `Votre proposition "${location.name}" a été refusée. ${rejectionReason || ''}`,
          type: status === 'PUBLISHED' ? 'LOCATION_APPROVED' : 'LOCATION_REJECTED',
        },
      });
    }

    res.json({
      success: true,
      data: updatedLocation,
      message: status === 'PUBLISHED' ? 'Lieu publié avec succès' : 'Lieu rejeté',
    });
  } catch (error) {
    console.error('Moderate location error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modération du lieu',
    });
  }
};

export const getPendingLocations = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), config.pagination.maxLimit);

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where: { status: 'PENDING' },
        skip,
        take,
        orderBy: { createdAt: 'asc' },
        include: {
          category: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.location.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: {
        data: locations,
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Get pending locations error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des propositions',
    });
  }
};

export const getLocationsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 20, status } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), config.pagination.maxLimit);

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          reviews: { select: { rating: true } },
        },
      }),
      prisma.location.count({ where }),
    ]);

    const locationsWithRating = locations.map(loc => ({
      ...loc,
      rating: loc.reviews.length > 0
        ? Math.round(loc.reviews.reduce((sum, r) => sum + r.rating, 0) / loc.reviews.length * 10) / 10
        : null,
    }));

    res.json({
      success: true,
      data: {
        data: locationsWithRating,
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Get user locations error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de vos propositions',
    });
  }
};