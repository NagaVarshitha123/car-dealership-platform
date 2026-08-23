import { Role } from '@prisma/client';
import { AuthService } from '../../src/services/authService';
import { hashPassword } from '../../src/utils/password';
import { ConflictError, UnauthorizedError, ValidationError } from '../../src/utils/errors';
import { createMockPrisma, MockPrisma } from '../mockPrisma';

describe('AuthService', () => {
  let prisma: MockPrisma;
  let service: AuthService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new AuthService(prisma);
  });

  describe('register', () => {
    it('rejects an invalid email', async () => {
      await expect(
        service.register({ email: 'not-an-email', password: 'password123' }),
      ).rejects.toThrow(ValidationError);
    });

    it('rejects a password shorter than 8 characters', async () => {
      await expect(
        service.register({ email: 'user@example.com', password: 'short' }),
      ).rejects.toThrow(ValidationError);
    });

    it('rejects registration when the email is already taken', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: 'hashed',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.register({ email: 'user@example.com', password: 'password123' }),
      ).rejects.toThrow(ConflictError);
    });

    it('creates a new user with a hashed password and returns a token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: 'hashed-password',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register({ email: 'user@example.com', password: 'password123' });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'user@example.com', role: Role.CUSTOMER }),
        }),
      );
      expect(result.token).toEqual(expect.any(String));
      expect(result.user).toEqual({ id: 1, email: 'user@example.com', role: Role.CUSTOMER });
    });

    it('defaults new users to the CUSTOMER role', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 2,
        email: 'someone@example.com',
        password: 'hashed',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.register({ email: 'someone@example.com', password: 'password123' });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: Role.CUSTOMER }) }),
      );
    });
  });

  describe('login', () => {
    it('rejects when the email does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('rejects when the password is incorrect', async () => {
      const passwordHash = await hashPassword('correct-password');
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: passwordHash,
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.login({ email: 'user@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('returns a token and user info on successful login', async () => {
      const passwordHash = await hashPassword('correct-password');
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: passwordHash,
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.login({ email: 'user@example.com', password: 'correct-password' });

      expect(result.token).toEqual(expect.any(String));
      expect(result.user).toEqual({ id: 1, email: 'user@example.com', role: Role.ADMIN });
    });
  });
});
