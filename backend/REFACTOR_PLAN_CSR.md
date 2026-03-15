# Controller - Service - Repository 전환 플랜

## 1. 목표 구조

```
backend/
├── main.py                    # 앱 생성, CORS, 라우터 등록만
├── auth_kakao.py              # (유지) OAuth 라우터
├── auth_google2.py            # (유지) OAuth 라우터
├── config.py                  # [신규] 설정·환경변수 집약
├── dependencies.py            # [신규] FastAPI Depends (get_current_user_id 등)
│
├── controllers/               # HTTP 레이어 (요청/응답만)
│   ├── __init__.py
│   ├── health.py              # /, /ping, /health
│   ├── user_controller.py     # /api/me, /api/seeds, /api/analysis/deduct
│   ├── saju_controller.py     # /api/saju/*, /saju/full, /saju/pillars, /saju/interpret-gpt, /saju/summary-gpt, /saju/concern-analysis
│   ├── payment_controller.py  # /payment/create, /payment/confirm
│   └── contact_controller.py  # /api/contact
│
├── services/                  # 비즈니스 로직
│   ├── __init__.py
│   ├── user_service.py        # 사용자 조회, 씨앗 차감
│   ├── saju_service.py        # 사주 저장/조회/목록, 기둥 계산 오케스트레이션
│   ├── saju_analysis_service.py  # full 분석, interpret-gpt, summary-gpt, concern-analysis
│   ├── payment_service.py    # 주문 생성, 결제 검증·확인
│   └── contact_service.py    # 문의 저장
│
├── repositories/              # 데이터 접근만 (DB CRUD)
│   ├── __init__.py
│   ├── user_repository.py     # users.db (기존 logic/user_db.py 이전)
│   ├── saju_repository.py    # saju.db (기존 logic/saju_db.py 이전)
│   ├── payment_repository.py  # payments.db (기존 logic/payment_db.py 이전)
│   └── contact_repository.py # contact.db (기존 logic/contact_db.py 이전)
│
├── schemas/                   # [선택] Pydantic 요청/응답 모델 집약
│   ├── __init__.py
│   ├── saju.py
│   ├── user.py
│   ├── payment.py
│   └── contact.py
│
└── logic/                     # 도메인/인프라 (그대로 유지)
    ├── user_db.py             # → 삭제 후 repositories/user_repository.py 로 대체
    ├── saju_db.py             # → 삭제 후 repositories/saju_repository.py 로 대체
    ├── payment_db.py         # → 삭제 후 repositories/payment_repository.py 로 대체
    ├── contact_db.py         # → 삭제 후 repositories/contact_repository.py 로 대체
    ├── session_token.py      # 유지 (의존성에서 사용)
    ├── test.py               # 유지 (사주 기둥 계산)
    ├── lunar_converter.py    # 유지
    ├── twelve_states.py      # 유지
    ├── jijanggan.py          # 유지
    ├── saju_engine/          # 유지 (Service에서 호출)
    ├── gpt_generator.py      # 유지
    ├── theory_retriever.py    # 유지
    └── solar_terms_db.json   # 유지
```

---

## 2. 레이어 역할 정의

| 레이어 | 역할 | main.py 현재 코드 기준 |
|--------|------|-------------------------|
| **Controller** | HTTP 요청 수신, 입력 검증(Pydantic), Service 호출, HTTP 응답/예외 반환 | `@app.get/post` 핸들러 전체 |
| **Service** | 유스케이스 오케스트레이션, 트랜잭션 경계, Repository·도메인 로직 호출 | 핸들러 내부의 DB 호출 + 사주/GPT 로직 |
| **Repository** | DB 연결, SQL 실행, 결과를 dict/엔티티로 반환. 비즈니스 로직 없음 | `logic/user_db.py`, `saju_db.py`, `payment_db.py`, `contact_db.py` |

---

## 3. 단계별 이전 계획

### Phase 0: 준비 (공통)

- [ ] `config.py` 생성: `DB_PATH`, `OPENAI_API_KEY`, `FRONTEND_URL`, `CORS_ORIGINS` 등 환경변수 집약
- [ ] `dependencies.py` 생성: `get_current_user_id(request: Request) -> Optional[int]` (기존 `get_user_id_from_request` 이동), 필요 시 `get_current_user_id_required` (401 반환)
- [ ] `schemas/` 생성(선택): `main.py`의 Pydantic 모델을 `schemas/*.py`로 이동

### Phase 1: Repository 도입

- [ ] `repositories/user_repository.py`: `logic/user_db.py` 함수들을 클래스 또는 함수 그룹으로 이전  
  - `init_user_db` → Repository 초기화 또는 `init_*` 유지  
  - `get_or_create_user`, `get_user_by_id`, `get_seed_balance`, `deduct_seed`, `get_user_id_from_session` 등
- [ ] `repositories/saju_repository.py`: `logic/saju_db.py` 이전 (`init_saju_db`, `get_saju_count_for_user`, `get_saju_by_id`, `get_saju_list_for_user`, `save_saju_for_user`)
- [ ] `repositories/payment_repository.py`: `logic/payment_db.py` 이전
- [ ] `repositories/contact_repository.py`: `logic/contact_db.py` 이전
- [ ] 기존 `logic/*_db.py`는 서비스/컨트롤러가 새 Repository를 쓰도록 바꾼 뒤 삭제

### Phase 2: Service 도입

- [ ] `services/user_service.py`
  - `get_me(user_id)` → UserRepository 조회, 응답 DTO 반환
  - `get_seeds(user_id)` → UserRepository.seed_balance
  - `deduct_seed(user_id, amount)` → UserRepository.deduct_seed, 성공/실패 결과 반환
- [ ] `services/saju_service.py`
  - `get_count(user_id)`, `get_list(user_id)`, `get_by_id(saju_id, user_id)`, `save(user_id, payload)` → SajuRepository 호출
- [ ] `services/saju_analysis_service.py`
  - `run_full_saju(req)` → `logic.test` + `twelve_states` + `jijanggan` (기존 `/saju/full` 로직)
  - `run_interpret_gpt(req)` → `saju_engine.core.analyzer` + `theory_retriever` + `gpt_generator` (기존 `/saju/interpret-gpt` 로직)
  - `run_summary_gpt(system, user)` → OpenAI 호출 (기존 `/saju/summary-gpt`)
  - `run_concern_analysis(req)` → 분석 + GPT (기존 `/saju/concern-analysis`)
- [ ] `services/payment_service.py`: 주문 번호 생성, PortOne 검증, PaymentRepository 저장
- [ ] `services/contact_service.py`: ContactRepository.save_inquiry

### Phase 3: Controller 도입

- [ ] `controllers/health.py`: `GET /`, `GET /ping`, `GET /health` → 라우터로 등록
- [ ] `controllers/user_controller.py`: `GET /api/me`, `GET /api/seeds`, `POST /api/analysis/deduct` → Depends(get_current_user_id), UserService 호출
- [ ] `controllers/saju_controller.py`:
  - `GET /api/saju/count`, `GET /api/saju/list`, `POST /api/saju/save`, `GET /api/saju/{saju_id}` → SajuService
  - `POST /saju/full`, `POST /saju/pillars`, `POST /saju/interpret-gpt`, `POST /saju/summary-gpt`, `POST /saju/concern-analysis*` → SajuAnalysisService
- [ ] `controllers/payment_controller.py`: `POST /payment/create`, `POST /payment/confirm` → PaymentService
- [ ] `controllers/contact_controller.py`: `POST /api/contact` → ContactService

### Phase 4: main.py 정리

- [ ] `main.py`는 앱 생성, CORS, `config` 로드, DB 초기화(Repository init), `app.include_router(kakao_router)`, `app.include_router(google_router)`, `app.include_router(health_router)`, `app.include_router(user_controller.router)` 등만 수행
- [ ] 모든 라우트 핸들러는 Controller로 이동 완료 후 main.py에서 제거

### Phase 5: 검증 및 정리

- [ ] 기존 API와 동일 동작인지 수동/자동 테스트
- [ ] `logic/user_db.py`, `saju_db.py`, `payment_db.py`, `contact_db.py` 삭제
- [ ] import 경로 정리 (logic.session_token, logic.test 등은 그대로 service에서 사용)

---

## 4. 도메인별 매핑 요약

| 도메인 | Controller | Service | Repository | 비고 |
|--------|------------|---------|------------|------|
| Health | health | - | - | 정보/핑만 |
| User | user_controller | user_service | user_repository | 씨앗 차감 포함 |
| Saju | saju_controller | saju_service + saju_analysis_service | saju_repository | 분석은 logic 의존 |
| Payment | payment_controller | payment_service | payment_repository | PortOne 호출은 Service |
| Contact | contact_controller | contact_service | contact_repository | - |

---

## 5. 의존성 방향

```
Controller → Service → Repository
                ↓
            logic (saju_engine, gpt_generator, test, session_token, ...)
```

- Controller는 Service만 호출하고, Request/Response만 다룸.
- Service는 Repository + logic 모듈만 사용 (다른 Service 호출 가능).
- Repository는 DB와 스키마만 알고, 비즈니스 규칙은 갖지 않음.

---

## 6. 권장 진행 순서

1. **Phase 0** → config, dependencies, (선택) schemas
2. **Phase 1** → Repository 4개 생성 후 기존 `*_db` 함수를 Repository로 위임하도록 main.py만 잠시 수정해 동작 확인
3. **Phase 2** → Service 5개 생성, 기존 main.py 핸들러가 Service를 호출하도록 변경
4. **Phase 3** → Controller로 라우트 이전, main.py는 라우터 등록만
5. **Phase 4~5** → main 정리, DB 모듈 삭제, 테스트

한 번에 한 도메인(User → Saju → Payment → Contact)씩 Repository → Service → Controller 순으로 옮겨도 됩니다.
