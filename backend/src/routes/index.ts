import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from './auth.routes';
import individualsRoutes from './individuals.routes';
import communicationNotesRoutes from './communication-notes.routes';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/individuals', authMiddleware, individualsRoutes);
router.use('/users', authMiddleware, (req, res) => res.json([]));
router.use('/facilities', authMiddleware, (req, res) => res.json([]));
router.use('/communication-notes', authMiddleware, communicationNotesRoutes);

// Prompt types route
router.get('/prompt-types', authMiddleware, async (req, res) => {
  try {
    const promptTypes = await prisma.promptType.findMany({
      orderBy: {
        category: 'asc'
      }
    });
    res.json(promptTypes);
  } catch (error) {
    console.error('Error fetching prompt types:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 