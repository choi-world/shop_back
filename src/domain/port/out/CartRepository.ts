import { ShoppingBasket } from '../../cart/ShoppingBasket';
import { CartItemView } from '../../cart/CartItemView';

export interface CartRepository {
  save(basket: ShoppingBasket): Promise<number>;
  findByUserAndProduct(userIdx: number, productIdx: number): Promise<ShoppingBasket | null>;
  findByUser(userIdx: number): Promise<CartItemView[]>;
  updateQuantity(userIdx: number, productIdx: number, quantity: number): Promise<number>;
  delete(userIdx: number, productIdx: number): Promise<void>;
}
