import jwt from 'jsonwebtoken';
import { TokenIssuer, TokenPayload } from '../../../domain/port/out/TokenIssuer';

export class JwtTokenIssuer implements TokenIssuer {
  constructor(private readonly secret: string) {}

  issue(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '3h' });
  }
}
