import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/login', async (req, res, next) => {
  console.log('Backend: Login request received:', { ...req.body, password: '***' });
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    console.log('Backend: User lookup result:', user ? 'User found' : 'User not found');

    if (!user) {
      console.log('Backend: Login failed - Invalid credentials (user not found)');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Backend: Password validation:', isValidPassword ? 'Valid' : 'Invalid');
    
    if (!isValidPassword) {
      console.log('Backend: Login failed - Invalid credentials (wrong password)');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('Backend: JWT token generated');

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || '',
      },
    });
    console.log('Backend: Audit log created');

    const { password: _, ...userWithoutPassword } = user;
    console.log('Backend: Sending successful login response');
    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Backend: Login error:', error);
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  console.log('Backend: Logout request received');
  try {
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'LOGOUT',
          entityType: 'USER',
          entityId: req.user.id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent') || '',
        },
      });
      console.log('Backend: Logout audit log created');
    }
    console.log('Backend: Sending successful logout response');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Backend: Logout error:', error);
    next(error);
  }
});

export default router; 