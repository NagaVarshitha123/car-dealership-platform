import request from 'supertest';
import { Decimal } from '@prisma/client/runtime/library';
import { createApp } from '../../src/app';
import { signToken } from '../../src/utils/jwt';
import { createMockPrisma, MockPrisma } from '../mockPrisma';

function makeVehicle(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    make: 'Honda',
    model: 'Civic',
    category: 'Sedan',
    price: new Decimal(18000),
    quantity: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('Vehicle routes', () => {
  let prisma: MockPrisma;
  let app: ReturnType<typeof createApp>;
  let customerToken: string;
  let adminToken: string;

  beforeEach(() => {
    prisma = createMockPrisma();
    app = createApp(prisma);
    customerToken = signToken({ userId: 1, role: 'CUSTOMER' });
    adminToken = signToken({ userId: 2, role: 'ADMIN' });
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('rejects requests with a malformed token with 401', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  describe('GET /api/vehicles', () => {
    it('returns the list of vehicles for an authenticated user', async () => {
      prisma.vehicle.findMany.mockResolvedValue([makeVehicle()]);

      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].make).toBe('Honda');
    });
  });

  describe('GET /api/vehicles/search', () => {
    it('filters by query parameters', async () => {
      prisma.vehicle.findMany.mockResolvedValue([makeVehicle()]);

      const res = await request(app)
        .get('/api/vehicles/search?make=Honda&minPrice=10000&maxPrice=20000')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            make: { equals: 'Honda' },
            price: { gte: 10000, lte: 20000 },
          }),
        }),
      );
    });
  });

  describe('POST /api/vehicles', () => {
    it('creates a vehicle for an authenticated user', async () => {
      prisma.vehicle.create.mockResolvedValue(makeVehicle());

      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 18000, quantity: 4 });

      expect(res.status).toBe(201);
      expect(res.body.make).toBe('Honda');
    });

    it('returns 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ make: '', model: 'Civic', category: 'Sedan', price: 18000, quantity: 4 });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('updates an existing vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle());
      prisma.vehicle.update.mockResolvedValue(makeVehicle({ price: new Decimal(19000) }));

      const res = await request(app)
        .put('/api/vehicles/1')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ price: 19000 });

      expect(res.status).toBe(200);
      expect(Number(res.body.price)).toBe(19000);
    });

    it('returns 404 for a non-existent vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/vehicles/999')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ price: 19000 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('returns 403 for a non-admin user', async () => {
      const res = await request(app)
        .delete('/api/vehicles/1')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('returns 204 for an admin user deleting an existing vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle());
      prisma.vehicle.delete.mockResolvedValue(makeVehicle());

      const res = await request(app)
        .delete('/api/vehicles/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('decrements quantity and returns 200', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle({ quantity: 2 }));
      prisma.vehicle.update.mockResolvedValue(makeVehicle({ quantity: 1 }));

      const res = await request(app)
        .post('/api/vehicles/1/purchase')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(1);
    });

    it('returns 400 when out of stock', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle({ quantity: 0 }));

      const res = await request(app)
        .post('/api/vehicles/1/purchase')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('returns 403 for a non-admin user', async () => {
      const res = await request(app)
        .post('/api/vehicles/1/restock')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ amount: 3 });

      expect(res.status).toBe(403);
    });

    it('increments quantity for an admin user', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle({ quantity: 2 }));
      prisma.vehicle.update.mockResolvedValue(makeVehicle({ quantity: 5 }));

      const res = await request(app)
        .post('/api/vehicles/1/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 3 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(5);
    });
  });
});
