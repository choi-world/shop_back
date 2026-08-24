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
