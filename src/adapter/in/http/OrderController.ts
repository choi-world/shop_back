import { Router } from 'express';
import { OrderUseCase } from '../../../domain/port/in/OrderUseCase';
import { ValidationError } from '../../../domain/error/ValidationError';

export function createOrderController(orderUseCase: OrderUseCase): Router {
  const router = Router();

  router.post('/orders/:userIdx/checkout', async (req, res) => {
    const userIdx = Number(req.params.userIdx);
    if (Number.isNaN(userIdx)) throw new ValidationError('userIdx는 숫자여야 합니다.');
    if (!Array.isArray(req.body.product_idxs)) {
      throw new ValidationError('product_idxs는 배열이어야 합니다.');
    }

    const order = await orderUseCase.checkout({
      user_idx: userIdx,
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

  router.post('/orders/:orderIdx/confirm', async (req, res) => {
    const orderIdx = Number(req.params.orderIdx);
    if (Number.isNaN(orderIdx)) throw new ValidationError('orderIdx는 숫자여야 합니다.');

    const order = await orderUseCase.confirm({
      order_idx: orderIdx,
      payment_key: req.body.payment_key,
    });
    res.status(200).json(order);
  });

  return router;
}
