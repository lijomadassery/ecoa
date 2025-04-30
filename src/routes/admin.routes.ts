import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

// Define the user type
interface User {
  id: string;
  role: string;
}

const router = Router();

// Middleware to check authentication
const checkAuth = (req: Request & { user?: User }, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply authentication check to all routes
router.use(checkAuth);

// Your existing route handlers
router.post('/some-route', async (req: Request & { user: User }, res: Response) => {
  const userId = req.user.id;
  // ... rest of your code
});

router.put('/another-route', async (req: Request & { user: User }, res: Response) => {
  const userId = req.user.id;
  // ... rest of your code
});

// ... rest of your routes

export default router; 