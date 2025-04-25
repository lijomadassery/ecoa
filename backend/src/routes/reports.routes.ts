import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Prompt Completion Report
router.get('/prompt-completion', authMiddleware, async (req, res, next) => {
  try {
    const { startDate, endDate, facilityId } = req.query;
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const where = {
      createdAt: {
        gte: start,
        lte: end,
      },
      ...(facilityId ? { facilityId: parseInt(facilityId as string) } : {})
    };

    // Get total prompts and their statuses
    const prompts = await prisma.prompt.findMany({
      where,
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    // Calculate statistics
    const totalPrompts = prompts.length;
    const completedPrompts = prompts.filter(p => p.status === 'SIGNED').length;
    const pendingPrompts = prompts.filter(p => p.status === 'PENDING').length;
    const refusedPrompts = prompts.filter(p => p.status === 'REFUSED').length;
    const completionRate = totalPrompts ? (completedPrompts / totalPrompts * 100).toFixed(1) : 0;

    // Group by date
    const byDate = prompts.reduce((acc, prompt) => {
      const date = prompt.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { completed: 0, pending: 0, refused: 0 };
      }
      if (prompt.status === 'SIGNED') acc[date].completed++;
      if (prompt.status === 'PENDING') acc[date].pending++;
      if (prompt.status === 'REFUSED') acc[date].refused++;
      return acc;
    }, {} as Record<string, { completed: number; pending: number; refused: number; }>);

    res.json({
      totalPrompts,
      completedPrompts,
      pendingPrompts,
      refusedPrompts,
      completionRate: Number(completionRate),
      byDate: Object.entries(byDate).map(([date, stats]) => ({
        date,
        ...stats
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Individual Activity Report
router.get('/individual-activity', authMiddleware, async (req, res, next) => {
  try {
    const { startDate, endDate, facilityId } = req.query;
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const where = {
      createdAt: {
        gte: start,
        lte: end,
      },
      ...(facilityId ? { facilityId: parseInt(facilityId as string) } : {})
    };

    const individuals = await prisma.individual.findMany({
      where: {
        ...(facilityId ? { facilityId: parseInt(facilityId as string) } : {})
      },
      include: {
        prompts: {
          where,
          include: {
            promptType: true
          }
        }
      }
    });

    const stats = individuals.map(individual => {
      const totalPrompts = individual.prompts.length;
      const completedPrompts = individual.prompts.filter(p => p.status === 'SIGNED').length;
      const completionRate = totalPrompts ? (completedPrompts / totalPrompts * 100).toFixed(1) : 0;

      // Group prompts by type
      const promptsByType = individual.prompts.reduce((acc, prompt) => {
        const type = prompt.promptType.name;
        if (!acc[type]) {
          acc[type] = { count: 0, completed: 0 };
        }
        acc[type].count++;
        if (prompt.status === 'SIGNED') {
          acc[type].completed++;
        }
        return acc;
      }, {} as Record<string, { count: number; completed: number; }>);

      return {
        cdcrNumber: individual.cdcrNumber,
        firstName: individual.firstName,
        lastName: individual.lastName,
        totalPrompts,
        completionRate: Number(completionRate),
        lastPromptDate: individual.prompts.length ? 
          individual.prompts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt :
          null,
        promptsByType: Object.entries(promptsByType).map(([type, stats]) => ({
          type,
          count: stats.count,
          completionRate: stats.count ? (stats.completed / stats.count * 100).toFixed(1) : 0
        }))
      };
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Staff Performance Report
router.get('/staff-performance', authMiddleware, async (req, res, next) => {
  try {
    const { startDate, endDate, facilityId } = req.query;
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const where = {
      createdAt: {
        gte: start,
        lte: end,
      },
      ...(facilityId ? { facilityId: parseInt(facilityId as string) } : {})
    };

    const users = await prisma.user.findMany({
      where: {
        role: 'OFFICER',
        ...(facilityId ? { facilityId: parseInt(facilityId as string) } : {})
      },
      include: {
        prompts: {
          where
        }
      }
    });

    const stats = users.map(user => {
      const totalPrompts = user.prompts.length;
      const completedPrompts = user.prompts.filter(p => p.status === 'SIGNED').length;

      // Calculate average response time (mock data for now)
      const averageResponseTime = Math.floor(Math.random() * 30) + 5; // 5-35 minutes

      // Group by status
      const promptsByStatus = user.prompts.reduce((acc, prompt) => {
        if (!acc[prompt.status]) {
          acc[prompt.status] = 0;
        }
        acc[prompt.status]++;
        return acc;
      }, {} as Record<string, number>);

      return {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        badgeNumber: user.badgeNumber,
        totalPrompts,
        completedPrompts,
        averageResponseTime,
        promptsByStatus: Object.entries(promptsByStatus).map(([status, count]) => ({
          status,
          count
        }))
      };
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router; 