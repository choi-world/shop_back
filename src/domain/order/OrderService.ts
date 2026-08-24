import { CheckoutRequest, ConfirmRequest, OrderUseCase } from '../port/in/OrderUseCase';
import { OrderRepository, CheckoutItem } from '../port/out/OrderRepository';
import { PaymentGateway } from '../port/out/PaymentGateway';
import { CartRepository } from '../port/out/CartRepository';
import { ProductRepository } from '../port/out/ProductRepository';
import { UserRepository } from '../port/out/UserRepository';
import { Order } from './Order';
import { ValidationError } from '../error/ValidationError';
import { NotFoundError } from '../error/NotFoundError';
import { ConflictError } from '../error/ConflictError';

export class OrderService implements OrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentGateway: PaymentGateway,
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
  ) {}

  // 1단계: 주문을 PENDING으로 생성 (재고 예약). 결제는 아직 확정 전.
  async checkout(req: CheckoutRequest): Promise<Order> {
    if (req.product_idxs.length === 0) throw new ValidationError('주문할 상품이 없습니다.');
    if (new Set(req.product_idxs).size !== req.product_idxs.length) {
      throw new ValidationError('중복된 상품이 있습니다.');
    }
    if (!req.zonecode || !req.road_address)
      throw new ValidationError('배송지 정보가 올바르지 않습니다.');

    const user = await this.userRepository.findById(req.user_idx);
    if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

    const items: CheckoutItem[] = [];
    let totalAmount = 0;

    for (const productIdx of req.product_idxs) {
      const basketItem = await this.cartRepository.findByUserAndProduct(req.user_idx, productIdx);
      if (!basketItem) throw new NotFoundError('장바구니에 담긴 상품이 아닙니다.');

      const product = await this.productRepository.findById(productIdx);
      if (!product) throw new NotFoundError('상품을 찾을 수 없습니다.');

      if (product.stock < basketItem.quantity) throw new ConflictError('재고가 부족합니다.');

      items.push({
        productIdx,
        quantity: basketItem.quantity,
        unitPrice: product.price,
      });
      totalAmount += product.price * basketItem.quantity;
    }

    return this.orderRepository.placeOrder({
      userIdx: req.user_idx,
      items,
      totalAmount,
      zonecode: req.zonecode,
      roadAddress: req.road_address,
      detailAddress: req.detail_address,
      jibunAddress: req.jibun_address,
      receiverName: req.receiver_name,
      receiverPhone: req.receiver_phone,
    });
  }

  // 2단계: 클라이언트가 PG와 직접 통신해서 받아온 결제 키를 들고 확정을 요청한다.
  // 그 키가 실제로 유효한 결제인지는 백엔드가 PaymentGateway를 통해 직접 재검증한다
  // (클라이언트가 보낸 성공/실패 값을 그대로 믿지 않는다).
  async confirm(req: ConfirmRequest): Promise<Order> {
    const order = await this.orderRepository.findById(req.order_idx);
    // 존재하지 않는 주문과 "존재하지만 내 것이 아닌 주문"을 같은 메시지로 처리해서,
    // 다른 사람의 orderIdx를 추측해도 존재 여부조차 알 수 없게 한다.
    if (!order || order.userIdx !== req.user_idx)
      throw new NotFoundError('주문을 찾을 수 없습니다.');
    if (order.status !== 'PENDING') throw new ConflictError('이미 처리된 주문입니다.');

    const verification = await this.paymentGateway.verify(req.payment_key);

    if (!verification.success) {
      await this.orderRepository.cancelOrder(order.orderIdx);
      throw new ConflictError('결제 확인에 실패했습니다.');
    }

    return this.orderRepository.confirmPayment(order.orderIdx, order.userIdx);
  }
}
