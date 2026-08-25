import { Router } from 'express';
import { OrderUseCase } from '../../../domain/port/in/OrderUseCase';
import { ValidationError } from '../../../domain/error/ValidationError';
import { TokenIssuer } from '../../../domain/port/out/TokenIssuer';
import { createAuthMiddleware } from './authMiddleware';

export function createOrderController(
  orderUseCase: OrderUseCase,
  tokenIssuer: TokenIssuer,
): Router {
  const router = Router();
  const requireAuth = createAuthMiddleware(tokenIssuer);

  /**
   * @swagger
   * /api/orders/checkout:
   *   post:
   *     summary: 장바구니 중 선택한 상품으로 주문 생성 (PENDING, 재고 예약)
   *     tags: [Order]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [product_idxs, zonecode, road_address]
   *             properties:
   *               product_idxs:
   *                 type: array
   *                 items: { type: integer }
   *                 example: [1, 2]
   *               zonecode: { type: string, example: "12345" }
   *               road_address: { type: string, example: "서울시 강남구 테헤란로 1" }
   *               detail_address: { type: string, example: "101동 101호" }
   *               jibun_address: { type: string }
   *               receiver_name: { type: string, example: "홍길동" }
   *               receiver_phone: { type: string, example: "01012345678" }
   *     responses:
   *       201:
   *         description: 생성된 주문 (status는 PENDING)
   *       404:
   *         description: 장바구니에 없는 상품이 포함됨
   *       409:
   *         description: 재고 부족
   */
  router.post('/orders/checkout', requireAuth, async (req, res) => {
    if (!Array.isArray(req.body.product_idxs)) {
      throw new ValidationError('product_idxs는 배열이어야 합니다.');
    }

    const order = await orderUseCase.checkout({
      user_idx: req.userIdx!,
      product_idxs: req.body.product_idxs,
      zonecode: req.body.zonecode,
      road_address: req.body.road_address,
      detail_address: req.body.detail_address,
      jibun_address: req.body.jibun_address,
      receiver_name: req.body.receiver_name,
      receiver_phone: req.body.receiver_phone,
    });
    res.status(201).json(order);
  });

  /**
   * @swagger
   * /api/orders/{orderIdx}/confirm:
   *   post:
   *     summary: 결제 확정 (결제 키를 PaymentGateway로 재검증 후 PAID/CANCELLED 처리)
   *     tags: [Order]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: orderIdx
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [payment_key]
   *             properties:
   *               payment_key: { type: string }
   *     responses:
   *       200:
   *         description: 확정된 주문 (status는 PAID)
   *       404:
   *         description: 주문이 없거나 본인 주문이 아님
   *       409:
   *         description: 이미 처리된 주문이거나 결제 확인 실패 (재고는 자동 원복됨)
   */
  router.post('/orders/:orderIdx/confirm', requireAuth, async (req, res) => {
    const orderIdx = Number(req.params.orderIdx);
    if (Number.isNaN(orderIdx)) throw new ValidationError('orderIdx는 숫자여야 합니다.');

    const order = await orderUseCase.confirm({
      order_idx: orderIdx,
      user_idx: req.userIdx!,
      payment_key: req.body.payment_key,
    });
    res.status(200).json(order);
  });

  return router;
}
