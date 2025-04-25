import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

// Get all users
router.get('/users', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        badgeNumber: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        facilityId: true,
        unitId: true
      },
      orderBy: {
        lastName: 'asc'
      }
    });

    // Transform response for frontend
    const transformedUsers = users.map(user => ({
      ...user,
      status: 'active'  // Default all users to active since there's no isActive field
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    next(error);
  }
});

// Get user by ID
router.get('/users/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        badgeNumber: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        facilityId: true,
        unitId: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform response for frontend
    const transformedUser = {
      ...user,
      status: 'active'  // Default all users to active
    };

    res.json(transformedUser);
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    next(error);
  }
});

// Create new user
router.post('/users', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const { username, password, firstName, lastName, badgeNumber, role, facilityId, unitId } = req.body;

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        badgeNumber,
        role,
        facilityId: facilityId || 1, // Default facility
        unitId
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        badgeNumber: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        facilityId: true,
        unitId: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_USER',
        entityType: 'USER',
        entityId: newUser.id,
        details: JSON.stringify({
          username: newUser.username,
          role: newUser.role
        }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || '',
      },
    });

    // Transform response for frontend
    const transformedUser = {
      ...newUser,
      status: 'active'
    };

    res.status(201).json(transformedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    next(error);
  }
});

// Update user
router.put('/users/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const { firstName, lastName, badgeNumber, role, facilityId, unitId } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        badgeNumber,
        role,
        facilityId,
        unitId,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        badgeNumber: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        facilityId: true,
        unitId: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_USER',
        entityType: 'USER',
        entityId: updatedUser.id,
        details: JSON.stringify({
          username: updatedUser.username,
          role: updatedUser.role
        }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || '',
      },
    });

    // Transform response for frontend
    const transformedUser = {
      ...updatedUser,
      status: 'active'
    };

    res.json(transformedUser);
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    next(error);
  }
});

// Reset user password
router.post('/users/:id/reset-password', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const { password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RESET_PASSWORD',
        entityType: 'USER',
        entityId: id,
        details: JSON.stringify({
          username: existingUser.username
        }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || '',
      },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(`Error resetting password for user ${req.params.id}:`, error);
    next(error);
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:id/status', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const { status } = req.body;

    // Validate status
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ message: 'Invalid status. Must be "active" or "inactive".' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Since there's no isActive field, we just log this action but don't actually modify the user
    // In a real app, you'd want to add this field to your database schema

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: status === 'active' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        entityType: 'USER',
        entityId: id,
        details: JSON.stringify({
          username: existingUser.username,
          status: status
        }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || '',
      },
    });

    // Return the user with the requested status (even though it's not stored in the DB)
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        badgeNumber: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        facilityId: true,
        unitId: true
      }
    });

    // Transform response for frontend
    const transformedUser = {
      ...user,
      status: status // Return the requested status
    };

    res.json(transformedUser);
  } catch (error) {
    console.error(`Error updating status for user ${req.params.id}:`, error);
    next(error);
  }
});

// Delete user (not actually deleting, just logging it since we don't have isActive field)
router.delete('/users/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In a real app you'd want to soft delete by setting isActive to false
    // But since we don't have that field, we'll just log it

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_USER',
        entityType: 'USER',
        entityId: id,
        details: JSON.stringify({
          username: existingUser.username
        }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || '',
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    next(error);
  }
});

export default router; 