export class Product {
  constructor(
    public readonly productIdx: number,
    public readonly companyIdx: number,
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number,
  ) {}
}
