import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Handle Prisma errors
  if (error?.name === 'PrismaClientKnownRequestError') {
    if (error?.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'A record with this data already exists.',
      });
    }
  }

  // Handle validation errors
  if (error?.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }

  // Handle Prisma validation errors
  if (error?.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid data provided.',
    });
  }

  // Default error response
  return res.status(500).json({
    status: 'error',
    message: error?.message || 'Internal server error',
  });
}; 