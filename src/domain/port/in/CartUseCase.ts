export interface CartCreateRequest {
  user_idx: number;
  product_idx: number;
  quantity: number;
}

export interface CartUseCase {
  create(body: CartCreateRequest): Promise<number>;
}
