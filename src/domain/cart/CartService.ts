import { CartCreateRequest, CartUseCase } from '../port/in/CartUseCase';
import { CartRepository } from '../port/out/CartRepository';
import { ShoppingBasket } from './ShoppingBasket';

export class CartService implements CartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async create(req: CartCreateRequest): Promise<number> {
    const basket = new ShoppingBasket({
      userIdx: req.user_idx,
      productIdx: req.product_idx,
      quantity: req.quantity,
    });

    return this.cartRepository.save(basket);
  }
}
