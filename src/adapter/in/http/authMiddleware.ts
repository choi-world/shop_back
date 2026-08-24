import { Request, Response, NextFunction } from 'express';
import { TokenIssuer } from '../../../domain/port/out/TokenIssuer';
import { UnauthorizedError } from '../../../domain/error/UnauthorizedError';

// Express 5는 async 핸들러의 reject를 자동으로 next(err)에 넘겨주지만,
// 이 미들웨어는 동기 함수라 그냥 throw해도 Express가 알아서 잡아준다.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userIdx?: number;
    }
  }
}

export function createAuthMiddleware(tokenIssuer: TokenIssuer) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('인증 토큰이 필요합니다.');
    }

    const token = header.slice('Bearer '.length);
    const payload = tokenIssuer.verify(token);
    if (!payload) throw new UnauthorizedError('유효하지 않거나 만료된 토큰입니다.');

    req.userIdx = payload.userIdx;
    next();
  };
}
