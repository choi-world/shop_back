import { Order } from '../../order/Order';

export interface CreateOrderCommand {
  productName: string;
  quantity: number;
}

export interface CreateOrderUseCase {
  execute(command: CreateOrderCommand): Promise<Order>;
}
