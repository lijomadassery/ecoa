import { Router, Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const router = Router();

router.post('/some-route', async (req: Request, res: Response) => {
  try {
    // ... existing code ...
  } catch (err: unknown) {
    // Type guard for PrismaClientKnownRequestError
    if (err instanceof PrismaClientKnownRequestError) {
      return res.status(400).json({ error: 'Database error: ' + err.message });
    }
    
    // Type guard for Error
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    
    // Fallback for unknown error types
    console.error('Unknown error:', err);
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
});

export default router; 