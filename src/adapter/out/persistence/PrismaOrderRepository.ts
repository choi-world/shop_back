import { PrismaClient } from '../../../generated/prisma/client';
import { OrderRepository, PlaceOrderCommand } from '../../../domain/port/out/OrderRepository';
import { Order } from '../../../domain/order/Order';
import { OrderItem } from '../../../domain/order/OrderItem';
import { ConflictError } from '../../../domain/error/ConflictError';

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // 재고 예약(차감) + orders(PENDING) + order_product 생성을 하나의 트랜잭션으로 묶는다.
  // 장바구니는 아직 건드리지 않는다 — 결제 결과가 나오기 전까지는 확정된 게 아니라서,
  // 실패하면 사용자가 장바구니에서 그대로 다시 시도할 수 있어야 한다.
  async placeOrder(command: PlaceOrderCommand): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      // "재고 확인 후 차감"을 두 단계로 나누면 동시 요청 사이에 재고가 마이너스로
      // 떨어질 수 있다(TOCTOU). updateMany의 where에 stock >= quantity 조건을 걸어서
      // "조건을 만족할 때만 차감"을 한 번의 원자적 쿼리로 처리한다.
      for (const item of command.items) {
        const result = await tx.product.updateMany({
          where: { product_idx: item.productIdx, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) throw new ConflictError('재고가 부족합니다.');
      }

      const order = await tx.orders.create({
        data: {
          user_idx: command.userIdx,
          total_amount: command.totalAmount,
          zonecode: command.zonecode,
          road_address: command.roadAddress,
          detail_address: command.detailAddress,
          jibun_address: command.jibunAddress,
          receiver_name: command.receiverName,
          receiver_phone: command.receiverPhone,
          status: 'PENDING',
        },
      });

      // unit_price는 지금 product.price가 아니라, 서비스 레이어에서 미리 스냅샷해온 값을
      // 그대로 저장한다 — 나중에 상품 가격이 바뀌어도 이 주문의 결제 금액은 안 바뀌어야 하니까.
      await tx.order_product.createMany({
        data: command.items.map((item) => ({
          order_idx: order.order_idx,
          product_idx: item.productIdx,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      });

      return new Order(
        Number(order.order_idx),
        Number(order.user_idx),
        Number(order.total_amount),
        order.status,
        command.items.map((item) => new OrderItem(item.productIdx, item.quantity, item.unitPrice)),
      );
    });
  }

  async findById(orderIdx: number): Promise<Order | null> {
    const order = await this.prisma.orders.findUnique({ where: { order_idx: orderIdx } });
    if (!order) return null;

    const items = await this.prisma.order_product.findMany({ where: { order_idx: orderIdx } });
    return toOrder(order, items);
  }

  // 결제 성공 시 호출된다. 주문을 PAID로 확정하고, 그제서야 해당 상품들을 장바구니에서
  // 물리 삭제한다 (소프트 삭제 안 씀 — 처음 설계 때 정한 대로).
  async confirmPayment(orderIdx: number, userIdx: number): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      // 트랜잭션 안의 쿼리는 같은 커넥션을 공유해서 실제로는 순차 실행된다 —
      // Promise.all로 감싸도 병렬로 도는 게 아니라서, 그냥 순서대로 await한다.
      const order = await tx.orders.update({
        where: { order_idx: orderIdx },
        data: { status: 'PAID' },
      });
      const items = await tx.order_product.findMany({ where: { order_idx: orderIdx } });

      await tx.shopping_basket.deleteMany({
        where: {
          user_idx: userIdx,
          product_idx: { in: items.map((item) => item.product_idx) },
        },
      });

      return toOrder(order, items);
    });
  }

  // 결제 실패 시 호출된다. placeOrder에서 예약(차감)해뒀던 재고를 원복하고 주문을 취소 처리한다.
  async cancelOrder(orderIdx: number): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      const items = await tx.order_product.findMany({ where: { order_idx: orderIdx } });

      for (const item of items) {
        await tx.product.update({
          where: { product_idx: item.product_idx },
          data: { stock: { increment: item.quantity } },
        });
      }

      const order = await tx.orders.update({
        where: { order_idx: orderIdx },
        data: { status: 'CANCELLED' },
      });

      return toOrder(order, items);
    });
  }
}

function toOrder(
  order: { order_idx: bigint; user_idx: bigint; total_amount: bigint; status: string },
  items: { product_idx: bigint; quantity: number; unit_price: bigint }[],
): Order {
  return new Order(
    Number(order.order_idx),
    Number(order.user_idx),
    Number(order.total_amount),
    order.status,
    items.map(
      (item) => new OrderItem(Number(item.product_idx), item.quantity, Number(item.unit_price)),
    ),
  );
}
