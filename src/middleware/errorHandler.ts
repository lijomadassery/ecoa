import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Handle Prisma errors
  if (error instanceof Error && error.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as Prisma.PrismaClientKnownRequestError;
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
  if (error instanceof Error && error.constructor.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid data provided.',
    });
  }

  // Default error response
  return res.status(500).json({
    status: 'error',
    message: error instanceof Error ? error.message : 'Internal server error',
  });
}; 