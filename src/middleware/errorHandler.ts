import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

export const errorHandler = (
  error: Error | PrismaClientKnownRequestError | PrismaClientValidationError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    if ('code' in error && error.code === 'P2002') {
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
  if (error instanceof PrismaClientValidationError) {
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