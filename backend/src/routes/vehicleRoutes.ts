import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { buildVehicleController } from '../controllers/vehicleController';
import { authenticate, requireAdmin } from '../middleware/auth';

export function vehicleRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const controller = buildVehicleController(prisma);

  // NOTE: /search must be registered before /:id so Express doesn't treat
  // the literal segment "search" as a numeric :id.
  router.get('/search', authenticate, controller.search);
  router.get('/', authenticate, controller.list);
  router.post('/', authenticate, controller.create);

  router.get('/:id', authenticate, controller.getOne);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, requireAdmin, controller.remove);

  router.post('/:id/purchase', authenticate, controller.purchase);
  router.post('/:id/restock', authenticate, requireAdmin, controller.restock);

  return router;
}
