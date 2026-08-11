import { CreateOrderCommand, CreateOrderUseCase } from '../port/in/CreateOrderUseCase';
import { OrderRepository } from '../port/out/OrderRepository';
import { Order } from './Order';

// Core service: implements the inbound port, depends only on the outbound port.
// No framework/library imports — keeps this testable without Express or Prisma.
export class CreateOrderService implements CreateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    const order = new Order(command);
    return this.orderRepository.save(order);
  }
}
