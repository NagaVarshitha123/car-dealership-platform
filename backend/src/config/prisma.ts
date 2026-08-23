import { PrismaClient } from '@prisma/client';

// A single shared Prisma client instance for the whole app.
// Kept in its own module so it can be imported (and mocked in tests)
// independently of any one service.
export const prisma = new PrismaClient();
