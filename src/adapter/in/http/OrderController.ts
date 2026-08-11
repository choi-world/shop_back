import { Router } from 'express';
import { CreateOrderUseCase } from '../../../domain/port/in/CreateOrderUseCase';

// Inbound adapter: translates HTTP requests into a CreateOrderUseCase call.
// Depends only on the port interface, not on any concrete service/adapter.
export function createOrderController(createOrderUseCase: CreateOrderUseCase): Router {
  const router = Router();

  router.post('/orders', async (req, res) => {
    try {
      const order = await createOrderUseCase.execute(req.body);
      res.status(201).json(order);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  return router;
}
