# CLAUDE.md

## 개요 **IMPORTANT**

이 프로젝트는 쇼핑몰 프로젝트로, 2026년 8월 11일을 기준으로 생성되었다. 해당 프로젝트는 실제 결제 모듈은 모킹으로 대체하고 결제 프로세스를 구성한다. 이에 따라 동시성 등의 다양한 문제들을 직면하고 테스트하는 것을 목표로 한다. 다만, 차후에 프로젝트의 범위를 넓힐 확장성을 고려할 수도 있다. (실제 쇼핑몰처럼 운영하기 위한 개발을 진행 예정)

## 규칙 **IMPORTANT**

- 새 라이브러리/패키지 추가, DB 스키마 변경, 아키텍처 레벨 결정은 사전 승인받는다.
- 코드 스타일, 변수/함수명 등 구현 디테일은 자유롭게 판단해도 된다.
- 요청자의 질문에는 공식 문서를 우선 근거로 답변한다. 공식 문서에 없는 내용은 출처(커뮤니티 링크 등)를 명시하고 "확실하지 않을 수 있다"는 점을 함께 알린다.
- `hexagonal architecture` 아키텍처를 준수한다.
- 코드 변경 후 관련 테스트를 실행하고 결과를 보여준다. (`npm test`)
- 커밋 전 lint, typecheck를 통과시킨다.

## 아키텍처 규칙

- Core: `src/domain/`
- Port (in): `src/domain/port/in/` # UseCase 인터페이스 (예: CreateOrderUseCase)
- Port (out): `src/domain/port/out/` # Core가 필요로 하는 인터페이스 (예: OrderRepository)
- Adapter (in): `src/adapter/in/` # Port-in을 호출하는 쪽 (예: Controller)
- Adapter (out): `src/adapter/out/` # Port-out을 구현하는 쪽 (예: Repository)
- Composition root: `src/main.ts`
- Core는 어떤 프레임워크/라이브러리도 import하지 않는다.

## 네이밍 규칙 (DTO 타입)

계층 간 주고받는 입출력 타입은 아래 접미사로 통일한다. 새로운 이름(`~Criteria`, `~Params`, `~Dto` 등)을 임의로 만들지 않는다.

| 용도                                                             | 접미사     | 예시                                                      |
| ---------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| 유스케이스(port-in)로 들어오는 입력                              | `~Request` | `CheckoutRequest`, `SignupRequest`, `ListProductsRequest` |
| 리포지토리(port-out)에 전달하는 **쓰기(생성/수정)** 입력         | `~Command` | `PlaceOrderCommand`, `CreateAuthCommand`                  |
| 리포지토리(port-out)에 전달하는 **읽기(필터/페이지네이션)** 입력 | `~Query`   | `ProductListQuery`                                        |
| 엔티티가 아닌, 조회 전용 응답(여러 테이블 join 결과 등)          | `~View`    | `CartItemView`, `ProductView`                             |

## 기술 스택

- Backend: Node.js, express.js
- DB: MySQL

## 명령어

- 개발: `npm run dev`
- 테스트: `npm test`
- 타입체크: `npm run typecheck`
- lint: `npm run lint`
