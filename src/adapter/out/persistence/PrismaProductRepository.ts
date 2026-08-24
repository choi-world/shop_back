import { PrismaClient } from '../../../generated/prisma/client';
import { ProductRepository } from '../../../domain/port/out/ProductRepository';
import { Product } from '../../../domain/product/Product';

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(productIdx: number): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({
      where: { product_idx: productIdx },
    });

    if (!row || row.is_deleted) return null;

    return new Product(
      Number(row.product_idx),
      Number(row.company_idx),
      row.name,
      Number(row.price),
      Number(row.stock),
    );
  }
}
