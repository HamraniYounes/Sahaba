// Routes des catégories

import { Router } from 'express';
import { prisma } from '../db/client';

const router = Router();

// Obtenir toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { locations: { where: { status: 'PUBLISHED' } } },
        },
      },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des catégories',
    });
  }
});

// Obtenir une catégorie par slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { locations: { where: { status: 'PUBLISHED' } } },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Catégorie non trouvée',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la catégorie',
    });
  }
});

export default router;