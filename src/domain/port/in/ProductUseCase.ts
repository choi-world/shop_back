import { ProductListResult } from '../../product/ProductListResult';

export interface ListProductsRequest {
  page: number;
  size: number;
}

export interface ProductUseCase {
  list(req: ListProductsRequest): Promise<ProductListResult>;
}
