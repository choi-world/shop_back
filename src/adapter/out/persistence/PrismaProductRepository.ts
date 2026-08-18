import { PrismaClient } from '../../../generated/prisma/client';
import { ProductRepository } from '../../../domain/port/out/ProductRepository';

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}
}
