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
  /**
   * @swagger
   * /api/cart:
   *   post:
   *     summary: 장바구니에 담기
   *     tags: [Cart]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [product_idx, quantity]
   *             properties:
   *               product_idx: { type: integer, example: 1 }
   *               quantity: { type: integer, example: 2 }
   *     responses:
   *       201:
   *         description: 담긴 후 총 수량
   *       404:
   *         description: 상품을 찾을 수 없음
   *       409:
   *         description: 재고 부족
   */
  router.post('/cart', requireAuth, async (req, res) => {
    const basket = await cartUseCase.create({
      user_idx: req.userIdx!,
      product_idx: req.body.product_idx,
      quantity: req.body.quantity,
    });
    res.status(201).json(basket);
  });

  /**
   * @swagger
   * /api/cart:
   *   get:
   *     summary: 내 장바구니 조회
   *     tags: [Cart]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: 장바구니 항목 목록 (삭제된 상품 제외)
   */
  router.get('/cart', requireAuth, async (req, res) => {
    const baskets = await cartUseCase.list(req.userIdx!);
    res.status(200).json(baskets);
  });

  /**
   * @swagger
   * /api/cart/{productIdx}:
   *   patch:
   *     summary: 장바구니 수량 수정
   *     tags: [Cart]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: productIdx
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [quantity]
   *             properties:
   *               quantity: { type: integer, example: 3 }
   *     responses:
   *       200:
   *         description: 수정된 수량
   *       404:
   *         description: 장바구니에 담긴 상품이 아님
   *       409:
   *         description: 재고 부족
   */
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

  /**
   * @swagger
   * /api/cart/{productIdx}:
   *   delete:
   *     summary: 장바구니에서 삭제 (물리 삭제)
   *     tags: [Cart]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: productIdx
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       204:
   *         description: 삭제 성공
   *       404:
   *         description: 장바구니에 담긴 상품이 아님
   */
  router.delete('/cart/:productIdx', requireAuth, async (req, res) => {
    const productIdx = Number(req.params.productIdx);
    if (Number.isNaN(productIdx)) throw new ValidationError('productIdx는 숫자여야 합니다.');

    await cartUseCase.delete(req.userIdx!, productIdx);
    res.status(204).send();
  });

  return router;
}
