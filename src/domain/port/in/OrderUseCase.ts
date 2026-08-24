import { Order } from '../../order/Order';

export interface CheckoutRequest {
  user_idx: number;
  product_idxs: number[];
  zonecode: string;
  road_address: string;
  detail_address?: string;
  jibun_address?: string;
  receiver_name?: string;
  receiver_phone?: string;
}

export interface ConfirmRequest {
  order_idx: number;
  payment_key: string;
}

export interface OrderUseCase {
  checkout(req: CheckoutRequest): Promise<Order>;
  confirm(req: ConfirmRequest): Promise<Order>;
}
