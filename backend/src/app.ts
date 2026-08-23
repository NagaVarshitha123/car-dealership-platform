import express, { Express } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/authRoutes';
import { vehicleRoutes } from './routes/vehicleRoutes';
import { errorHandler } from './middleware/errorHandler';

/**
 * Builds the Express app with a given Prisma client. Accepting the client
 * as a parameter (rather than importing a singleton) lets tests inject a
 * mocked PrismaClient without touching a real database.
 */
export function createApp(prisma: PrismaClient): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/api/auth', authRoutes(prisma));
  app.use('/api/vehicles', vehicleRoutes(prisma));

  app.use(errorHandler);

  return app;
}
