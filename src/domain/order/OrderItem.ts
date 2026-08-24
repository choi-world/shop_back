export class OrderItem {
  constructor(
    public readonly productIdx: number,
    public readonly quantity: number,
    public readonly unitPrice: number,
  ) {}
}
