import { Router } from 'express';
import { ProductUseCase } from '../../../domain/port/in/ProductUseCase';

export function createProductController(productUseCase: ProductUseCase): Router {
  const router = Router();

  router.post('/products', async (req, res) => {
    try {
      const product = await productUseCase.create(req.body);
      res.status(201).json(product);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  return router;
}
