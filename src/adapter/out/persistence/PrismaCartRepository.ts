import { PrismaClient } from '../../../generated/prisma/client';
import { CartRepository } from '../../../domain/port/out/CartRepository';
import { ShoppingBasket } from '../../../domain/cart/ShoppingBasket';

export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(basket: ShoppingBasket): Promise<number> {
    const saved = await this.prisma.shopping_basket.upsert({
      where: {
        user_idx_product_idx: {
          user_idx: basket.userIdx,
          product_idx: basket.productIdx,
        },
      },
      create: {
        user_idx: basket.userIdx,
        product_idx: basket.productIdx,
        quantity: basket.quantity,
      },
      update: {
        quantity: { increment: basket.quantity },
      },
    });

    return saved.quantity;
  }

  async findByUserAndProduct(userIdx: number, productIdx: number): Promise<ShoppingBasket | null> {
    const row = await this.prisma.shopping_basket.findUnique({
      where: {
        user_idx_product_idx: {
          user_idx: userIdx,
          product_idx: productIdx,
        },
      },
    });

    if (!row) return null;

    return new ShoppingBasket({
      userIdx: Number(row.user_idx),
      productIdx: Number(row.product_idx),
      quantity: row.quantity,
      createdDt: row.created_dt ?? undefined,
      updatedDt: row.updated_dt ?? undefined,
    });
  }
}
