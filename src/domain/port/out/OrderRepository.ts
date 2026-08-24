import { Order } from '../../order/Order';

export interface CheckoutItem {
  productIdx: number;
  quantity: number;
  unitPrice: number;
}

export interface PlaceOrderCommand {
  userIdx: number;
  items: CheckoutItem[];
  totalAmount: number;
  zonecode: string;
  roadAddress: string;
  detailAddress?: string;
  jibunAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
}

export interface OrderRepository {
  // 재고 예약(차감) + orders(PENDING) + order_product 생성. 결제 확정 전 상태.
  placeOrder(command: PlaceOrderCommand): Promise<Order>;
  findById(orderIdx: number): Promise<Order | null>;
  // 결제 성공 시: orders를 PAID로 변경 + 해당 주문에 담긴 상품들을 장바구니에서 제거.
  confirmPayment(orderIdx: number, userIdx: number): Promise<Order>;
  // 결제 실패 시: 예약해뒀던 재고를 원복 + orders를 CANCELLED로 변경.
  cancelOrder(orderIdx: number): Promise<Order>;
}
