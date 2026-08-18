import { Router } from 'express';
import { CartUseCase } from '../../../domain/port/in/CartUseCase';

export function createCartController(cartUseCase: CartUseCase): Router {
  const router = Router();

  // 실제로 장바구니 로직은 redis와 같은 인메모리 내에서 동작하는 게 좋음.
  // 현재는 RDB로 처리하며 결제가 완료되면 데이터 실삭제로 처리 예정.
  router.post('/cart', async (req, res) => {
    try {
      const basket = await cartUseCase.create(req.body);
      res.status(201).json(basket);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  return router;
}
