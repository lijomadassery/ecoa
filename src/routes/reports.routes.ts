import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface TaskStats {
  totalCount: string | number;
  completedCount: string | number;
  pendingCount: string | number;
  inProgressCount: string | number;
}

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRaw<TaskStats[]>`
      SELECT 
        COUNT(*)::text as "totalCount",
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END)::text as "completedCount",
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END)::text as "pendingCount",
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END)::text as "inProgressCount"
      FROM "Task"
    `;

    const stats = result[0] || {
      totalCount: '0',
      completedCount: '0',
      pendingCount: '0',
      inProgressCount: '0'
    };

    return res.json({
      totalTasks: parseInt(stats.totalCount as string, 10) || 0,
      completed: parseInt(stats.completedCount as string, 10) || 0,
      pending: parseInt(stats.pendingCount as string, 10) || 0,
      inProgress: parseInt(stats.inProgressCount as string, 10) || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

export default router; 