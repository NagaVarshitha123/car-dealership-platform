import { Decimal } from '@prisma/client/runtime/library';
import { VehicleService } from '../../src/services/vehicleService';
import { NotFoundError, ValidationError } from '../../src/utils/errors';
import { createMockPrisma, MockPrisma } from '../mockPrisma';

function makeVehicle(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    make: 'Toyota',
    model: 'Corolla',
    category: 'Sedan',
    price: new Decimal(20000),
    quantity: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('VehicleService', () => {
  let prisma: MockPrisma;
  let service: VehicleService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new VehicleService(prisma);
  });

  describe('create', () => {
    it('rejects a vehicle with a missing make', async () => {
      await expect(
        service.create({ make: '', model: 'Corolla', category: 'Sedan', price: 100, quantity: 1 }),
      ).rejects.toThrow(ValidationError);
    });

    it('rejects a negative price', async () => {
      await expect(
        service.create({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: -1, quantity: 1 }),
      ).rejects.toThrow(ValidationError);
    });

    it('rejects a non-integer quantity', async () => {
      await expect(
        service.create({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 100, quantity: 1.5 }),
      ).rejects.toThrow(ValidationError);
    });

    it('creates a vehicle with valid input', async () => {
      prisma.vehicle.create.mockResolvedValue(makeVehicle());

      const vehicle = await service.create({
        make: 'Toyota',
        model: 'Corolla',
        category: 'Sedan',
        price: 20000,
        quantity: 5,
      });

      expect(vehicle.make).toBe('Toyota');
      expect(prisma.vehicle.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('throws NotFoundError when the vehicle does not exist', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundError);
    });

    it('returns the vehicle when found', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle({ id: 42 }));
      const vehicle = await service.findById(42);
      expect(vehicle.id).toBe(42);
    });
  });

  describe('search', () => {
    it('rejects when minPrice is greater than maxPrice', async () => {
      await expect(service.search({ minPrice: 100, maxPrice: 50 })).rejects.toThrow(ValidationError);
    });

    it('passes filters through to prisma', async () => {
      prisma.vehicle.findMany.mockResolvedValue([makeVehicle()]);

      await service.search({ make: 'Toyota', category: 'Sedan', minPrice: 10000, maxPrice: 30000 });

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            make: { equals: 'Toyota' },
            category: { equals: 'Sedan' },
            price: { gte: 10000, lte: 30000 },
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundError for a missing vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.update(1, { price: 100 })).rejects.toThrow(NotFoundError);
    });

    it('rejects a negative price update', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle());
      await expect(service.update(1, { price: -5 })).rejects.toThrow(ValidationError);
    });

    it('updates the vehicle with valid fields', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle());
      prisma.vehicle.update.mockResolvedValue(makeVehicle({ price: new Decimal(25000) }));

      const updated = await service.update(1, { price: 25000 });

      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { price: 25000 },
      });
      expect(Number(updated.price)).toBe(25000);
    });
  });

  describe('delete', () => {
    it('throws NotFoundError for a missing vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.delete(1)).rejects.toThrow(NotFoundError);
    });

    it('deletes an existing vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle());
      prisma.vehicle.delete.mockResolvedValue(makeVehicle());

      await service.delete(1);

      expect(prisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('purchase', () => {
    it('throws ValidationError when quantity is zero', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle({ quantity: 0 }));
      await expect(service.purchase(1)).rejects.toThrow(ValidationError);
    });

    it('decrements quantity by one on purchase', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle({ quantity: 3 }));
      prisma.vehicle.update.mockResolvedValue(makeVehicle({ quantity: 2 }));

      const result = await service.purchase(1);

      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: 2 },
      });
      expect(result.quantity).toBe(2);
    });
  });

  describe('restock', () => {
    it('rejects a non-positive restock amount', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle());
      await expect(service.restock(1, 0)).rejects.toThrow(ValidationError);
    });

    it('increments quantity by the given amount', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle({ quantity: 3 }));
      prisma.vehicle.update.mockResolvedValue(makeVehicle({ quantity: 8 }));

      const result = await service.restock(1, 5);

      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: 8 },
      });
      expect(result.quantity).toBe(8);
    });

    it('defaults to restocking by 1', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(makeVehicle({ quantity: 3 }));
      prisma.vehicle.update.mockResolvedValue(makeVehicle({ quantity: 4 }));

      await service.restock(1);

      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: 4 },
      });
    });
  });
});
