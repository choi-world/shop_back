import { ListProductsRequest, ProductUseCase } from '../port/in/ProductUseCase';
import { ProductRepository } from '../port/out/ProductRepository';
import { ProductListResult } from './ProductListResult';
import { ProductDetailView } from './ProductDetailView';
import { ValidationError } from '../error/ValidationError';

const MAX_PAGE_SIZE = 100;

export class ProductService implements ProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async list(req: ListProductsRequest): Promise<ProductListResult> {
    if (req.page < 1) throw new ValidationError('page는 1 이상이어야 합니다.');
    if (req.size < 1 || req.size > MAX_PAGE_SIZE) {
      throw new ValidationError(`size는 1 이상 ${MAX_PAGE_SIZE} 이하여야 합니다.`);
    }

    return this.productRepository.list(req);
  }

  async getDetail(productIdx: number): Promise<ProductDetailView | null> {
    return this.productRepository.findDetailById(productIdx);
  }
}
