import { ProductCreateRequest, ProductUseCase } from '../port/in/ProductUseCase';
import { ProductRepository } from '../port/out/ProductRepository';

export class ProductService implements ProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  create(_body: ProductCreateRequest): Promise<number> {
    throw new Error('not implemented');
  }
}
