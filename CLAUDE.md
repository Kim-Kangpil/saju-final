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
- Pro: 월 3,900원 (채팅 무제한)
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
