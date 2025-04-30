import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Handle Prisma errors
  if (error instanceof (Prisma as any).PrismaClientKnownRequestError) {
    const prismaError = error as any;
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'A record with this data already exists.',
      });
    }
  }

  // Handle validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }

  // Handle Prisma validation errors
  if (error instanceof (Prisma as any).PrismaClientValidationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid data provided.',
    });
  }

  // Default error response
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}; 