import { Router } from 'express';
import { ProductUseCase } from '../../../domain/port/in/ProductUseCase';
import { ValidationError } from '../../../domain/error/ValidationError';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;

// page/size는 숫자가 아니거나(Infinity, 소수 등 포함) 1 미만이면 에러 대신 디폴트로 조정한다.
function parsePositiveInt(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) && Number.isInteger(num) && num >= 1 ? num : fallback;
}

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
   *         description: 숫자가 아니거나 1 미만이면 디폴트(1)로 처리
   *       - in: query
   *         name: size
   *         schema: { type: integer, default: 10 }
   *         description: 숫자가 아니거나 1 미만이면 디폴트(10)로 처리
   *     responses:
   *       200:
   *         description: 상품 목록과 총 개수
   *       400:
   *         description: size가 최대치를 초과함
   */
  router.get('/products', async (req, res) => {
    const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
    const size = parsePositiveInt(req.query.size, DEFAULT_SIZE);

    const result = await productUseCase.list({ page, size });
    res.status(200).json(result);
  });

  /**
   * @swagger
   * /api/products/{productIdx}:
   *   get:
   *     summary: 상품 상세 조회
   *     tags: [Product]
   *     parameters:
   *       - in: path
   *         name: productIdx
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: 상품 상세 정보 (없으면 null)
   *       400:
   *         description: productIdx가 유효하지 않음
   */
  router.get('/products/:productIdx', async (req, res) => {
    const productIdx = Number(req.params.productIdx);
    if (Number.isNaN(productIdx)) throw new ValidationError('productIdx는 숫자여야 합니다.');

    const result = await productUseCase.getDetail(productIdx);
    res.status(200).json(result);
  });

  return router;
}
