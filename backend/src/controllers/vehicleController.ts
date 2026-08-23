import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { VehicleService } from '../services/vehicleService';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../utils/errors';

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Invalid vehicle id');
  }
  return id;
}

function parseOptionalNumber(raw: unknown): number | undefined {
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (Number.isNaN(n)) throw new ValidationError('Invalid numeric query parameter');
  return n;
}

export function buildVehicleController(prisma: PrismaClient) {
  const service = new VehicleService(prisma);

  const create = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await service.create(req.body);
    res.status(201).json(vehicle);
  });

  const list = asyncHandler(async (_req: Request, res: Response) => {
    const vehicles = await service.findAll();
    res.status(200).json(vehicles);
  });

  const search = asyncHandler(async (req: Request, res: Response) => {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const results = await service.search({
      make: typeof make === 'string' ? make : undefined,
      model: typeof model === 'string' ? model : undefined,
      category: typeof category === 'string' ? category : undefined,
      minPrice: parseOptionalNumber(minPrice),
      maxPrice: parseOptionalNumber(maxPrice),
    });
    res.status(200).json(results);
  });

  const getOne = asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const vehicle = await service.findById(id);
    res.status(200).json(vehicle);
  });

  const update = asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const vehicle = await service.update(id, req.body);
    res.status(200).json(vehicle);
  });

  const remove = asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await service.delete(id);
    res.status(204).send();
  });

  const purchase = asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const vehicle = await service.purchase(id);
    res.status(200).json(vehicle);
  });

  const restock = asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const amount = req.body?.amount !== undefined ? Number(req.body.amount) : 1;
    const vehicle = await service.restock(id, amount);
    res.status(200).json(vehicle);
  });

  return { create, list, search, getOne, update, remove, purchase, restock };
}
