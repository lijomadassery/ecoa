import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          message: 'A record with this value already exists',
          error: error.message
        });
      case 'P2025':
        return res.status(404).json({
          message: 'Record not found',
          error: error.message
        });
      default:
        return res.status(400).json({
          message: 'Database error',
          error: error.message
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: 'Validation error',
      error: error.message
    });
  }

  return res.status(500).json({
    message: 'Internal server error',
    error: error.message
  });
}; 