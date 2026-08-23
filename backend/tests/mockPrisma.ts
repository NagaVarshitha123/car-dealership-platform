import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrisma = DeepMockProxy<PrismaClient>;

export function createMockPrisma(): MockPrisma {
  return mockDeep<PrismaClient>();
}
