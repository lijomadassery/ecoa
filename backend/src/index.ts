import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import mainRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth.routes';
import activityRoutes from './routes/activity.routes';
import reportsRoutes from './routes/reports.routes';
import adminRoutes from './routes/admin.routes';
import promptsRoutes from './routes/prompts.routes';

const prisma = new PrismaClient();
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(requestLogger);

// API Routes
app.use('/api', mainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prompts', promptsRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4001;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to database');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 