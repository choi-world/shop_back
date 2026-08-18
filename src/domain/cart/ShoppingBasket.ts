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
    this.userIdx = params.userIdx;
    this.productIdx = params.productIdx;
    this.quantity = params.quantity;
    this.createdDt = params.createdDt;
    this.updatedDt = params.updatedDt;
  }
}
