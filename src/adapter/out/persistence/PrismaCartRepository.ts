import { PrismaClient, Prisma } from '../../../generated/prisma/client';
import { CartRepository } from '../../../domain/port/out/CartRepository';
import { ShoppingBasket } from '../../../domain/cart/ShoppingBasket';
import { CartItemView } from '../../../domain/cart/CartItemView';
import { ConflictError } from '../../../domain/error/ConflictError';

export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // 담긴 적 없는 상품(행이 아직 없음)은 락 없이 그냥 생성한다 — 없는 행에
  // FOR UPDATE를 걸면 갭락끼리 부딪혀서 데드락이 날 수 있기 때문. 아주 드물게
  // 그 사이에 다른 요청이 먼저 만들어버리면 기본키 충돌(P2002)만 나는데,
  // 이건 데드락이 아니라 "이미 생겼다"는 신호라 있는 케이스로 재시도하면 된다.
  async save(basket: ShoppingBasket, maxStock: number): Promise<number> {
    const existing = await this.prisma.shopping_basket.findUnique({
      where: {
        user_idx_product_idx: { user_idx: basket.userIdx, product_idx: basket.productIdx },
      },
    });

    if (!existing) {
      if (basket.quantity > maxStock) throw new ConflictError('재고가 부족합니다.');

      try {
        const created = await this.prisma.shopping_basket.create({
          data: {
            user_idx: basket.userIdx,
            product_idx: basket.productIdx,
            quantity: basket.quantity,
          },
        });
        return created.quantity;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          return this.addToExisting(basket, maxStock);
        }
        throw e;
      }
    }

    return this.addToExisting(basket, maxStock);
  }

  // 이미 있는 행에 더할 때는, "읽은 시점의 옛날 값"으로 검증하는 걸 막기 위해
  // 행을 FOR UPDATE로 잠근 뒤 그 트랜잭션 안에서 검증과 반영을 원자적으로 처리한다.
  // 이 시점엔 행이 존재함이 확인된 상태라 평범한 행 잠금이지, 갭락이 아니다.
  private async addToExisting(basket: ShoppingBasket, maxStock: number): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ quantity: number }[]>`
        SELECT quantity FROM shopping_basket
        WHERE user_idx = ${basket.userIdx} AND product_idx = ${basket.productIdx}
        FOR UPDATE
      `;

      const currentQuantity = Number(rows[0]?.quantity ?? 0);
      const newQuantity = currentQuantity + basket.quantity;

      if (newQuantity > maxStock) throw new ConflictError('재고가 부족합니다.');

      await tx.shopping_basket.update({
        where: {
          user_idx_product_idx: { user_idx: basket.userIdx, product_idx: basket.productIdx },
        },
        data: { quantity: newQuantity },
      });

      return newQuantity;
    });
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

  async delete(userIdx: number, productIdx: number): Promise<void> {
    await this.prisma.shopping_basket.delete({
      where: {
        user_idx_product_idx: {
          user_idx: userIdx,
          product_idx: productIdx,
        },
      },
    });
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
