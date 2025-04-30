import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

const router = Router();

// Middleware to check authentication
const checkAuth = (req: Request, res: Response, next: Function) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply authentication check to all routes
router.use(checkAuth);

// Your existing route handlers, now with proper typing
router.post('/some-route', async (req: AuthenticatedRequest, res: Response) => {
  // req.user is now guaranteed to exist
  const userId = req.user.id;
  // ... rest of your code
});

router.put('/another-route', async (req: AuthenticatedRequest, res: Response) => {
  // req.user is now guaranteed to exist
  const userId = req.user.id;
  // ... rest of your code
});

// ... rest of your routes

export default router; 