import { PrismaClient, Prisma } from '../../../generated/prisma/client';
import { ProductRepository, ProductListQuery } from '../../../domain/port/out/ProductRepository';
import { Product } from '../../../domain/product/Product';
import { ProductListResult } from '../../../domain/product/ProductListResult';
import { ProductDetailView } from '../../../domain/product/ProductDetailView';

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

  async list(query: ProductListQuery): Promise<ProductListResult> {
    const where: Prisma.productWhereInput = { is_deleted: false };
    // 나중에 검색/가격 필터가 추가되면 여기에 조건만 덧붙이면 됨 (findMany/count 둘 다 이 where를 공유)

    const [rows, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (query.page - 1) * query.size,
        take: query.size,
        orderBy: { product_idx: 'asc' },
        include: {
          product_image: {
            where: { is_primary: true, is_deleted: false },
            take: 1,
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const items = rows.map((row) => ({
      productIdx: Number(row.product_idx),
      name: row.name,
      price: Number(row.price),
      stock: Number(row.stock),
      thumbnailUrl: row.product_image[0]?.image_url ?? null,
    }));

    return { items, totalCount };
  }

  async findDetailById(productIdx: number): Promise<ProductDetailView | null> {
    const row = await this.prisma.product.findUnique({
      where: { product_idx: productIdx },
      include: {
        product_image: {
          where: { is_deleted: false },
          orderBy: { is_primary: 'desc' },
        },
      },
    });

    if (!row || row.is_deleted) return null;

    return {
      productIdx: Number(row.product_idx),
      name: row.name,
      price: Number(row.price),
      stock: Number(row.stock),
      imageUrls: row.product_image.map((image) => image.image_url),
    };
  }
}
