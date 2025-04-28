import { PrismaClient } from '@prisma/client';

// Create a singleton PrismaClient instance to be used throughout the application
// This prevents creating multiple connections to the database
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
  // Connection pooling is configured through DATABASE_URL
  // Example: mysql://user:password@host:port/db?connection_limit=5
});

// In development, hot-reloading can cause multiple instances to be created
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 