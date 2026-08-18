import { ShoppingBasket } from '../../cart/ShoppingBasket';

export interface CartRepository {
  save(basket: ShoppingBasket): Promise<number>;
}
