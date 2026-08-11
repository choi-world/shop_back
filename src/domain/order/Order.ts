import { randomUUID } from 'crypto';

export type OrderStatus = 'PENDING' | 'CONFIRMED';

export class Order {
  readonly id: string;
  readonly productName: string;
  readonly quantity: number;
  readonly status: OrderStatus;

  constructor(params: { id?: string; productName: string; quantity: number; status?: OrderStatus }) {
    if (!params.productName) throw new Error('productName is required');
    if (params.quantity <= 0) throw new Error('quantity must be greater than 0');

    this.id = params.id ?? randomUUID();
    this.productName = params.productName;
    this.quantity = params.quantity;
    this.status = params.status ?? 'PENDING';
  }
}
