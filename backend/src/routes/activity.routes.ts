import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Map HTTP methods to user-friendly actions
const actionMap = {
  'GET': 'VIEW',
  'POST': 'CREATE',
  'PATCH': 'UPDATE',
  'PUT': 'UPDATE',
  'DELETE': 'DELETE'
};

// Map entity types
const entityTypeMap = {
  'UNKNOWN': 'SYSTEM',
  '0': 'SYSTEM'
};

router.get('/recent', authMiddleware, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Fetch basic audit logs
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

    // Get all prompt-related activity IDs
    const promptActivityIds = recentActivity
      .filter(activity => activity.entityType === 'PROMPT')
      .map(activity => activity.entityId);

    // Fetch detailed prompt information if there are any prompt activities
    let promptDetails = {};
    if (promptActivityIds.length > 0) {
      const prompts = await prisma.prompt.findMany({
        where: {
          id: {
            in: promptActivityIds
          }
        },
        include: {
          individual: {
            select: {
              firstName: true,
              lastName: true,
              cdcrNumber: true
            }
          },
          promptType: {
            select: {
              name: true,
              category: true
            }
          }
        }
      });

      // Create a map of prompt details by ID
      promptDetails = prompts.reduce((acc, prompt) => {
        acc[prompt.id] = {
          individual: {
            name: `${prompt.individual.firstName} ${prompt.individual.lastName}`,
            cdcrNumber: prompt.individual.cdcrNumber
          },
          promptType: prompt.promptType.name,
          category: prompt.promptType.category,
          status: prompt.status
        };
        return acc;
      }, {});
    }

    // Transform the data to provide better action and entity type descriptions
    const formattedActivity = recentActivity.map(activity => {
      // Map HTTP method to friendly action name
      const action = actionMap[activity.action] || activity.action;
      
      // Map entity type or provide default
      let entityType = activity.entityType;
      if (entityTypeMap[entityType] || entityType === '0' || entityType === '0') {
        entityType = entityTypeMap[entityType] || 'SYSTEM';
      }

      // Add detailed information for prompt activities
      let detailedInfo = null;
      if (entityType === 'PROMPT' && promptDetails[activity.entityId]) {
        detailedInfo = promptDetails[activity.entityId];
      }

      return {
        ...activity,
        action,
        entityType,
        detailedInfo
      };
    });

    res.json(formattedActivity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    next(error);
  }
});

export default router; 