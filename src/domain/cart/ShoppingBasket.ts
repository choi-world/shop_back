import { ValidationError } from '../error/ValidationError';

export class ShoppingBasket {
  readonly userIdx: number;
  readonly productIdx: number;
  readonly quantity: number;
  readonly createdDt?: Date;
  readonly updatedDt?: Date;

  constructor(params: {
    userIdx: number;
    productIdx: number;
    quantity: number;
    createdDt?: Date;
    updatedDt?: Date;
  }) {
    if (params.userIdx <= 0) throw new ValidationError('userIdx must be greater than 0');
    if (params.productIdx <= 0) throw new ValidationError('productIdx must be greater than 0');
    if (params.quantity <= 0) throw new ValidationError('quantity must be greater than 0');

    this.userIdx = params.userIdx;
    this.productIdx = params.productIdx;
    this.quantity = params.quantity;
    this.createdDt = params.createdDt;
    this.updatedDt = params.updatedDt;
  }
}
