import { PrismaClient } from '../../../generated/prisma/client';
import { OrderRepository } from '../../../domain/port/out/OrderRepository';
import { Order, OrderStatus } from '../../../domain/order/Order';

// Outbound adapter: fulfills OrderRepository using Prisma/MySQL.
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(order: Order): Promise<Order> {
    const saved = await this.prisma.order.create({
      data: {
        id: order.id,
        productName: order.productName,
        quantity: order.quantity,
        status: order.status,
      },
    });
    return toDomain(saved);
  }

  async findById(id: string): Promise<Order | null> {
    const found = await this.prisma.order.findUnique({ where: { id } });
    return found ? toDomain(found) : null;
  }
}

function toDomain(row: { id: string; productName: string; quantity: number; status: string }): Order {
  return new Order({ ...row, status: row.status as OrderStatus });
}
