import { Router } from 'express';
import { CartUseCase } from '../../../domain/port/in/CartUseCase';
import { ValidationError } from '../../../domain/error/ValidationError';

export function createCartController(cartUseCase: CartUseCase): Router {
  const router = Router();

  // 실제로 장바구니 로직은 redis와 같은 인메모리 내에서 동작하는 게 좋음.
  // 현재는 RDB로 처리하며 결제가 완료되면 데이터 실삭제로 처리 예정.
  router.post('/cart', async (req, res) => {
    const basket = await cartUseCase.create(req.body);
    res.status(201).json(basket);
  });

  router.get('/cart/:userIdx', async (req, res) => {
    const userIdx = Number(req.params.userIdx);
    if (Number.isNaN(userIdx)) throw new ValidationError('userIdx는 숫자여야 합니다.');

    const baskets = await cartUseCase.list(userIdx);
    res.status(200).json(baskets);
  });

  return router;
}
