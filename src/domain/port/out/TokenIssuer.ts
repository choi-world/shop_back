export interface TokenPayload {
  userIdx: number;
}

export interface TokenIssuer {
  issue(payload: TokenPayload): string;
  // 유효하지 않거나(서명 불일치, 만료 등) 파싱 실패하면 null을 반환한다.
  verify(token: string): TokenPayload | null;
}
