import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action: req.method,
            entityType: req.path.split('/')[2]?.toUpperCase() || 'UNKNOWN',
            entityId: req.params.id || '',
            ipAddress: req.ip,
            userAgent: req.get('user-agent') || '',
          },
        });
      } catch (error) {
        console.error('Failed to create audit log:', error);
      }
    }
  });

  next();
}; 