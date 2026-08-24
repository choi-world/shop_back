import { Router } from 'express';
import { CartUseCase } from '../../../domain/port/in/CartUseCase';
import { ValidationError } from '../../../domain/error/ValidationError';

export function createCartController(cartUseCase: CartUseCase): Router {
  const router = Router();

  // 실제로 장바구니 로직은 redis와 같은 인메모리 내에서 동작하는 게 좋음.
  // 현재는 RDB로 처리하며 결제가 완료되면 데이터 실삭제로 처리 예정.
  router.post('/cart/:userIdx', async (req, res) => {
    const userIdx = Number(req.params.userIdx);
    if (Number.isNaN(userIdx)) throw new ValidationError('userIdx는 숫자여야 합니다.');

    const basket = await cartUseCase.create({
      user_idx: userIdx,
      product_idx: req.body.product_idx,
      quantity: req.body.quantity,
    });
    res.status(201).json(basket);
  });

  router.get('/cart/:userIdx', async (req, res) => {
    const userIdx = Number(req.params.userIdx);
    if (Number.isNaN(userIdx)) throw new ValidationError('userIdx는 숫자여야 합니다.');

    const baskets = await cartUseCase.list(userIdx);
    res.status(200).json(baskets);
  });

  router.patch('/cart/:userIdx/:productIdx', async (req, res) => {
    const userIdx = Number(req.params.userIdx);
    const productIdx = Number(req.params.productIdx);
    if (Number.isNaN(userIdx) || Number.isNaN(productIdx)) {
      throw new ValidationError('userIdx, productIdx는 숫자여야 합니다.');
    }

    const quantity = await cartUseCase.update({
      user_idx: userIdx,
      product_idx: productIdx,
      quantity: req.body.quantity,
    });
    res.status(200).json(quantity);
  });

  router.delete('/cart/:userIdx/:productIdx', async (req, res) => {
    const userIdx = Number(req.params.userIdx);
    const productIdx = Number(req.params.productIdx);
    if (Number.isNaN(userIdx) || Number.isNaN(productIdx)) {
      throw new ValidationError('userIdx, productIdx는 숫자여야 합니다.');
    }

    await cartUseCase.delete(userIdx, productIdx);
    res.status(204).send();
  });

  return router;
}
