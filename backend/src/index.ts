import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { prisma } from './lib/prisma';
import mainRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth.routes';
import activityRoutes from './routes/activity.routes';
import reportsRoutes from './routes/reports.routes';
import adminRoutes from './routes/admin.routes';
import promptsRoutes from './routes/prompts.routes';

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    /^http:\/\/localhost:\d+$/,      // Allow any localhost port
    /^http:\/\/127\.0\.0\.1:\d+$/,   // Allow any 127.0.0.1 port
    'http://192.168.126.11:5173',    // VPN IP
    'https://madasserylabs.ngrok.app',  // Specific ngrok domain
    /\.ngrok-free\.app$/,            // Allow all ngrok domains
    '*'  // Allow all VPN users to access
  ],
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

const PORT = Number(process.env.PORT || 4001);  // Fix TypeScript error by converting to number
const HOST = '0.0.0.0'; // Listen on all interfaces

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to database');

    app.listen(PORT, HOST, () => {
      console.log('Server is running on:');
      console.log(`Local: http://localhost:${PORT}`);
      console.log(`VPN: http://192.168.126.11:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle application shutdown and close Prisma connections
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer(); 