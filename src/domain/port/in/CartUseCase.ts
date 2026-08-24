import { CartItemView } from '../../cart/CartItemView';

export interface CartCreateRequest {
  user_idx: number;
  product_idx: number;
  quantity: number;
}

export interface CartUpdateRequest {
  user_idx: number;
  product_idx: number;
  quantity: number;
}

export interface CartUseCase {
  create(body: CartCreateRequest): Promise<number>;
  update(body: CartUpdateRequest): Promise<number>;
  list(userIdx: number): Promise<CartItemView[]>;
  delete(userIdx: number, productIdx: number): Promise<void>;
}
