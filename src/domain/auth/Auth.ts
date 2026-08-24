export class Auth {
  constructor(
    public readonly authIdx: number,
    public readonly userIdx: number,
    public readonly provider: string,
    public readonly providerKey: string,
    public readonly accountName: string | null,
    public readonly passwordHash: string | null,
  ) {}
}
