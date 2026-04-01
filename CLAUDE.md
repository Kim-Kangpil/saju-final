# 한양사주 프로젝트 CLAUDE.md

## 절대 규칙
- 프로덕션 DB(Supabase) 직접 수정 금지
- main 브랜치 직접 push 금지 (항상 ui-renewal)
- 기존 엔드포인트 동작 변경 금지 (추가만)
- 한국어 인코딩: UTF-8 필수

## 프로젝트 구조
- Backend: FastAPI (Python) → backend/
- Frontend: Next.js App Router → frontend/
- 배포: Render (백엔드 + 프론트엔드 모두)
- DB: PostgreSQL (Supabase)
- 브랜치: ui-renewal (작업) / main (배포)

## 핵심 파일 지도
- 사주 엔진: backend/logic/saju_engine/core/
- 해석 엔진: backend/logic/saju_engine/core/saju_interpreter.py
- GPT 생성: backend/logic/gpt_generator.py
- 채팅 API: frontend/app/api/chat/route.ts
- 리포트: frontend/app/report/
- 결제: backend/main.py (/api/payment/*)

## 기술 스택
- Python 3.11, FastAPI, psycopg2
- Next.js 15, TypeScript, Tailwind
- OpenAI gpt-4o (리포트/채팅)
- 폰트: GmarketSans

## 코딩 규칙
- 에러 처리: try/except + logger.warning
- DB: backend/logic/_db.py의 get_conn() 사용
- 새 엔드포인트: main.py에 추가
- 컴포넌트: PascalCase, frontend/components/

## 사주 해석 원칙 (핵심)
- 규칙 엔진이 계산 → GPT는 언어 변환만
- 할루시네이션 방지: 계산된 데이터만 GPT에 전달
- 사주 용어 금지: 현실 언어로만 출력

## 현재 상품 구조 (2026-04-01 확정)
- 무료: 채팅 3회/일 + 기본 리포트
- Pro: 월 4,900원 (채팅 무제한 + 매월 특화 리포트 1개 + 월간 세운 브리핑)
- 기본 리포트: **무료**
- 특화 리포트: 2,900원 (재물/연애/직업)
- 심화 리포트: 4,900원 (대운 포함)
- 궁합: 3,900원
- 대운+세운 연간 리포트: 9,900원 (신규, 킬러 상품)

## 환경변수
- backend/.env 에 있음
- TEST_MODE=true (개발 중)
- KAKAO_PAY_CID=TC0ONETIME (테스트)

## 작업 전 필수 확인
1. 현재 브랜치가 ui-renewal인지
2. python main.py 오류 없는지
3. 기존 기능 동작 유지되는지

---

## 현재 로컬 파일 상태 (2026-04-01 기준, 브랜치: ui-renewal)

### 구현 완료 목록 (2026-04-01 기준)

| 파일 | 내용 |
|------|------|
| `frontend/app/chat/page.tsx` | 일일 채팅 3회 제한 (isPro, dailyChatCount, 소진 모달) |
| `frontend/app/add-guest/page.tsx` | 게스트 사주 등록 → `/saju/analyze-guest` 호출 → sessionStorage 저장 |
| `frontend/components/PurchaseModal.tsx` | 비로그인 구매 시도 → 로그인 후 자동 리다이렉트 |
| `frontend/app/membership/page.tsx` | Pro 구독 카카오페이 결제 연동 완료 (order_type: pro_monthly) |
| `frontend/app/report/basic/intro/page.tsx` | 기본 리포트 인트로 — 무료 전환 (결제 제거) |
| `frontend/app/report/basic/v2/page.tsx` | 기본 리포트 결과 페이지 (1,342줄, 게스트 지원) |
| `frontend/app/report/deep/page.tsx` | 심화 리포트 결과 페이지 (대운 분석, AI 채팅 CTA) |
| `frontend/app/report/money/page.tsx` | 재물 리포트 결과 페이지 (직설 분석 추가구매 옵션) |
| `frontend/app/report/love/page.tsx` | 연애 리포트 결과 페이지 (직설 분석 추가구매 옵션) |
| `frontend/app/report/career/page.tsx` | 직업 리포트 결과 페이지 (직설 분석 추가구매 옵션) |
| `frontend/app/saju-preview/page.tsx` | 기본 리포트 "무료" 뱃지 + "무료로 바로 보기" 텍스트 |
| `backend/main.py` | `/saju/analyze-guest` 엔드포인트 (비로그인 사주 분석) |

### 주요 구현 세부사항

**채팅 일일 제한**
- localStorage 키: `chat_daily_count`, `chat_date` (자정 리셋)
- isPro: `/api/me` → `is_member` 필드
- 소진 모달: 3번째 전송 완료 직후 자동 오픈

**기본 리포트 무료 전환**
- intro 페이지: KakaoPayButton 제거 → 바로 v2로 이동
- v2 페이지: `/saju/analyze-v2` 호출 (크레딧 체크 없음, 로그인만 필요)
- 백엔드 변경 없음

**구매 흐름**
- 비로그인 구매 시도 → `purchase_redirect` localStorage 저장 → 로그인 후 자동 리다이렉트
- `PurchaseModal` 컴포넌트로 통합

### 주의 사항
- `seed-charge` 페이지: order_type "basic"으로 분析권 판매 중 — 기본 리포트 무료화 이후 이 페이지의 역할 재정의 필요 (현재는 특화/심화 크레딧 용도로 혼용)
