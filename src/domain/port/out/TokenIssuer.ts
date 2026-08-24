export interface TokenPayload {
  userIdx: number;
}

export interface TokenIssuer {
  issue(payload: TokenPayload): string;
}
