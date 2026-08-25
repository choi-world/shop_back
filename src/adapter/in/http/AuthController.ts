import { Router } from 'express';
import { AuthUseCase } from '../../../domain/port/in/AuthUseCase';
import { ValidationError } from '../../../domain/error/ValidationError';

export function createAuthController(authUseCase: AuthUseCase): Router {
  const router = Router();

  /**
   * @swagger
   * /api/auth/signup:
   *   post:
   *     summary: 회원가입 (LOCAL)
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [phone_number, password, name, gender]
   *             properties:
   *               phone_number: { type: string, example: "01012345678" }
   *               password: { type: string, example: "pw1234" }
   *               name: { type: string, example: "홍길동" }
   *               gender: { type: boolean, example: false }
   *     responses:
   *       201:
   *         description: 가입 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 userIdx: { type: integer }
   *       409:
   *         description: 이미 가입된 전화번호
   */
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
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: 로그인 (공통 진입점, 지금은 LOCAL만 지원)
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [phone_number, password]
   *             properties:
   *               provider: { type: string, example: "LOCAL", description: "생략 시 LOCAL" }
   *               phone_number: { type: string, example: "01012345678" }
   *               password: { type: string, example: "pw1234" }
   *     responses:
   *       200:
   *         description: 로그인 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken: { type: string }
   *       401:
   *         description: 전화번호 또는 비밀번호 불일치
   */
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
