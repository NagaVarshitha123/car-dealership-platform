import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { buildAuthController } from '../controllers/authController';

export function authRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const controller = buildAuthController(prisma);

  router.post('/register', controller.register);
  router.post('/login', controller.login);

  return router;
}
