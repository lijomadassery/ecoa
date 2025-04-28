import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

// Helper function to extract entity information from URL
const getEntityInfo = (path: string) => {
  const pathParts = path.split('/').filter(Boolean);
  
  // Default/fallback
  let entityType = "SYSTEM";
  
  // Try to determine entity type from path
  if (pathParts.length > 0) {
    // The first part is usually the entity type
    switch (pathParts[0]) {
      case 'auth':
        entityType = 'AUTH';
        break;
      case 'prompts':
        entityType = 'PROMPT';
        break;
      case 'individuals':
        entityType = 'INDIVIDUAL';
        break;
      case 'reports':
        entityType = 'REPORT';
        break;
      case 'activity':
        entityType = 'ACTIVITY';
        break;
      case 'prompt-types':
        entityType = 'PROMPT_TYPE';
        break;
      default:
        // Try to make the entity type nicer by removing trailing 's'
        entityType = pathParts[0].toUpperCase();
        if (entityType.endsWith('S')) {
          entityType = entityType.substring(0, entityType.length - 1);
        }
    }
  }
  
  return {
    entityType,
    entityId: 0 // Default entity ID (we could parse IDs from URLs if needed)
  };
};

export const requestLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || '',
    };

    console.log(JSON.stringify(logData));

    // Log to database if it's an important operation
    if (req.method !== 'GET' && req.user?.id) {
      try {
        // Extract entity information from the URL
        const { entityType, entityId } = getEntityInfo(req.path);
        
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action: req.method,
            entityType: entityType,
            entityId: entityId,
            ipAddress: req.ip || "unknown",
            userAgent: req.get('user-agent') || "unknown"
          }
        });
      } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't fail the request if logging fails
      }
    }
  });

  next();
}; 