import { Product } from '../../product/Product';

export interface ProductRepository {
  findById(productIdx: number): Promise<Product | null>;
}
