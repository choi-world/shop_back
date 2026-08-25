import { Router } from 'express';
import { ProductUseCase } from '../../../domain/port/in/ProductUseCase';
import { ValidationError } from '../../../domain/error/ValidationError';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;

export function createProductController(productUseCase: ProductUseCase): Router {
  const router = Router();

  // 공개 API — 상품 구경은 로그인 없이도 가능해야 하므로 인증 미들웨어를 안 건다.
  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: 상품 목록 조회
   *     tags: [Product]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: size
   *         schema: { type: integer, default: 20 }
   *     responses:
   *       200:
   *         description: 상품 목록과 총 개수
   *       400:
   *         description: page, size가 유효하지 않음
   */
  router.get('/products', async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : DEFAULT_PAGE;
    const size = req.query.size ? Number(req.query.size) : DEFAULT_SIZE;
    if (Number.isNaN(page) || Number.isNaN(size)) {
      throw new ValidationError('page, size는 숫자여야 합니다.');
    }

    const result = await productUseCase.list({ page, size });
    res.status(200).json(result);
  });

  return router;
}
