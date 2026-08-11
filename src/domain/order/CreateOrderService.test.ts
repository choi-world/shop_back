import { CreateOrderService } from './CreateOrderService';
import { OrderRepository } from '../port/out/OrderRepository';
import { Order } from './Order';

// In-memory fake for the outbound port — demonstrates the core is testable
// without Express or Prisma.
class FakeOrderRepository implements OrderRepository {
  orders: Order[] = [];

  async save(order: Order): Promise<Order> {
    this.orders.push(order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) ?? null;
  }
}

describe('CreateOrderService', () => {
  it('creates and persists an order', async () => {
    const repository = new FakeOrderRepository();
    const useCase = new CreateOrderService(repository);

    const order = await useCase.execute({ productName: 'keyboard', quantity: 2 });

    expect(order.productName).toBe('keyboard');
    expect(order.status).toBe('PENDING');
    expect(repository.orders).toHaveLength(1);
  });

  it('rejects a non-positive quantity', async () => {
    const useCase = new CreateOrderService(new FakeOrderRepository());

    await expect(useCase.execute({ productName: 'keyboard', quantity: 0 })).rejects.toThrow(
      'quantity must be greater than 0'
    );
  });
});
