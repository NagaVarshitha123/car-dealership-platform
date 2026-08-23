import request from 'supertest';
import { Role } from '@prisma/client';
import { createApp } from '../../src/app';
import { hashPassword } from '../../src/utils/password';
import { createMockPrisma, MockPrisma } from '../mockPrisma';

describe('Auth routes', () => {
  let prisma: MockPrisma;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    prisma = createMockPrisma();
    app = createApp(prisma);
  });

  describe('POST /api/auth/register', () => {
    it('returns 201 and a token for a valid new user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'new@example.com',
        password: 'hashed',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.user.email).toBe('new@example.com');
    });

    it('returns 400 for an invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'bad-email', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('returns 409 when the email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'taken@example.com',
        password: 'hashed',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'taken@example.com', password: 'password123' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 200 and a token for valid credentials', async () => {
      const passwordHash = await hashPassword('password123');
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: passwordHash,
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toEqual(expect.any(String));
    });

    it('returns 401 for incorrect credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });
});
