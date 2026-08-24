import { Router } from 'express';
import { AuthUseCase } from '../../../domain/port/in/AuthUseCase';
import { ValidationError } from '../../../domain/error/ValidationError';

export function createAuthController(authUseCase: AuthUseCase): Router {
  const router = Router();

  router.post('/auth/signup', async (req, res) => {
    const result = await authUseCase.signup({
      phone_number: req.body.phone_number,
      password: req.body.password,
      name: req.body.name,
      gender: req.body.gender,
    });
    res.status(201).json(result);
  });

  // 공통 로그인 진입점. provider별로 다른 유스케이스로 분기한다.
  // 지금은 LOCAL만 지원 — 나중에 소셜 로그인이 추가되면 여기에
  // else if (provider === 'KAKAO') { ... } 분기만 추가하면 된다.
  router.post('/auth/login', async (req, res) => {
    const provider = req.body.provider ?? 'LOCAL';

    if (provider === 'LOCAL') {
      const result = await authUseCase.login({
        phone_number: req.body.phone_number,
        password: req.body.password,
      });
      res.status(200).json(result);
      return;
    }

    throw new ValidationError('지원하지 않는 로그인 방식입니다.');
  });

  return router;
}
