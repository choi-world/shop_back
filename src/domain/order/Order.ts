import { OrderItem } from './OrderItem';

export class Order {
  constructor(
    public readonly orderIdx: number,
    public readonly userIdx: number,
    public readonly totalAmount: number,
    public readonly status: string,
    public readonly items: OrderItem[],
  ) {}
}
