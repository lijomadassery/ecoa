import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';

const router = Router();

router.post('/some-route', async (req: Request, res: Response) => {
  try {
    // ... existing code ...
  } catch (error: any) {
    // Handle Prisma errors
    if (error?.constructor?.name === 'PrismaClientKnownRequestError') {
      return res.status(400).json({ 
        error: 'Database error', 
        message: error.message 
      });
    }
    
    // Handle other errors
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'An unknown error occurred'
    });
  }
});

export default router; 