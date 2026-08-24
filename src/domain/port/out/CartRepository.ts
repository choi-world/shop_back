import { ShoppingBasket } from '../../cart/ShoppingBasket';

export interface CartRepository {
  save(basket: ShoppingBasket): Promise<number>;
  findByUserAndProduct(userIdx: number, productIdx: number): Promise<ShoppingBasket | null>;
}
