import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as "totalCount",
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as "completedCount",
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as "pendingCount",
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as "inProgressCount"
      FROM "Task"
    `;

    const stats = result?.[0] || {
      totalCount: 0,
      completedCount: 0,
      pendingCount: 0,
      inProgressCount: 0
    };

    return res.json({
      totalTasks: Number(stats.totalCount) || 0,
      completed: Number(stats.completedCount) || 0,
      pending: Number(stats.pendingCount) || 0,
      inProgress: Number(stats.inProgressCount) || 0
    });
  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'An unknown error occurred'
    });
  }
});

export default router; 