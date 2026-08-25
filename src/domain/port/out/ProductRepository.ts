import { Product } from '../../product/Product';
import { ProductListResult } from '../../product/ProductListResult';
import { ProductDetailView } from '../../product/ProductDetailView';

export interface ProductListQuery {
  page: number;
  size: number;
}

export interface ProductRepository {
  findById(productIdx: number): Promise<Product | null>;
  list(query: ProductListQuery): Promise<ProductListResult>;
  findDetailById(productIdx: number): Promise<ProductDetailView | null>;
}
