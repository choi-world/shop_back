export class User {
  constructor(
    public readonly userIdx: number,
    public readonly name: string,
    public readonly phoneNumber: string,
    public readonly gender: boolean,
  ) {}
}
