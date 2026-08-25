import { ProductListResult } from '../../product/ProductListResult';
import { ProductDetailView } from '../../product/ProductDetailView';

export interface ListProductsRequest {
  page: number;
  size: number;
}

export interface ProductUseCase {
  list(req: ListProductsRequest): Promise<ProductListResult>;
  getDetail(productIdx: number): Promise<ProductDetailView | null>;
}
