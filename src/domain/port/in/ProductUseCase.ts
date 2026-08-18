export interface ProductCreateRequest {
  company_idx: number;
  name: string;
  price: number;
  stock: number;
}

export interface ProductUseCase {
  create(body: ProductCreateRequest): Promise<number>;
}
