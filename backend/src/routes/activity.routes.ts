import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/recent', authMiddleware, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const recentActivity = await prisma.auditLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    res.json(recentActivity);
  } catch (error) {
    next(error);
  }
});

export default router; 