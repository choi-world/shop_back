import { CartCreateRequest, CartUpdateRequest, CartUseCase } from '../port/in/CartUseCase';
import { CartRepository } from '../port/out/CartRepository';
import { ProductRepository } from '../port/out/ProductRepository';
import { UserRepository } from '../port/out/UserRepository';
import { ShoppingBasket } from './ShoppingBasket';
import { CartItemView } from './CartItemView';
import { NotFoundError } from '../error/NotFoundError';
import { ConflictError } from '../error/ConflictError';

export class CartService implements CartUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(req: CartCreateRequest): Promise<number> {
    const user = await this.userRepository.findById(req.user_idx);
    if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

    const product = await this.productRepository.findById(req.product_idx);
    if (!product) throw new NotFoundError('상품을 찾을 수 없습니다.');

    const existing = await this.cartRepository.findByUserAndProduct(req.user_idx, req.product_idx);
    const totalQuantity = (existing?.quantity ?? 0) + req.quantity;
    if (product.stock < totalQuantity) throw new ConflictError('재고가 부족합니다.');

    const basket = new ShoppingBasket({
      userIdx: req.user_idx,
      productIdx: req.product_idx,
      quantity: req.quantity,
    });

    return this.cartRepository.save(basket);
  }

  async update(req: CartUpdateRequest): Promise<number> {
    const user = await this.userRepository.findById(req.user_idx);
    if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

    const product = await this.productRepository.findById(req.product_idx);
    if (!product) throw new NotFoundError('상품을 찾을 수 없습니다.');

    const existing = await this.cartRepository.findByUserAndProduct(req.user_idx, req.product_idx);
    if (!existing) throw new NotFoundError('장바구니에 담긴 상품이 아닙니다.');

    if (product.stock < req.quantity) throw new ConflictError('재고가 부족합니다.');

    const updated = new ShoppingBasket({
      userIdx: req.user_idx,
      productIdx: req.product_idx,
      quantity: req.quantity,
    });

    return this.cartRepository.updateQuantity(
      updated.userIdx,
      updated.productIdx,
      updated.quantity,
    );
  }

  async list(userIdx: number): Promise<CartItemView[]> {
    const user = await this.userRepository.findById(userIdx);
    if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

    return this.cartRepository.findByUser(userIdx);
  }
}
