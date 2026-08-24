import { Router } from 'express';
import { CartUseCase } from '../../../domain/port/in/CartUseCase';
import { ValidationError } from '../../../domain/error/ValidationError';
import { TokenIssuer } from '../../../domain/port/out/TokenIssuer';
import { createAuthMiddleware } from './authMiddleware';

export function createCartController(cartUseCase: CartUseCase, tokenIssuer: TokenIssuer): Router {
  const router = Router();
  const requireAuth = createAuthMiddleware(tokenIssuer);

  // 실제로 장바구니 로직은 redis와 같은 인메모리 내에서 동작하는 게 좋음.
  // 현재는 RDB로 처리하며 결제가 완료되면 데이터 실삭제로 처리 예정.
  router.post('/cart', requireAuth, async (req, res) => {
    const basket = await cartUseCase.create({
      user_idx: req.userIdx!,
      product_idx: req.body.product_idx,
      quantity: req.body.quantity,
    });
    res.status(201).json(basket);
  });

  router.get('/cart', requireAuth, async (req, res) => {
    const baskets = await cartUseCase.list(req.userIdx!);
    res.status(200).json(baskets);
  });

  router.patch('/cart/:productIdx', requireAuth, async (req, res) => {
    const productIdx = Number(req.params.productIdx);
    if (Number.isNaN(productIdx)) throw new ValidationError('productIdx는 숫자여야 합니다.');

    const quantity = await cartUseCase.update({
      user_idx: req.userIdx!,
      product_idx: productIdx,
      quantity: req.body.quantity,
    });
    res.status(200).json(quantity);
  });

  router.delete('/cart/:productIdx', requireAuth, async (req, res) => {
    const productIdx = Number(req.params.productIdx);
    if (Number.isNaN(productIdx)) throw new ValidationError('productIdx는 숫자여야 합니다.');

    await cartUseCase.delete(req.userIdx!, productIdx);
    res.status(204).send();
  });

  return router;
}
