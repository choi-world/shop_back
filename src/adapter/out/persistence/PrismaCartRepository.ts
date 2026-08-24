import { PrismaClient } from '../../../generated/prisma/client';
import { CartRepository } from '../../../domain/port/out/CartRepository';
import { ShoppingBasket } from '../../../domain/cart/ShoppingBasket';
import { CartItemView } from '../../../domain/cart/CartItemView';

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

    return row ? toDomain(row) : null;
  }

  async findByUser(userIdx: number): Promise<CartItemView[]> {
    const rows = await this.prisma.shopping_basket.findMany({
      where: { user_idx: userIdx, product: { is_deleted: false } },
      include: {
        product: {
          select: { name: true, price: true },
        },
      },
    });

    return rows.map((row) => ({
      productIdx: Number(row.product_idx),
      productName: row.product.name,
      price: Number(row.product.price),
      quantity: row.quantity,
    }));
  }

  async updateQuantity(userIdx: number, productIdx: number, quantity: number): Promise<number> {
    const updated = await this.prisma.shopping_basket.update({
      where: {
        user_idx_product_idx: {
          user_idx: userIdx,
          product_idx: productIdx,
        },
      },
      data: { quantity },
    });

    return updated.quantity;
  }
}

function toDomain(row: {
  user_idx: bigint;
  product_idx: bigint;
  quantity: number;
  created_dt: Date | null;
  updated_dt: Date | null;
}): ShoppingBasket {
  return new ShoppingBasket({
    userIdx: Number(row.user_idx),
    productIdx: Number(row.product_idx),
    quantity: row.quantity,
    createdDt: row.created_dt ?? undefined,
    updatedDt: row.updated_dt ?? undefined,
  });
}
