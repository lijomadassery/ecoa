import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface Stats {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
}

interface BaseData {
  [key: string]: unknown;
}

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const baseData: BaseData = { /* your base data */ };
    const data: BaseData = { ...baseData };

    const result = await prisma.task.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const stats: Stats = {
      totalCount: 0,
      completedCount: 0,
      pendingCount: 0,
      inProgressCount: 0
    };

    // Process the results and populate stats
    result.forEach(item => {
      const count = item._count.status;
      switch (item.status) {
        case 'COMPLETED':
          stats.completedCount = count;
          break;
        case 'PENDING':
          stats.pendingCount = count;
          break;
        case 'IN_PROGRESS':
          stats.inProgressCount = count;
          break;
      }
      stats.totalCount += count;
    });

    return res.json({
      totalTasks: stats.totalCount,
      completed: stats.completedCount,
      pending: stats.pendingCount,
      inProgress: stats.inProgressCount
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
});

export default router; 