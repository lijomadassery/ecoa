import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Middleware to check authentication
const checkAuth = (req: any, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply authentication check to all routes
router.use(checkAuth);

// Your existing route handlers
router.post('/some-route', async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... rest of your code
});

router.put('/another-route', async (req: any, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... rest of your code
});

// ... rest of your routes

export default router; 