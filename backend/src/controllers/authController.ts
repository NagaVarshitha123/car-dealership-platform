import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';

export function buildAuthController(prisma: PrismaClient) {
  const service = new AuthService(prisma);

  const register = asyncHandler(async (req: Request, res: Response) => {
    // Only email/password are accepted from the client — role is never
    // taken from the request body, so a caller cannot self-assign ADMIN.
    // Admin accounts are created via the seed script or by an existing
    // admin through another privileged process.
    const { email, password } = req.body;
    const result = await service.register({ email, password });
    res.status(201).json(result);
  });

  const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await service.login(req.body);
    res.status(200).json(result);
  });

  return { register, login };
}
