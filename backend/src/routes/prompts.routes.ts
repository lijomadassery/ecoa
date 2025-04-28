import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

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
    const { individualId, promptTypeId, status, notes, location, deviceId, signatureData } = req.body;
    
    // Get the user ID from the authenticated user
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const promptData = {
      userId,
      individualId: Number(individualId),
      promptTypeId: Number(promptTypeId),
      status,
      notes,
      location,
      deviceId
    };

    // Only add signatureData if status is COMPLETED and signatureData exists
    if (status === 'COMPLETED' && signatureData) {
      promptData['signatureData'] = signatureData;
    }
    
    const newPrompt = await prisma.prompt.create({
      data: promptData,
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
    
    // Create audit log for prompt creation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_PROMPT',
        entityType: 'PROMPT',
        entityId: newPrompt.id,
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || '',
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
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
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
    
    // Create audit log for status update
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_PROMPT_STATUS_' + status,
        entityType: 'PROMPT',
        entityId: Number(id),
        ipAddress: req.ip || '',
        userAgent: req.get('user-agent') || '',
      }
    });
    
    res.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 