# back

쇼핑몰 프로젝트의 백엔드 API 서버.

## 기술 스택

- Node.js, Express, TypeScript
- Prisma (MySQL)
- 인증: JWT(jsonwebtoken), bcrypt
- API 문서: swagger-jsdoc + swagger-ui-express
- 테스트: Jest

## 아키텍처

헥사고날 아키텍처(포트-어댑터)를 따릅니다. 자세한 규칙과 DTO 네이밍 규격은 [CLAUDE.md](CLAUDE.md) 참고.

- `src/domain/` — 코어 도메인 로직 및 포트
- `src/adapter/` — 인바운드(HTTP)/아웃바운드(Prisma, 결제, 보안) 어댑터
- `src/main.ts` — 컴포지션 루트

## 기능

- **Auth**: 회원가입/로그인(LOCAL), JWT 발급 및 검증 미들웨어. 소셜 로그인 확장 지점 마련됨.
- **Cart**: 담기/조회/수정/삭제. 전부 인증 필요.
- **Order**: 장바구니 선택 체크아웃(재고 예약, PENDING) → 결제 확정(PaymentGateway 검증, PAID/CANCELLED). 지금은 결제가 mock으로 항상 성공 처리됨.

## API 문서

서버 실행 후 `http://localhost:3000/api-docs`에서 Swagger UI로 확인 가능.

## 환경변수 (.env)

```
DATABASE_URL="mysql://<user>:<password>@localhost:3306/shop"
JWT_SECRET="..."
```

## 명령어

```bash
npm install
npm run dev       # 개발 서버 실행
npm test          # 테스트
npm run typecheck # 타입체크
npm run lint      # lint
npm run format    # prettier
```
