import jwt from 'jsonwebtoken';
import { TokenIssuer, TokenPayload } from '../../../domain/port/out/TokenIssuer';

export class JwtTokenIssuer implements TokenIssuer {
  constructor(private readonly secret: string) {}

  issue(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '3h' });
  }

  verify(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (typeof decoded === 'string' || typeof decoded.userIdx !== 'number') return null;

      return { userIdx: decoded.userIdx };
    } catch {
      // 서명 불일치, 만료(TokenExpiredError) 등 jwt.verify가 던지는 모든 실패를
      // 여기서 흡수해서 "유효하지 않은 토큰"이라는 단일 결과로 통일한다.
      return null;
    }
  }
}
