// Add this type at the top of the file
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Update the route handlers to use type guards
router.post('/some-route', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... existing code ...
});

// Update all other route handlers similarly
router.put('/another-route', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... existing code ...
});

// ... existing code ... 