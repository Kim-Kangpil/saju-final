# ==================== 1. 환경변수 로드 (가장 먼저!) ====================
import openai
from logic.twelve_states import calculate_twelve_states, get_twelve_state
from logic import test
from logic import lunar_converter
from logic.jijanggan import calculate_jijanggan_for_pillars
from auth_kakao import router as kakao_router
from auth_google2 import router as google_router
import os
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Request
from typing import Optional
from datetime import datetime
import asyncio
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# ==================== 2. 나머지 import ====================

# ==================== 3. OpenAI 클라이언트 초기화 ====================
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    print(f"🔑 API Key 로드됨: {api_key[:10]}...")
    try:
        from openai import OpenAI
        client = OpenAI(
            api_key=api_key,
            timeout=30.0,
            max_retries=2
        )
        print("✅ OpenAI 클라이언트 초기화 성공")
    except Exception as e:
        print(f"⚠️ OpenAI 클라이언트 초기화 실패: {e}")
        client = None
else:
    print("⚠️  OPENAI_API_KEY 없음")
    client = None

# ==================== 4. FastAPI 앱 생성 ====================
app = FastAPI(title="Saju API", version="0.1.0")
app.include_router(kakao_router)
app.include_router(google_router)

# ... 나머지 코드 그대로 ...

# CORS: credentials(쿠키) 사용 시 allow_origins에 "*" 불가 → 명시적 origin 필요
_cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
_frontend_url = (os.getenv("FRONTEND_URL") or "").strip().rstrip("/")
if _frontend_url and _frontend_url not in _cors_origins:
    _cors_origins.append(_frontend_url)
_cors_origins_str = os.getenv("CORS_ORIGINS", "").strip()
if _cors_origins_str:
    for o in _cors_origins_str.split(","):
        o = o.strip().rstrip("/")
        if o and o not in _cors_origins:
            _cors_origins.append(o)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 로드
DB_PATH = Path(__file__).resolve().parent / "logic" / "solar_terms_db.json"
DB = test.load_db(str(DB_PATH))
if DB is None:
    raise RuntimeError(f"solar_terms_db.json 로드 실패: {DB_PATH}")

from logic.saju_db import (
    init_saju_db,
    get_saju_count_for_user,
    get_saju_by_id,
    get_saju_list_for_user,
    save_saju_for_user,
)
from logic.user_db import get_user_id_from_session, get_user_by_id, get_seed_balance

# 결제 DB 초기화
try:
    from logic.payment_db import init_payments_db
    init_payments_db()
    print("✅ 결제 DB 초기화 완료")
except Exception as e:
    print(f"⚠️ 결제 DB 초기화: {e}")

# 사용자 DB 초기화
try:
    from logic.user_db import init_user_db
    init_user_db()
    print("✅ 사용자 DB 초기화 완료")
except Exception as e:
    print(f"⚠️ 사용자 DB 초기화: {e}")

# 사주 DB 초기화
try:
    init_saju_db()
    print("✅ 사주 DB 초기화 완료")
except Exception as e:
    print(f"⚠️ 사주 DB 초기화: {e}")

# 문의 DB 초기화
save_inquiry = None
try:
    from logic.contact_db import init_contact_db, save_inquiry
    init_contact_db()
    print("✅ 문의 DB 초기화 완료")
except Exception as e:
    print(f"⚠️ 문의 DB 초기화: {e}")
    save_inquiry = None

# ==================== 루트 경로 추가 ====================

@app.get("/ping")
def ping():
    """서버 응답 여부 확인용 — 의존성 없음"""
    return "pong"


@app.get("/")
def root():
    """API 루트 - 서비스 정보 제공"""
    return {
        "service": "🔮 Saju Backend API",
        "status": "running",
        "version": "0.1.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json",
            "saju_full": "/saju/full",
            "saju_pillars": "/saju/pillars",
            "saju_interpret_gpt": "/saju/interpret-gpt",
            "saju_summary_gpt": "/saju/summary-gpt",
            "saju_concern_analysis": "/saju/concern-analysis",
            "payment_confirm": "/payment/confirm",
            "payment_create": "/payment/create"
        }
    }


@app.get("/api/saju/count")
def get_saju_count(request: Request):
    """
    현재 계정의 저장된 사주 개수를 반환합니다.
    hsaju_session 쿠키(숫자 user_id 또는 "kakao:provider_id" 형태)를 파싱해 조회합니다.
    """
    raw = request.cookies.get("hsaju_session")
    user_id = get_user_id_from_session(raw) if raw else None
    if user_id is None:
        return {"count": 0}
    try:
        count = get_saju_count_for_user(user_id)
        return {"count": count}
    except Exception as e:
        print(f"⚠️ /api/saju/count DB 조회 실패: {e}")
        return {"count": 0}


@app.get("/api/me")
def get_me(request: Request):
    """
    현재 로그인한 사용자 정보(provider, email, nickname)를 반환합니다.
    hsaju_session 쿠키로 user_id를 확인한 뒤 users 테이블에서 조회합니다.
    """
    raw = request.cookies.get("hsaju_session")
    user_id = get_user_id_from_session(raw) if raw else None
    if user_id is None:
        return {"ok": False, "provider": None, "email": None, "nickname": None}
    try:
        user = get_user_by_id(user_id)
        if not user:
            return {"ok": False, "provider": None, "email": None, "nickname": None}
        return {
            "ok": True,
            "provider": user.get("provider"),
            "email": user.get("email"),
            "nickname": user.get("nickname"),
        }
    except Exception as e:
        print(f"⚠️ /api/me 조회 실패: {e}")
        return {"ok": False, "provider": None, "email": None, "nickname": None}


@app.get("/api/seeds")
def get_seeds(request: Request):
    """
    현재 로그인한 사용자의 씨앗 잔액을 반환합니다.
    hsaju_session 쿠키로 user_id를 확인한 뒤 users.seed_balance를 반환합니다.
    """
    raw = request.cookies.get("hsaju_session")
    user_id = get_user_id_from_session(raw) if raw else None
    if user_id is None:
        return {"seeds": 0}
    try:
        seeds = get_seed_balance(user_id)
        return {"seeds": seeds}
    except Exception as e:
        print(f"⚠️ /api/seeds 조회 실패: {e}")
        return {"seeds": 0}


class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str


@app.post("/api/contact")
def post_contact(req: ContactRequest):
    """
    문의하기 폼 전송. inquiries 테이블에 저장합니다.
    """
    if save_inquiry is None:
        raise HTTPException(status_code=503, detail="문의 저장 기능을 사용할 수 없습니다.")
    if not (req.name and req.name.strip() and req.email and req.email.strip() and req.message and req.message.strip()):
        raise HTTPException(status_code=400, detail="이름, 이메일, 문의 내용은 필수입니다.")
    try:
        inquiry_id = save_inquiry(
            name=req.name.strip(),
            email=req.email.strip(),
            subject=(req.subject or "").strip() or "기타",
            message=req.message.strip(),
        )
        return {"ok": True, "id": inquiry_id}
    except Exception as e:
        print(f"⚠️ /api/contact 저장 실패: {e}")
        raise HTTPException(status_code=500, detail="문의 저장에 실패했습니다.")

# ==================== 모델 정의 ====================


class SajuRequest(BaseModel):
    calendar_type: str = Field(default="solar", description="solar 또는 lunar")
    year: int
    month: int
    day: int
    hour: int = Field(ge=0, le=23)
    minute: int = Field(ge=0, le=59)
    gender: str = Field(description="M 또는 F")
    is_leap_month: bool = Field(
        default=False, description="calendar_type이 lunar일 때만 의미 있음")


class PillarsResponse(BaseModel):
    input_datetime: str
    solar_datetime_used: str
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str


class FullResponse(PillarsResponse):
    daeun_start_age: int
    daeun_direction: str
    daeun_list: list


class InterpretRequest(BaseModel):
    day_stem: str
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str
    tone: str = "empathy"


class GPTInterpretRequest(BaseModel):
    """GPT 해석 요청 모델"""
    day_stem: str
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str
    tone: str = "empathy"
    year: Optional[int] = None
    month: Optional[int] = None
    day: Optional[int] = None
    hour: Optional[int] = None
    minute: Optional[int] = None
    gender: Optional[str] = None


class SummaryGPTRequest(BaseModel):
    """종합 요약 GPT 요청 (프론트에서 system + user 프롬프트 전달)"""
    system: str
    user: str


class ConcernAnalysisRequest(BaseModel):
    """고민 분석 요청 — 사주 기본 정보 + 고민 텍스트"""
    day_stem: str = Field(description="일간 한자 1글자 (甲~癸)")
    year_pillar: str = Field(description="년주 예: 庚辰")
    month_pillar: str = Field(description="월주")
    day_pillar: str = Field(description="일주")
    hour_pillar: str = Field(description="시주")
    concern: str = Field(max_length=200, description="고민 텍스트 (최대 200자)")


class PaymentConfirmRequest(BaseModel):
    """결제 확인 요청 (포트원 결제 완료 후 프론트에서 전달)"""
    user_id: str
    payment_id: str
    order_id: str


class PaymentCreateRequest(BaseModel):
    """결제 요청 생성 (주문 번호 발급)"""
    user_id: Optional[str] = None
    product_key: Optional[str] = None  # 없으면 고민분석, "seed_1"|"seed_5"|"seed_10" 이면 씨앗 상품


class SajuSaveRequest(BaseModel):
    """사주 저장용 요청 모델"""
    name: str
    relation: Optional[str] = None
    birthdate: str  # YYYY-MM-DD
    birth_time: Optional[str] = None  # HH:MM 또는 None
    calendar_type: str  # 양력 / 음력
    gender: str  # 남자 / 여자


# ==================== 헬퍼 함수 ====================

def _parse_gender(g: str) -> str:
    g = (g or "").strip().upper()
    if g not in ("M", "F"):
        raise ValueError("gender는 M 또는 F")
    return g


def _to_datetime(req: SajuRequest) -> tuple:
    gender = _parse_gender(req.gender)

    if req.calendar_type not in ("solar", "lunar"):
        raise ValueError("calendar_type은 solar 또는 lunar")

    if req.calendar_type == "solar":
        solar_dt = datetime(req.year, req.month, req.day, req.hour, req.minute)
        return solar_dt, solar_dt

    solar_y, solar_m, solar_d = lunar_converter.convert_lunar_to_solar(
        req.year, req.month, req.day, req.is_leap_month
    )
    solar_dt = datetime(solar_y, solar_m, solar_d, req.hour, req.minute)
    return solar_dt, solar_dt


def calculate_element_counts(pillars: dict) -> dict:
    """오행 카운트 계산"""
    element_map = {
        "甲": "wood", "乙": "wood",
        "丙": "fire", "丁": "fire",
        "戊": "earth", "己": "earth",
        "庚": "metal", "辛": "metal",
        "壬": "water", "癸": "water",
        "寅": "wood", "卯": "wood",
        "巳": "fire", "午": "fire",
        "辰": "earth", "戌": "earth", "丑": "earth", "未": "earth",
        "申": "metal", "酉": "metal",
        "子": "water", "亥": "water",
    }

    counts = {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0}

    for pillar in pillars.values():
        for char in pillar:
            element = element_map.get(char)
            if element:
                counts[element] += 1

    return counts


def get_title_by_tone(tone: str) -> str:
    """톤에 따른 제목 반환"""
    titles = {
        "empathy": "당신의 오행 에너지",
        "reality": "오행 분포 분석",
        "fun": "너 오행 밸런스 어때?"
    }
    return titles.get(tone, "오행 분석")


def format_ten_gods(ten_gods: dict) -> str:
    """십성 포맷팅"""
    lines = []
    for god, count in ten_gods.items():
        if count > 0:
            lines.append(f"- {god}: {count}개")
    return "\n".join(lines) if lines else "없음"


def split_pillar(pillar: str) -> tuple:
    """기둥을 천간/지지로 분리"""
    if len(pillar) >= 2:
        return pillar[0], pillar[1]
    return '', ''


# ==================== 엔드포인트 ====================

@app.get("/health")
def health():
    return {"ok": True}


@app.post("/saju/full")
async def get_full_saju(req: SajuRequest):
    """✅ 전체 사주 분석 (프론트엔드에서 사용)"""
    try:
        birth_dt, solar_dt_used = _to_datetime(req)

        yj = test.calculate_year_pillar(solar_dt_used, DB)
        mj = test.calculate_month_pillar(solar_dt_used, yj, DB)
        dj = test.calculate_day_pillar(solar_dt_used)
        sj = test.calculate_hour_pillar(solar_dt_used, dj)

        # 십이운성 계산 (일간 기준)
        try:
            hanja_map = {
                "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무",
                "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계",
                "子": "자", "丑": "축", "寅": "인", "卯": "묘", "辰": "진",
                "巳": "사", "午": "오", "未": "미", "申": "신", "酉": "유",
                "戌": "술", "亥": "해"
            }

            # 일간(日干)
            day_stem = hanja_map.get(dj[0], "")

            # 각 지지
            hour_branch = hanja_map.get(sj[1], "")
            day_branch = hanja_map.get(dj[1], "")
            month_branch = hanja_map.get(mj[1], "")
            year_branch = hanja_map.get(yj[1], "")

            twelve_states = {
                "hour": get_twelve_state(day_stem, hour_branch),
                "day": get_twelve_state(day_stem, day_branch),
                "month": get_twelve_state(day_stem, month_branch),
                "year": get_twelve_state(day_stem, year_branch)
            }

            print(f"✅ 십이운성 (일간: {day_stem}): {twelve_states}")
        except Exception as e:
            print(f"⚠️ 십이운성 계산 실패: {e}")
            import traceback
            traceback.print_exc()
            twelve_states = {}

        # 🔥 지장간 계산
        try:
            jijanggan_pillars = {
                "hour": {"jiji": hanja_map.get(sj[1], "")},
                "day": {"jiji": hanja_map.get(dj[1], "")},
                "month": {"jiji": hanja_map.get(mj[1], "")},
                "year": {"jiji": hanja_map.get(yj[1], "")}
            }
            jijanggan = calculate_jijanggan_for_pillars(jijanggan_pillars)
            print(f"✅ 지장간: {jijanggan}")
        except Exception as e:
            print(f"⚠️ 지장간 계산 실패: {e}")
            import traceback
            traceback.print_exc()
            jijanggan = {}

        return {
            "input_datetime": f"{req.year}-{req.month:02d}-{req.day:02d} {req.hour:02d}:{req.minute:02d}",
            "solar_datetime_used": solar_dt_used.strftime("%Y-%m-%d %H:%M"),
            "year_pillar": yj,
            "month_pillar": mj,
            "day_pillar": dj,
            "hour_pillar": sj,
            "twelve_states": twelve_states,
            "jijanggan": jijanggan
        }
    except Exception as e:
        print(f"❌ /saju/full 에러: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/saju/pillars", response_model=PillarsResponse)
def saju_pillars(req: SajuRequest):
    try:
        gender = _parse_gender(req.gender)
        birth_dt, solar_dt_used = _to_datetime(req)

        yj = test.calculate_year_pillar(
            solar_dt_used.year, solar_dt_used.month, solar_dt_used.day, DB)
        mj = test.calculate_month_pillar(
            solar_dt_used.year, solar_dt_used.month, solar_dt_used.day, DB)
        dj = test.calculate_day_pillar(
            solar_dt_used.year, solar_dt_used.month, solar_dt_used.day)
        sj = test.calculate_hour_pillar(dj[0], solar_dt_used.hour)

        return {
            "input_datetime": f"{req.year:04d}-{req.month:02d}-{req.day:02d} {req.hour:02d}:{req.minute:02d}",
            "solar_datetime_used": solar_dt_used.strftime("%Y-%m-%d %H:%M"),
            "year_pillar": yj,
            "month_pillar": mj,
            "day_pillar": dj,
            "hour_pillar": sj,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/saju/interpret-test")
async def test_new_engine(req: InterpretRequest):
    """새 해석 엔진 (GPT + 이론 DB)"""
    try:
        from logic.saju_engine.core.analyzer import analyze_full_saju

        pillars = {
            'year': req.year_pillar,
            'month': req.month_pillar,
            'day': req.day_pillar,
            'hour': req.hour_pillar
        }

        analysis = analyze_full_saju(req.day_stem, pillars)

        try:
            from logic.gpt_generator import GPTInterpretationGenerator

            generator = GPTInterpretationGenerator(
                api_key=os.getenv("OPENAI_API_KEY"))
            interpretation = generator.generate_section1(
                analysis, tone=req.tone)

            return {
                "success": True,
                "analysis": {
                    "strength": analysis['summary']['strength'],
                    "score": analysis['summary']['strength_score'],
                    "patterns": analysis.get('patterns', [])
                },
                "interpretations": [interpretation]
            }

        except Exception as gpt_error:
            print(f"⚠️ GPT 실패, 기본 해석 사용: {gpt_error}")

            from logic.saju_engine.interpretation.generator import InterpretationGenerator
            fallback_gen = InterpretationGenerator()
            interpretations = fallback_gen.generate(analysis, tone=req.tone)

            return {
                "success": True,
                "analysis": {
                    "strength": analysis['summary']['strength'],
                    "score": analysis['summary']['strength_score'],
                    "patterns": analysis.get('patterns', [])
                },
                "interpretations": interpretations
            }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


@app.post("/saju/interpret-gpt")
async def interpret_with_gpt(req: GPTInterpretRequest):
    """✅ RAG 기반 GPT 오행 해석 (합화 포함)"""
    try:
        print(f"✅ GPT 해석 요청: day_stem={req.day_stem}, tone={req.tone}")

        # ✅ 1. 사주 분석 준비
        pillars_dict = {
            'year': req.year_pillar,
            'month': req.month_pillar,
            'day': req.day_pillar,
            'hour': req.hour_pillar
        }

        # ✅ 2. 해석 엔진으로 상세 분석
        from logic.saju_engine.core.analyzer import analyze_full_saju

        analysis = analyze_full_saju(req.day_stem, pillars_dict)

        # ✅ pillars 정보 보강 (합화 계산용)
        if 'pillars' not in analysis or not analysis['pillars']:
            print("⚠️  pillars 없음, 생성 중...")
            analysis['pillars'] = {}

            for pos, pillar_str in pillars_dict.items():
                stem, branch = split_pillar(pillar_str)
                analysis['pillars'][pos] = {
                    'heavenly_stem': stem,
                    'earthly_branch': branch
                }

            print(f"✅ pillars 생성 완료: {analysis['pillars']}")

        print(
            f"📊 신강약: {analysis['summary']['strength']} ({analysis['summary']['strength_score']}점)")

        # ✅ 3. 오행 카운트 (안전하게)
        if 'element_count' in analysis['summary']:
            element_counts = analysis['summary']['element_count']
            print(f"📊 오행 분포 (엔진): {element_counts}")
        else:
            element_counts = calculate_element_counts(pillars_dict)
            print(f"📊 오행 분포 (직접): {element_counts}")

        # 십성 분포
        if 'ten_gods_count' in analysis['summary']:
            print(f"📊 십성 분포: {analysis['summary']['ten_gods_count']}")

        # 패턴
        if 'patterns' in analysis:
            print(f"📊 패턴: {analysis.get('patterns', [])}")

        # ✅ 4. 이론 검색
        theories = ""
        try:
            from logic.theory_retriever import TheoryRetriever
            retriever = TheoryRetriever()
            theories = retriever.get_relevant_theories(analysis)
            print(f"📚 검색된 이론: {len(theories)}자")
        except Exception as e:
            print(f"⚠️ 이론 검색 실패: {e}")

        # ✅ 5. 합화 정보 계산 + GPT 해석 생성기 준비
        from logic.gpt_generator import GPTInterpretationGenerator
        generator = GPTInterpretationGenerator()

        # 🔥 Tuple 언패킹으로 수정
        transformed_counts, transformations = generator._apply_harmony_transformation(
            element_counts,
            analysis
        )

        print(f"🔥 합화 발견: {len(transformations)}건")
        for trans in transformations:
            print(f"   - {trans.get('name', '')}")

        # ✅ 6. GPT 해석 생성 (종합 해석 + 월지 기반 핵심 가치관)
        try:
            # 종합 해석
            content = generator.generate_comprehensive_interpretation(
                analysis=analysis,
                tone=req.tone,
                theories=theories
            )

            # 월지(월지=월주 지지) 추출
            month_pillar = pillars_dict.get('month', '')
            month_branch = month_pillar[1] if isinstance(
                month_pillar, str) and len(month_pillar) >= 2 else ''

            core_values = generator.generate_core_values(
                day_stem=req.day_stem,
                month_branch=month_branch,
                tone=req.tone
            )

            print(f"✅ GPT 해석 생성 완료: {len(content)}자")

            return {
                "success": True,
                "interpretations": [
                    {
                        "section": "elements",
                        "title": get_title_by_tone(req.tone),
                        "content": content,
                        "related_theories": ["신강약", "오행십신", "합충", "신살"]
                    },
                    {
                        "section": "core_values",
                        "title": "삶의 핵심 가치관과 지향점",
                        "content": core_values,
                        "related_theories": ["월지", "십신", "가치관"]
                    }
                ],
                "metadata": {
                    "model": "gpt-4o",
                    "day_stem": req.day_stem,
                    "tone": req.tone,
                    "strength": analysis['summary']['strength'],
                    "strength_score": analysis['summary']['strength_score'],
                    "element_counts": element_counts,
                    "ten_gods": analysis['summary']['ten_gods_count'],
                    "patterns": analysis.get('patterns', []),
                    # ✅ 합화 정보 추가
                    "harmony": {
                        "original": element_counts,
                        "transformed": transformed_counts,
                        "transformations": transformations
                    },
                    "core_values": {
                        "month_branch": month_branch
                    }
                }
            }

        except Exception as e:
            print(f"❌ GPT 생성 실패: {e}")
            import traceback
            traceback.print_exc()

            # 폴백
            fallback_content = f"""## 🌈 당신의 오행 에너지

**신강약:** {analysis['summary']['strength']} ({analysis['summary']['strength_score']}점)

**오행 분포:**
- 木(나무): {element_counts.get('wood', 0)}개
- 火(불): {element_counts.get('fire', 0)}개
- 土(흙): {element_counts.get('earth', 0)}개
- 金(쇠): {element_counts.get('metal', 0)}개
- 水(물): {element_counts.get('water', 0)}개

**십성 분포:**
{format_ten_gods(analysis['summary']['ten_gods_count'])}

**발견된 패턴:**
{', '.join(analysis.get('patterns', [])) if analysis.get('patterns') else '없음'}

현재 GPT 해석 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
"""

            return {
                "success": True,
                "interpretations": [{
                    "section": "elements",
                    "title": get_title_by_tone(req.tone),
                    "content": fallback_content,
                    "related_theories": []
                }],
                "metadata": {
                    "model": "fallback",
                    "day_stem": req.day_stem,
                    "tone": req.tone,
                    "strength": analysis['summary']['strength'],
                    "element_counts": element_counts,
                    "harmony": {
                        "original": element_counts,
                        "transformed": transformed_counts,
                        "transformations": transformations
                    }
                }
            }

    except Exception as e:
        print(f"❌ 전체 실패: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


PAYMENT_PRODUCT = {"orderName": "고민분석", "amount": 3900}

SEED_PRODUCTS = {
    "seed_1": {"orderName": "씨앗 1개", "amount": 770},
    "seed_5": {"orderName": "씨앗 5개+보너스 1개", "amount": 3850},
    "seed_10": {"orderName": "씨앗 10개+보너스 2개", "amount": 7700},
}


@app.post("/payment/create")
async def payment_create(req: Optional[PaymentCreateRequest] = None):
    """결제용 주문 번호 발급. product_key 없으면 고민분석, seed_1/seed_5/seed_10 이면 씨앗 상품."""
    import uuid
    order_id = f"order_{uuid.uuid4().hex[:16]}"
    product_key = req.product_key if req and req.product_key else None
    if product_key and product_key in SEED_PRODUCTS:
        product = SEED_PRODUCTS[product_key]
    else:
        product = PAYMENT_PRODUCT
    return {
        "orderId": order_id,
        "orderName": product["orderName"],
        "amount": product["amount"],
    }


@app.post("/payment/confirm")
async def payment_confirm(req: PaymentConfirmRequest):
    """결제 완료 후 프론트에서 호출. PortOne 결제 검증 후 DB 저장."""
    try:
        payment_id = req.payment_id.strip()
        order_id = req.order_id.strip()
        user_id = req.user_id.strip()
        if not payment_id or not order_id or not user_id:
            raise HTTPException(status_code=400, detail="user_id, payment_id, order_id 필수")

        # PortOne API로 결제 상태 검증 (선택: env 있으면 검증)
        portone_secret = os.getenv("PORTONE_API_SECRET") or os.getenv("PORTONE_SECRET_KEY")
        if portone_secret:
            try:
                import urllib.request
                req_ = urllib.request.Request(
                    f"https://api.portone.io/v2/payments/{payment_id}",
                    headers={"Authorization": f"PortOne {portone_secret}"},
                    method="GET",
                )
                with urllib.request.urlopen(req_, timeout=10) as res:
                    data = __import__("json").loads(res.read().decode())
                    if data.get("status") != "PAID" and data.get("status") != "paid":
                        raise HTTPException(status_code=400, detail="결제 상태가 완료가 아닙니다.")
            except HTTPException:
                raise
            except Exception as e:
                print(f"⚠️ PortOne 결제 검증 실패: {e}")
                raise HTTPException(status_code=502, detail="결제 검증 실패")

        from logic.payment_db import save_payment
        save_payment(user_id=user_id, payment_id=payment_id, order_id=order_id, status="paid")
        return {"success": True, "order_id": order_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ payment/confirm 오류: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/saju/list")
def get_saju_list(request: Request):
    """
    현재 로그인한 사용자의 사주 전체 목록을 반환합니다.
    저장된 사주는 계정별로 유지되며, 로그인/재접속 시 초기화되지 않습니다.
    """
    raw = request.cookies.get("hsaju_session")
    user_id = get_user_id_from_session(raw) if raw else None
    if user_id is None:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    rows = get_saju_list_for_user(user_id)
    # 그대로 리스트 반환 (FastAPI가 JSON 직렬화)
    return rows


@app.post("/api/saju/save")
async def save_saju(request: Request, body: SajuSaveRequest):
    """
    현재 로그인한 사용자의 사주 한 건을 저장합니다.
    hsaju_session 쿠키(숫자 user_id 또는 "kakao:provider_id" 형태)를 파싱해 사용합니다.
    """
    raw = request.cookies.get("hsaju_session")
    print(f"🧩 /api/saju/save hsaju_session(raw) = {raw!r}")
    user_id = get_user_id_from_session(raw) if raw else None
    print(f"🧩 /api/saju/save parsed user_id = {user_id!r}")
    if user_id is None:
        print("🧩 /api/saju/save: user_id 없음 → 401 반환")
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")

    try:
        name = body.name.strip()
        relation = (body.relation or "").strip() or None
        birthdate = body.birthdate.strip()
        birth_time = body.birth_time.strip() if body.birth_time else None
        calendar_type = body.calendar_type.strip()
        gender = body.gender.strip()

        if not name or not birthdate or not calendar_type or not gender:
            raise HTTPException(status_code=400, detail="필수 값 누락")

        print(
            f"🧩 /api/saju/save payload: "
            f"user_id={user_id}, name={name!r}, relation={relation!r}, "
            f"birthdate={birthdate!r}, birth_time={birth_time!r}, "
            f"calendar_type={calendar_type!r}, gender={gender!r}"
        )

        saju_id = save_saju_for_user(
            user_id=user_id,
            name=name,
            relation=relation,
            birthdate=birthdate,
            birth_time=birth_time,
            calendar_type=calendar_type,
            gender=gender,
        )
        print(f"✅ /api/saju/save INSERT 성공: saju_id={saju_id}")
        return {"success": True, "saju_id": saju_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ /api/saju/save 오류: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="사주 저장 실패")


@app.get("/api/saju/{saju_id}")
def get_saju(saju_id: int, request: Request):
    """
    저장된 사주 한 건 조회.
    hsaju_session 쿠키의 user_id와 일치할 때만 반환합니다.
    """
    raw = request.cookies.get("hsaju_session")
    user_id = get_user_id_from_session(raw) if raw else None
    if user_id is None:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    row = get_saju_by_id(saju_id, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="해당 사주를 찾을 수 없습니다.")
    return {
        "id": row["id"],
        "name": row["name"],
        "relation": row["relation"],
        "birthdate": row["birthdate"],
        "birth_time": row["birth_time"],
        "calendar_type": row["calendar_type"],
        "gender": row["gender"],
    }


@app.post("/saju/summary-gpt")
async def summary_gpt(req: SummaryGPTRequest):
    """종합 요약 및 인생 가이드용 GPT 호출 (system + user 프롬프트 → 5단 요약 텍스트)"""
    try:
        if not client:
            print("⚠️ OPENAI_API_KEY 없음 — summary-gpt 스킵")
            return {"summary": None, "error": "OPENAI_API_KEY not configured"}
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": req.system},
                {"role": "user", "content": req.user},
            ],
            max_tokens=1500,
            temperature=0.6,
        )
        content = (resp.choices[0].message.content or "").strip()
        return {"summary": content}
    except Exception as e:
        print(f"❌ summary-gpt 오류: {e}")
        import traceback
        traceback.print_exc()
        return {"summary": None, "error": str(e)}


# ==================== 고민 분석 (GPT-4o) ====================

_CONCERN_SYSTEM = """당신은 한국 전통 사주를 현대적으로 해석하는 상담 전문가입니다.
사주 정보와 사용자의 고민을 바탕으로, 사주 용어(일간·십성·오행·충·형 등)를 쓰지 않고 일상 언어로만 답변하세요.
답변은 반드시 아래 JSON 형식만 출력하세요. 다른 설명이나 마크다운 코드블록 없이 JSON만 출력합니다.

{
  "root_cause": "고민의 근본 원인 (사주 기반, 2~3문장)",
  "reason_now": "지금 이 시기에 이 고민이 생긴 이유 (2~3문장)",
  "directions": ["방향 제시 1", "방향 제시 2", "방향 제시 3"],
  "resolution_hint": "이 고민이 풀리는 시기 힌트 (2~4문장)"
}

총 분량은 2500자 내외로 작성하세요. 희망적이고 구체적으로 작성하세요."""


def _build_concern_user_prompt(req: "ConcernAnalysisRequest", analysis: dict) -> str:
    """고민 분석용 user 프롬프트 조립"""
    try:
        pillars = {
            "year": req.year_pillar,
            "month": req.month_pillar,
            "day": req.day_pillar,
            "hour": req.hour_pillar,
        }
        summary = analysis.get("summary") or {}
        element_counts = summary.get("element_count") or calculate_element_counts(pillars)
        strength = summary.get("strength") if isinstance(summary.get("strength"), str) else ""
        strength_score = summary.get("strength_score") if isinstance(summary.get("strength_score"), (int, float)) else 0
        ten_gods = summary.get("ten_gods_count") or {}
        patterns = analysis.get("patterns") or []
        harmony = analysis.get("harmony_clash") or {}

        ten_gods_str = "없음"
        if ten_gods and isinstance(ten_gods, dict):
            parts = [f"{k}{v}개" for k, v in ten_gods.items() if v and (isinstance(v, (int, float)) and v > 0)]
            ten_gods_str = ", ".join(parts) if parts else "없음"
        patterns_str = ", ".join(str(p) for p in patterns) if patterns else "없음"

        return f"""## 사주 정보
- 일간: {req.day_stem}
- 사주: 년주 {req.year_pillar}, 월주 {req.month_pillar}, 일주 {req.day_pillar}, 시주 {req.hour_pillar}
- 신강약: {strength} (점수: {strength_score})
- 오행 분포: 목 {element_counts.get('wood', 0)}, 화 {element_counts.get('fire', 0)}, 토 {element_counts.get('earth', 0)}, 금 {element_counts.get('metal', 0)}, 수 {element_counts.get('water', 0)}
- 십성 분포: {ten_gods_str}
- 패턴/특징: {patterns_str}
- 합충: {harmony}

## 사용자 고민
{req.concern}

위 사주와 고민을 바탕으로 JSON 한 개만 출력하세요."""
    except Exception as e:
        print(f"⚠️ _build_concern_user_prompt 오류: {e}")
        return f"## 사주: {req.year_pillar} {req.month_pillar} {req.day_pillar} {req.hour_pillar}, 일간 {req.day_stem}\n## 고민: {req.concern}\n\n위를 바탕으로 JSON 한 개만 출력하세요."


def _parse_concern_json(raw: str) -> Optional[dict]:
    """GPT 응답에서 JSON 추출 후 파싱"""
    import re
    import json
    text = (raw or "").strip()
    # ```json ... ``` 제거
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if m:
        text = m.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


@app.post("/saju/concern-analysis-ping")
async def concern_analysis_ping(req: ConcernAnalysisRequest):
    """고민 분석 경로 테스트용 — GPT 호출 없이 사주 분석만 수행 후 즉시 응답"""
    try:
        pillars = {
            "year": req.year_pillar,
            "month": req.month_pillar,
            "day": req.day_pillar,
            "hour": req.hour_pillar,
        }
        from logic.saju_engine.core.analyzer import analyze_full_saju
        analysis = analyze_full_saju(req.day_stem, pillars)
        user_prompt = _build_concern_user_prompt(req, analysis)
        return {"ok": True, "prompt_length": len(user_prompt), "strength": (analysis.get("summary") or {}).get("strength")}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def _call_gpt_concern(system: str, user_prompt: str) -> str:
    """동기 GPT 호출 — 이벤트 루프 블로킹 방지를 위해 스레드에서 실행됨"""
    from openai import OpenAI
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not configured")
    concern_client = OpenAI(api_key=api_key, timeout=90.0)
    resp = concern_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=2000,
        temperature=0.5,
    )
    return (resp.choices[0].message.content or "").strip()


@app.post("/saju/concern-analysis")
async def concern_analysis(req: ConcernAnalysisRequest):
    """고민 분석: 사주 + 고민 텍스트 → GPT-4o로 4가지 포맷 결과 반환 (총 2500자 내외)"""
    if not client:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")

    concern_text = (req.concern or "").strip()
    if not concern_text:
        raise HTTPException(status_code=400, detail="고민 텍스트를 입력해주세요.")

    pillars = {
        "year": req.year_pillar,
        "month": req.month_pillar,
        "day": req.day_pillar,
        "hour": req.hour_pillar,
    }

    try:
        from logic.saju_engine.core.analyzer import analyze_full_saju
        analysis = analyze_full_saju(req.day_stem, pillars)
    except Exception as e:
        print(f"❌ concern-analysis analyze_full_saju 오류: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"사주 분석 실패: {e!s}")

    user_prompt = _build_concern_user_prompt(req, analysis)

    try:
        # 장시간 블로킹 방지: GPT 호출을 스레드 풀에서 실행
        loop = asyncio.get_event_loop()
        raw = await loop.run_in_executor(None, lambda: _call_gpt_concern(_CONCERN_SYSTEM, user_prompt))
    except Exception as e:
        print(f"❌ concern-analysis GPT 호출 오류: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=502, detail=f"GPT 호출 실패: {e!s}")

    parsed = _parse_concern_json(raw)
    if not parsed:
        return {
            "success": False,
            "error": "GPT 응답 파싱 실패",
            "raw": raw[:500] if raw else "",
        }

    root_cause = parsed.get("root_cause") or ""
    reason_now = parsed.get("reason_now") or ""
    directions = parsed.get("directions")
    if not isinstance(directions, list):
        directions = [directions] if isinstance(directions, str) else []
    directions = [str(d) for d in directions[:3]]
    resolution_hint = parsed.get("resolution_hint") or ""

    return {
        "success": True,
        "root_cause": root_cause,
        "reason_now": reason_now,
        "directions": directions,
        "resolution_hint": resolution_hint,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
