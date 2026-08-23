import { PrismaClient, Vehicle } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface CreateVehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export interface SearchVehicleParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

function assertValidCreateInput(input: CreateVehicleInput): void {
  if (!input.make || !input.make.trim()) throw new ValidationError('Make is required');
  if (!input.model || !input.model.trim()) throw new ValidationError('Model is required');
  if (!input.category || !input.category.trim()) throw new ValidationError('Category is required');
  if (input.price === undefined || input.price < 0) {
    throw new ValidationError('Price must be a non-negative number');
  }
  if (input.quantity === undefined || input.quantity < 0 || !Number.isInteger(input.quantity)) {
    throw new ValidationError('Quantity must be a non-negative integer');
  }
}

export class VehicleService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateVehicleInput): Promise<Vehicle> {
    assertValidCreateInput(input);
    return this.prisma.vehicle.create({
      data: {
        make: input.make.trim(),
        model: input.model.trim(),
        category: input.category.trim(),
        price: input.price,
        quantity: input.quantity,
      },
    });
  }

  async findAll(): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({ orderBy: { id: 'asc' } });
  }

  async findById(id: number): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundError(`Vehicle ${id} not found`);
    return vehicle;
  }

  async search(params: SearchVehicleParams): Promise<Vehicle[]> {
    const { make, model, category, minPrice, maxPrice } = params;

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new ValidationError('minPrice cannot be greater than maxPrice');
    }

    return this.prisma.vehicle.findMany({
      where: {
        ...(make ? { make: { equals: make } } : {}),
        ...(model ? { model: { equals: model } } : {}),
        ...(category ? { category: { equals: category } } : {}),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
              },
            }
          : {}),
      },
      orderBy: { id: 'asc' },
    });
  }

  async update(id: number, input: UpdateVehicleInput): Promise<Vehicle> {
    await this.findById(id); // throws NotFoundError if missing

    if (input.price !== undefined && input.price < 0) {
      throw new ValidationError('Price must be a non-negative number');
    }
    if (
      input.quantity !== undefined &&
      (input.quantity < 0 || !Number.isInteger(input.quantity))
    ) {
      throw new ValidationError('Quantity must be a non-negative integer');
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: { ...input },
    });
  }

  async delete(id: number): Promise<void> {
    await this.findById(id); // throws NotFoundError if missing
    await this.prisma.vehicle.delete({ where: { id } });
  }

  /** Decreases stock by one when a customer purchases a vehicle. */
  async purchase(id: number): Promise<Vehicle> {
    const vehicle = await this.findById(id);
    if (vehicle.quantity <= 0) {
      throw new ValidationError('Vehicle is out of stock');
    }
    return this.prisma.vehicle.update({
      where: { id },
      data: { quantity: vehicle.quantity - 1 },
    });
  }

  /** Increases stock by a given amount (default 1) — admin only. */
  async restock(id: number, amount = 1): Promise<Vehicle> {
    if (amount <= 0 || !Number.isInteger(amount)) {
      throw new ValidationError('Restock amount must be a positive integer');
    }
    const vehicle = await this.findById(id);
    return this.prisma.vehicle.update({
      where: { id },
      data: { quantity: vehicle.quantity + amount },
    });
  }
}
