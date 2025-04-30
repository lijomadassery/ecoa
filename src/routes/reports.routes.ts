import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface Stats {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
}

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as totalCount,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount
      FROM Task
    `;

    const stats = result[0] as Stats;

    return res.json({
      totalTasks: stats.totalCount,
      completed: stats.completedCount,
      pending: stats.pendingCount,
      inProgress: stats.inProgressCount
    });
  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'An unknown error occurred'
    });
  }
});

export default router; 