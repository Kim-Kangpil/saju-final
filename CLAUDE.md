# 한양사주 프로젝트 CLAUDE.md

## 절대 규칙
- 프로덕션 DB(Supabase) 직접 수정 금지
- main 브랜치 직접 push 금지 (항상 ui-renewal)
- 기존 엔드포인트 동작 변경 금지 (추가만)
- 한국어 인코딩: UTF-8 필수

## 프로젝트 구조
- Backend: FastAPI (Python) → backend/
- Frontend: Next.js App Router → frontend/
- 배포: Render (백엔드), Vercel (프론트)
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

## 현재 상품 구조
- 무료: 채팅 3회/일
- Pro: 월 4,900원 (채팅 무제한) ← CLAUDE.md 구버전엔 3,900원이었으나 4,900원으로 확정
- 기본 리포트: 1,900원
- 특화 리포트: 5,900원 (재물/연애/직업)
- 심화 리포트: 9,900원
- 궁합: 13,900원

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

### 최근 완료된 작업 (커밋됨)

| 파일 | 내용 | 커밋 |
|------|------|------|
| `frontend/app/chat/page.tsx` | 비구독 유저 일일 채팅 3회 제한 + 구독 유도 모달 (isPro, dailyChatCount, showExhaustedModal) | 0a0afea |
| `frontend/app/add-guest/page.tsx` | 게스트용 사주 등록 페이지 신규 추가 (/add-guest 라우트) | c9b2c42 |
| `frontend/components/PurchaseModal.tsx` | 공용 구매 모달 컴포넌트 신규 추가 (로그인 후 결제 리다이렉트 지원) | c9b2c42 |
| `frontend/app/page.tsx` | 랜딩 페이지 — 실사용자 후기 섹션(SECTION 4) 추가 | c9b2c42 |
| `frontend/app/saju-mypage/page.tsx` | 마이페이지 — isMember/purchasedCount/chatRemaining 상태 추가, 구매 리포트 수 표시 | c9b2c42 |
| `frontend/app/saju-preview/page.tsx` | 사주 미리보기 — "나의 사주 기본 리포트 무료 바로 보기" UI 추가 | c9b2c42 |
| `frontend/app/start/page.tsx` | 로그인 후 purchase_redirect localStorage 처리 (결제 흐름 연동) | c9b2c42 |
| `frontend/app/report/basic/intro/page.tsx` | 기본 리포트 인트로 페이지 리팩토링 (motion/KakaoPayButton 의존성 제거) | c9b2c42 |
| `frontend/app/report/basic/page.tsx` | 기본 리포트 소폭 수정 | c9b2c42 |
| `frontend/app/report/basic/v2/page.tsx` | 기본 리포트 v2 — UI 대폭 개선 | c9b2c42, e92b506 |
| `backend/main.py` | `/saju/analyze-guest` 엔드포인트 신규 추가 (비로그인 사주 분석) | c9b2c42 |

### 주요 구현 세부사항

**채팅 일일 제한 (chat/page.tsx)**
- localStorage 키: `chat_daily_count`, `chat_date` (자정 리셋)
- isPro: `/api/me` → `is_member` 필드로 판단
- 소진 배너: `#FBF8F3` 배경, `#8B7355` 버튼, `/membership` 이동
- 소진 모달: 3번째 전송 완료 직후 자동 오픈

**게스트 사주 등록 (/add-guest)**
- 비로그인 상태에서 이름+생년월일 입력 → `/saju/analyze-guest` 호출
- 결과를 localStorage에 저장 후 채팅/리포트 연동

**구매 흐름**
- 비로그인 구매 시도 → `purchase_redirect` localStorage 저장 → 로그인 후 자동 리다이렉트
- `PurchaseModal` 컴포넌트로 통합

### 미완료 / 확인 필요한 것들
- `/membership` 결제 연동은 카카오페이 코드 구현 완료 상태
- `add-guest` → 채팅 연동 실제 동작 테스트 필요
- `report/basic/v2` 배포 전 QA 필요
