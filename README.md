# back

쇼핑몰 프로젝트의 백엔드 API 서버.

## 기술 스택

- Node.js, Express, TypeScript
- Prisma (MySQL)
- 테스트: Jest

## 아키텍처

헥사고날 아키텍처(포트-어댑터)를 따릅니다. 자세한 규칙은 [CLAUDE.md](CLAUDE.md) 참고.

- `src/domain/` — 코어 도메인 로직 및 포트
- `src/adapter/` — 인바운드(HTTP)/아웃바운드(Prisma) 어댑터
- `src/main.ts` — 컴포지션 루트

## 명령어

```bash
npm install
npm run dev       # 개발 서버 실행
npm test          # 테스트
npm run typecheck # 타입체크
npm run lint      # lint
```
