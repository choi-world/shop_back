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
}
