import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all prompts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const prompts = await prisma.prompt.findMany({
      include: {
        individual: true,
        promptType: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            badgeNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new prompt
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { individualId, promptTypeId, status, notes, location, deviceId } = req.body;
    
    // Get the user ID from the authenticated user
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const newPrompt = await prisma.prompt.create({
      data: {
        userId,
        individualId,
        promptTypeId,
        status,
        notes,
        location,
        deviceId
      },
      include: {
        individual: true,
        promptType: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            badgeNumber: true
          }
        }
      }
    });
    
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update prompt status
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const updatedPrompt = await prisma.prompt.update({
      where: { id: Number(id) },
      data: { 
        status,
        notes,
        updatedAt: new Date()
      },
      include: {
        individual: true,
        promptType: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            badgeNumber: true
          }
        }
      }
    });
    
    res.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 