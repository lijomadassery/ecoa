import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all individuals
router.get('/', async (req, res) => {
  try {
    const individuals = await prisma.individual.findMany();
    res.json(individuals);
  } catch (error) {
    console.error('Error fetching individuals:', error);
    res.status(500).json({ error: 'Failed to fetch individuals' });
  }
});

// Get individual by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const individual = await prisma.individual.findUnique({
      where: { id },
      include: {
        disabilities: {
          include: {
            disability: true
          }
        }
      }
    });
    
    if (!individual) {
      return res.status(404).json({ error: 'Individual not found' });
    }
    res.json(individual);
  } catch (error) {
    console.error('Error fetching individual:', error);
    res.status(500).json({ error: 'Failed to fetch individual' });
  }
});

// Search individuals
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const individuals = await prisma.individual.findMany({
      where: {
        OR: [
          { firstName: { contains: query as string } },
          { lastName: { contains: query as string } },
          { cdcrNumber: { contains: query as string } }
        ]
      }
    });
    res.json(individuals);
  } catch (error) {
    console.error('Error searching individuals:', error);
    res.status(500).json({ error: 'Failed to search individuals' });
  }
});

// Get individuals by unit
router.get('/unit/:unit', async (req, res) => {
  try {
    const individuals = await prisma.individual.findMany({
      where: { housingUnit: req.params.unit }
    });
    res.json(individuals);
  } catch (error) {
    console.error('Error fetching individuals by unit:', error);
    res.status(500).json({ error: 'Failed to fetch individuals by unit' });
  }
});

export default router; 