import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

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

// Create a new individual
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { cdcrNumber, firstName, lastName, housingUnit, facilityId, disabilities } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Create new individual
    const newIndividual = await prisma.individual.create({
      data: {
        cdcrNumber,
        firstName,
        lastName,
        housingUnit,
        facilityId: Number(facilityId)
      }
    });
    
    // Add disabilities if provided
    if (disabilities && disabilities.length > 0) {
      const disabilityConnections = disabilities.map(disabilityId => ({
        disabilityId: Number(disabilityId),
        individualId: newIndividual.id
      }));
      
      await prisma.individualDisability.createMany({
        data: disabilityConnections
      });
    }
    
    // Fetch the created individual with disabilities
    const individual = await prisma.individual.findUnique({
      where: { id: newIndividual.id },
      include: {
        disabilities: {
          include: {
            disability: true
          }
        }
      }
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_INDIVIDUAL',
        entityType: 'INDIVIDUAL',
        entityId: newIndividual.id,
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || ''
      }
    });
    
    res.status(201).json(individual);
  } catch (error) {
    console.error('Error creating individual:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'CDCR number already exists' });
    }
    res.status(500).json({ error: 'Failed to create individual' });
  }
});

// Update an individual
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const { firstName, lastName, housingUnit, facilityId, disabilities } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Update individual
    const updatedIndividual = await prisma.individual.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(housingUnit && { housingUnit }),
        ...(facilityId && { facilityId: Number(facilityId) })
      }
    });
    
    // Update disabilities if provided
    if (disabilities && disabilities.length > 0) {
      // First delete existing connections
      await prisma.individualDisability.deleteMany({
        where: { individualId: id }
      });
      
      // Then create new connections
      const disabilityConnections = disabilities.map(disabilityId => ({
        disabilityId: Number(disabilityId),
        individualId: id
      }));
      
      await prisma.individualDisability.createMany({
        data: disabilityConnections
      });
    }
    
    // Fetch the updated individual with disabilities
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
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_INDIVIDUAL',
        entityType: 'INDIVIDUAL',
        entityId: id,
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || ''
      }
    });
    
    res.json(individual);
  } catch (error) {
    console.error('Error updating individual:', error);
    res.status(500).json({ error: 'Failed to update individual' });
  }
});

export default router; 