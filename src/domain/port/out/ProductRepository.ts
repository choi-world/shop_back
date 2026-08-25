import { Product } from '../../product/Product';
import { ProductListResult } from '../../product/ProductListResult';

export interface ProductListQuery {
  page: number;
  size: number;
}

export interface ProductRepository {
  findById(productIdx: number): Promise<Product | null>;
  list(query: ProductListQuery): Promise<ProductListResult>;
}
