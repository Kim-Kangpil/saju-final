# ==================== 1. 환경변수 로드 (가장 먼저!) ====================
import openai
import hashlib
from logic.twelve_states import calculate_twelve_states, get_twelve_state
from logic import test
from logic import lunar_converter
from logic.jijanggan import calculate_jijanggan_for_pillars
from logic.saju_core import compute_full_saju
from logic.saju_engine.core.sinsal import analyze_sinsal
from logic.feature_flags import use_new_saju_engine, get_engine_version_label
from logic.theory_retriever import TheoryRetriever
from auth_kakao import router as kakao_router
from auth_google2 import router as google_router
import os
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from typing import Optional, Any
import json
from datetime import datetime, date, timezone, timedelta
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
print(f"🌐 CORS 허용 origin: {_cors_origins}")

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
from logic.user_db import get_user_id_from_session, get_user_by_id, get_seed_balance, deduct_seed
from logic.session_token import verify_session_token


def get_user_id_from_request(request: Request) -> Optional[int]:
    """쿠키 또는 Authorization Bearer 토큰으로 user_id 반환. 모바일 크로스 도메인 시 토큰 사용."""
    raw = request.cookies.get("hsaju_session")
    user_id = get_user_id_from_session(raw) if raw else None
    if user_id is not None:
        return user_id
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth[7:].strip()
        return verify_session_token(token)
    return None

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

# 게스트 채팅 카운터 DB 초기화
try:
    from logic.guest_chat_db import init_guest_chat_db
    init_guest_chat_db()
    print("✅ 게스트 채팅 카운터 DB 초기화 완료")
except Exception as e:
    print(f"⚠️ 게스트 채팅 카운터 DB 초기화: {e}")

# 채팅 로그 DB 초기화
try:
    from logic.chat_logs_db import init_chat_logs_db
    init_chat_logs_db()
    print("✅ 채팅 로그 DB 초기화 완료")
except Exception as e:
    print(f"⚠️ 채팅 로그 DB 초기화: {e}")

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


def _get_client_ip(request: Request) -> str:
    """프록시/로드밸런서 환경에서도 비교적 안전하게 IP를 뽑아오는 헬퍼."""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        # 예: "client, proxy1, proxy2"
        return xff.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return ""


def _compute_guest_key(request: Request) -> str:
    client_ip = _get_client_ip(request)
    user_agent = request.headers.get("user-agent", "")
    raw_key = f"{client_ip}|{user_agent}"
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def _is_chat_admin(request: Request) -> bool:
    admin_user_id = (os.getenv("CHAT_LOGS_ADMIN_USER_ID") or "").strip()
    if admin_user_id:
        try:
            uid = int(admin_user_id)
            req_user_id = get_user_id_from_request(request)
            if req_user_id is not None and req_user_id == uid:
                return True
        except ValueError:
            pass

    secret = (os.getenv("CHAT_LOGS_ADMIN_SECRET") or "").strip()
    if not secret:
        return False
    provided = (request.headers.get("x-chat-admin-secret") or request.headers.get("X-CHAT-ADMIN-SECRET") or "").strip()
    return bool(provided) and provided == secret


@app.post("/api/guest-chat/consume")
async def guest_chat_consume(request: Request):
    """
    게스트 채팅 사용 3회 제한(로그인 유도).
    - 로그인(쿠키/토큰으로 user_id 확인)이면 무제한 허용
    - 게스트면 guest_key 기준으로 카운트 후, 4번째부터 401 반환
    """
    user_id = get_user_id_from_request(request)
    if user_id is not None:
        return {"allowed": True, "loggedIn": True}

    # 서버에서 강제하는 기본값 (프론트에서도 동일하게 3으로 두는 것을 권장)
    limit = 3

    client_ip = _get_client_ip(request)
    user_agent = request.headers.get("user-agent", "")
    raw_key = f"{client_ip}|{user_agent}"
    guest_key = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    try:
        from logic.guest_chat_db import consume_guest_chat

        allowed, _count = consume_guest_chat(guest_key, limit)
        if not allowed:
            raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
        return {"allowed": True, "loggedIn": False}
    except HTTPException:
        raise
    except Exception as e:
        # 카운터 DB가 깨져 있으면 비용 폭탄을 막기 위해 기본 deny
        print(f"❌ /api/guest-chat/consume 오류: {e}")
        raise HTTPException(status_code=503, detail="게스트 사용량 체크 실패")


# ==================== 채팅 로그 저장/조회 ====================


@app.post("/api/chat-logs/save")
async def chat_logs_save(req: Request, body: Any):
    """
    채팅 저장용 엔드포인트

    - 로그인 사용자: cookie 기반 user_id로 저장
    - 게스트: client_ip + user-agent 기반 guest_key로 저장
    """
    from logic.chat_logs_db import save_chat_session

    body_obj = body if isinstance(body, dict) else {}

    session_id = (body_obj.get("sessionId") or "").strip()
    if not session_id:
        raise HTTPException(status_code=400, detail="sessionId가 필요합니다.")

    raw_messages = body_obj.get("messages") or []
    normalized_messages: list[dict[str, Any]] = []
    for m in raw_messages:
        if not isinstance(m, dict):
            continue
        role = m.get("role")
        content = m.get("content")
        idx = m.get("idx")
        if role not in ("user", "assistant"):
            continue
        if not isinstance(content, str) or not content.strip():
            continue
        try:
            idx_int = int(idx)
        except Exception:
            continue
        normalized_messages.append({"idx": idx_int, "role": role, "content": content})

    if not normalized_messages:
        return {"success": True}

    user_id = get_user_id_from_request(req)
    guest_key = None
    if user_id is None:
        guest_key = _compute_guest_key(req)

    # 저장은 실패해도 채팅 UX가 깨지지 않도록 200을 유지(프론트는 best-effort로 처리)
    try:
        save_chat_session(
            session_id=session_id,
            user_id=user_id,
            guest_key=guest_key,
            title=body_obj.get("title"),
            messages=normalized_messages,
        )
        return {"success": True}
    except Exception as e:
        print(f"⚠️ /api/chat-logs/save 저장 실패: {e}")
        return {"success": False, "error": "save_failed"}


@app.get("/api/chat-logs/sessions")
async def chat_logs_list_sessions(request: Request, limit: int = 20, offset: int = 0):
    """현재 요청자의 채팅 세션 목록 조회"""
    from logic.chat_logs_db import get_sessions_for_owner

    user_id = get_user_id_from_request(request)
    guest_key = None
    if user_id is None:
        guest_key = _compute_guest_key(request)

    sessions = get_sessions_for_owner(
        user_id=user_id,
        guest_key=guest_key,
        limit=limit,
        offset=offset,
    )
    return {"success": True, "sessions": sessions}


@app.get("/api/chat-logs/session/{session_id}")
async def chat_logs_get_session(session_id: str, request: Request):
    """현재 요청자의 특정 세션 메시지 조회"""
    from logic.chat_logs_db import get_messages_for_session

    target = (session_id or "").strip()
    if not target:
        raise HTTPException(status_code=400, detail="session_id가 필요합니다.")

    user_id = get_user_id_from_request(request)
    guest_key = None
    if user_id is None:
        guest_key = _compute_guest_key(request)

    messages = get_messages_for_session(
        session_id=target,
        user_id=user_id,
        guest_key=guest_key,
    )
    if messages is None:
        raise HTTPException(status_code=404, detail="해당 세션을 찾을 수 없어요.")

    return {"success": True, "sessionId": target, "messages": messages}


@app.get("/api/admin/chat-logs/users/{target_user_id}/sessions")
async def admin_chat_logs_list_sessions(
    target_user_id: int,
    request: Request,
    limit: int = 20,
    offset: int = 0,
):
    """관리자용: 특정 유저의 세션 목록 조회 (X-CHAT-ADMIN-SECRET 필요)"""
    from logic.chat_logs_db import get_sessions_for_admin_user

    if not _is_chat_admin(request):
        raise HTTPException(status_code=403, detail="admin secret missing")

    sessions = get_sessions_for_admin_user(
        target_user_id=target_user_id,
        limit=limit,
        offset=offset,
    )
    return {"success": True, "sessions": sessions}


@app.get("/api/admin/chat-logs/users/{target_user_id}/session/{session_id}")
async def admin_chat_logs_get_session(
    target_user_id: int,
    session_id: str,
    request: Request,
):
    """관리자용: 특정 유저의 특정 세션 메시지 조회 (X-CHAT-ADMIN-SECRET 필요)"""
    from logic.chat_logs_db import get_messages_for_admin

    if not _is_chat_admin(request):
        raise HTTPException(status_code=403, detail="admin secret missing")

    target = (session_id or "").strip()
    if not target:
        raise HTTPException(status_code=400, detail="session_id가 필요합니다.")

    messages = get_messages_for_admin(session_id=target, target_user_id=target_user_id)
    if messages is None:
        raise HTTPException(status_code=404, detail="해당 세션을 찾을 수 없어요.")

    return {"success": True, "sessionId": target, "messages": messages}


@app.get("/api/admin/chat-logs/me")
async def admin_chat_logs_me(request: Request):
    """관리자 권한이 있는 요청자 자신의 user_id를 반환합니다."""
    if not _is_chat_admin(request):
        raise HTTPException(status_code=403, detail="admin secret missing")

    user_id = get_user_id_from_request(request)
    if user_id is None:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")

    return {"success": True, "userId": user_id}


@app.get("/api/admin/users")
async def admin_list_users(request: Request, limit: int = 50, offset: int = 0):
    """관리자용 유저 목록 조회 (개인정보 포함 가능)."""
    if not _is_chat_admin(request):
        raise HTTPException(status_code=403, detail="admin secret missing")

    from logic.user_db import list_users

    users = list_users(limit=limit, offset=offset)
    return {"success": True, "users": users}


@app.get("/api/saju/count")
def get_saju_count(request: Request):
    """
    현재 계정의 저장된 사주 개수를 반환합니다.
    쿠키 또는 Authorization Bearer 토큰으로 user_id를 확인합니다.
    """
    user_id = get_user_id_from_request(request)
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
    쿠키 또는 Authorization Bearer 토큰으로 user_id를 확인합니다.
    """
    user_id = get_user_id_from_request(request)
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
    쿠키 또는 Authorization Bearer 토큰으로 user_id를 확인합니다.
    """
    user_id = get_user_id_from_request(request)
    if user_id is None:
        return {"seeds": 0}
    try:
        seeds = get_seed_balance(user_id)
        return {"seeds": seeds}
    except Exception as e:
        print(f"⚠️ /api/seeds 조회 실패: {e}")
        return {"seeds": 0}


@app.post("/api/analysis/deduct")
def deduct_analysis_seed(request: Request):
    """
    사주 분석 1회 차감. 씨앗 1개를 차감하고 성공 시 남은 잔액을 반환합니다.
    """
    user_id = get_user_id_from_request(request)
    if user_id is None:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    try:
        success, remaining = deduct_seed(user_id, 1)
        if not success:
            return {
                "success": False,
                "detail": "씨앗이 부족합니다.",
                "remaining": remaining,
            }
        return {"success": True, "remaining": remaining}
    except Exception as e:
        print(f"⚠️ /api/analysis/deduct 실패: {e}")
        raise HTTPException(status_code=500, detail="차감 처리 중 오류가 발생했습니다.")


class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    saju: Optional[dict[str, Any]] = None  # 저장된 사주 컨텍스트 (천간지지, 십성 등)


class ChatLogMessage(BaseModel):
    idx: int
    role: str  # user | assistant
    content: str


class ChatLogSaveRequest(BaseModel):
    sessionId: str
    title: Optional[str] = None
    messages: list[ChatLogMessage]


# TheoryRetriever 싱글톤 (이론 txt 한 번만 로드)
_theory_retriever: Optional[TheoryRetriever] = None


def get_theory_retriever() -> TheoryRetriever:
    global _theory_retriever
    if _theory_retriever is None:
        _theory_retriever = TheoryRetriever()
    return _theory_retriever


def _attach_sinsal_to_saju_full_payload(data: dict[str, Any]) -> None:
    """
    /saju/full 응답(dict)에 analyze_sinsal 결과를 sinsal 키로 붙인다.
    시주가 없으면(time_unknown 등 hour_pillar 없음) 만세력에 사용한 solar_datetime_used 시각으로
    시주를 한 번 더 계산해 신살 판정에만 사용한다(본 응답의 hour_pillar는 그대로 None).
    """
    empty: dict[str, list] = {
        "cheonul_gwiin": [],
        "dohwa": [],
        "yeokma": [],
        "hwagae": [],
        "wolgong": [],
        "munchang_gwiin": [],
    }
    try:
        yp = (data.get("year_pillar") or "").strip()
        mp = (data.get("month_pillar") or "").strip()
        dp = (data.get("day_pillar") or "").strip()
        hp = data.get("hour_pillar")
        if len(yp) < 2 or len(mp) < 2 or len(dp) < 2:
            data["sinsal"] = empty
            return
        day_stem = dp[0]

        if isinstance(hp, str) and len(hp.strip()) >= 2:
            hour_str = hp.strip()[:2]
        else:
            solar_str = (data.get("solar_datetime_used") or "").strip()
            solar_dt = datetime.strptime(solar_str, "%Y-%m-%d %H:%M")
            hour_str = test.calculate_hour_pillar(
                solar_dt, dp[:2], apply_korea_dst=True
            )

        if len(hour_str) < 2:
            data["sinsal"] = empty
            return

        pillars = {
            "year": yp[:2],
            "month": mp[:2],
            "day": dp[:2],
            "hour": hour_str[:2],
        }
        data["sinsal"] = analyze_sinsal(day_stem, pillars)
    except Exception:
        data["sinsal"] = empty


def _safe_hanja(obj: Any, prefix: str) -> str:
    """result 내 hour/day/month/year 객체에서 한자 문자열 추출 (천간+지지)"""
    if not obj or not isinstance(obj, dict):
        return ""
    cheongan = obj.get("cheongan") if isinstance(obj.get("cheongan"), dict) else {}
    jiji = obj.get("jiji") if isinstance(obj.get("jiji"), dict) else {}
    c = (cheongan.get("hanja") or "").strip()
    j = (jiji.get("hanja") or "").strip()
    return (c + j) if (c or j) else ""


def _build_saju_context(saju: Optional[dict]) -> str:
    """사주(만세력) 데이터를 GPT 컨텍스트 문자열로 변환. AI가 이 데이터만 사용해 답하도록 명시."""
    if not saju or not isinstance(saju, dict):
        return ""
    parts = ["[이 사용자의 만세력 / 사주 컨텍스트] (만세력·사주 관련 질문에는 반드시 아래 데이터만 사용할 것)"]

    name = (saju.get("name") or "").strip()
    if name:
        parts.append(f"이름(표시용): {name}")

    birth_ymd = (saju.get("birthYmd") or "").strip()
    if len(birth_ymd) >= 8:
        y, m, d = birth_ymd[:4], birth_ymd[4:6], birth_ymd[6:8]
        parts.append(f"생년월일: {y}년 {m}월 {d}일")
    birth_hm = saju.get("birthHm")
    time_unknown = saju.get("timeUnknown")
    if not time_unknown and birth_hm and len(str(birth_hm)) >= 4:
        h, mi = str(birth_hm).zfill(4)[:2], str(birth_hm).zfill(4)[2:4]
        parts.append(f"생시: {h}시 {mi}분")
    elif time_unknown:
        parts.append("생시: 모름(자시 기준 등 적용)")
    cal = saju.get("calendar") or ""
    if cal in ("solar", "lunar"):
        parts.append(f"기준: {'양력' if cal == 'solar' else '음력'}")
    gender = saju.get("gender")
    if gender in ("M", "F"):
        parts.append("성별: 남" if gender == "M" else "성별: 여")

    result = saju.get("result") if isinstance(saju.get("result"), dict) else {}
    season = result.get("season") if isinstance(result.get("season"), dict) else {}
    if result:
        year = result.get("year") or {}
        month = result.get("month") or {}
        day = result.get("day") or {}
        hour = result.get("hour") or {}
        y_str = _safe_hanja(year, "년")
        m_str = _safe_hanja(month, "월")
        d_str = _safe_hanja(day, "일")
        h_str = _safe_hanja(hour, "시")
        if y_str or m_str or d_str or h_str:
            parts.append(
                f"사주팔자(한자): 년주 {y_str or '-'}  월주 {m_str or '-'}  일주 {d_str or '-'}  시주 {h_str or '-'}"
            )
        summary = result.get("summary") if isinstance(result.get("summary"), dict) else {}
        if summary:
            strength = summary.get("strength") or summary.get("strength_text")
            if strength:
                parts.append(f"신강약: {strength}")
            ten_gods = summary.get("ten_gods_count") or summary.get("ten_gods")
            if ten_gods and isinstance(ten_gods, dict):
                parts.append("십성: " + ", ".join(f"{k}{v}" for k, v in ten_gods.items() if v))
        patterns = result.get("patterns") or []
        if patterns:
            parts.append("패턴/특징: " + ", ".join(str(p) for p in patterns[:15]))

    # 월지 기준 계절 요약(있을 때만)
    if season:
        name = season.get("name")
        detail = season.get("detail")
        if name and detail:
            parts.append(f"월지 기준 계절: {name} — {detail}")

    if len(parts) <= 1:
        return ""
    return "\n".join(parts)


@app.post("/api/chat")
async def api_chat(req: ChatRequest, request: Request):
    """
    사주 AI 채팅. TheoryRetriever로 질문 관련 이론 검색, 사주 context 포함, GPT-4o 스트리밍 응답.
    """
    if not client:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")
    if not req.messages or not any(m.role == "user" and (m.content or "").strip() for m in req.messages):
        raise HTTPException(status_code=400, detail="사용자 메시지가 필요합니다.")

    last_user_message = ""
    for m in reversed(req.messages):
        if m.role == "user" and (m.content or "").strip():
            last_user_message = (m.content or "").strip()
            break

    theory_text = ""
    try:
        retriever = get_theory_retriever()
        theory_text = retriever.get_theories_by_query(last_user_message) or ""
    except Exception as e:
        print(f"⚠️ TheoryRetriever 오류: {e}")

    saju_context = _build_saju_context(req.saju)
    ten_gods_rule = (
        "\n[십성(十神)·육친 정의 — 절대 준수] "
        "십성은 일간 기준 오행 관계. 성별에 따라 육친이 다름. "
        "정관: 남자=직업·명예·자식에 대한 책임감(아내 아님). 여자=남편·직장·책임감. "
        "정관을 '남편이자 아내'라고 하지 말 것. 남자 아내=재성, 여자 남편=관성(정관·편관). "
        "편관: 남자=자식에 대한 부담·강한 책임, 여자=남편 또는 강한 이성. "
        "재성=재물·아버지, 남자에게 아내. 인성=어머니·학문. 식상=표현·재능, 여자에게 자식. 비겁=형제·동료.\n"
    )
    month_branch_rule = (
        "\n[월지(寅·卯·辰·巳·午·未·申·酉) 표현 규칙 — 반드시 지킬 것]\n"
        "- 사용자가 'OO월'이라고 말하더라도, 사주에서의 월은 '월지(지지)'를 기준으로 해석한다.\n"
        "- 월지를 설명할 때 절대로 '4월', '5월', '6월', '9월'처럼 숫자 달이나 음력/양력 몇 월이라고 단정하지 마라.\n"
        "- 예: 酉월은 '가을 한가운데 닭의 달, 서늘하고 정리되는 느낌'처럼 계절과 이미지로만 설명하고, '6월의 여름 기운'이라고 말하지 마라.\n"
        "- 사용자가 먼저 '양력 6월인가요?' 같이 물어봐도, '사주에서 말하는 酉월은 6월과 정확히 1:1 대응하는 개념이 아니다'라고 설명하고, 계절·분위기 위주로만 답하라.\n"
    )
    system_parts = [
        "당신은 한양사주의 AI 상담사입니다. 사주, 운세, 고민 상담 등에 대해 친절하고 쉽게 답변합니다.",
        "전문 용어(일간, 십성, 오행 등)는 가능한 한 쓰지 않고, 일상적인 말로 풀어서 설명해 주세요.",
        ten_gods_rule,
        month_branch_rule,
        "【중요】 사용자의 만세력/사주를 물을 때:",
        "- 아래 [이 사용자의 만세력 / 사주 컨텍스트]가 있으면, **그 안의 데이터만** 사용해서 답하세요. 생년월일·사주팔자·생시 등은 컨텍스트에 적힌 그대로만 말하세요. 지어내지 마세요.",
        "- 컨텍스트가 없거나 비어 있으면, '저장된 사주가 없어요. 먼저 사주를 등록해 주시면 정확히 말씀드릴 수 있어요.'라고 안내하세요.",
    ]
    if theory_text:
        system_parts.append("\n\n[참고 이론]\n" + theory_text[:10000])
    if saju_context:
        system_parts.append("\n\n" + saju_context)
    system_content = "\n".join(system_parts)

    openai_messages = [{"role": "system", "content": system_content}]
    for m in req.messages:
        role = "user" if m.role == "user" else "assistant"
        if (m.content or "").strip():
            openai_messages.append({"role": role, "content": (m.content or "").strip()})

    async def stream_generator():
        try:
            stream = client.chat.completions.create(
                model="gpt-4o",
                messages=openai_messages,
                max_tokens=2000,
                temperature=0.6,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta and getattr(delta, "content", None):
                    yield f"data: {json.dumps({'content': delta.content}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            print(f"❌ /api/chat 스트리밍 오류: {e}")
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


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
    hour: int | None = Field(
        default=None, ge=0, le=23, description="0-23. None이면 출생시간 정보 없음으로 간주"
    )
    minute: int | None = Field(
        default=None, ge=0, le=59, description="0-59. None이면 0분으로 처리"
    )
    gender: str = Field(description="M 또는 F")
    is_leap_month: bool = Field(
        default=False, description="calendar_type이 lunar일 때만 의미 있음"
    )
    time_unknown: bool = Field(
        default=False,
        description="출생시간을 모르는 경우 True. 이 경우 시주는 보조 정보로만 사용",
    )
    iana_timezone: Optional[str] = Field(
        default=None,
        description="IANA(예: Asia/Seoul, America/New_York). 해외 출생 시 서머타임 해제",
    )


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
    iana_timezone: Optional[str] = None  # 출생지 IANA (서머타임·미리보기 연동)


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


@app.get("/saju/day-pillar")
def get_day_pillar(date_str: Optional[str] = None):
    """특정 날짜의 일진(일주) 반환. date=YYYY-MM-DD (없으면 대한민국(KST) 기준 오늘)."""
    try:
        # 1) 기준 날짜: 대한민국 시간(KST) 기준
        if not date_str:
            kst = timezone(timedelta(hours=9))
            today = datetime.now(kst).date()
        else:
            parts = date_str.strip().split("-")
            if len(parts) != 3:
                raise ValueError("date는 YYYY-MM-DD 형식이어야 합니다")
            today = date(int(parts[0]), int(parts[1]), int(parts[2]))

        # 2) 해당 날짜(KST 기준)의 일진 계산 (별도 +1일 보정 없이 그대로 사용)
        dt = datetime(today.year, today.month, today.day, 12, 0)
        dj = test.calculate_day_pillar(dt)
        hanja_map = {
            "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무",
            "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계",
            "子": "자", "丑": "축", "寅": "인", "卯": "묘", "辰": "진",
            "巳": "사", "午": "오", "未": "미", "申": "신", "酉": "유",
            "戌": "술", "亥": "해"
        }
        hangul = "".join([hanja_map.get(c, c) for c in dj])
        return {
            "date": f"{today.year}-{today.month:02d}-{today.day:02d}",
            "day_pillar": dj,
            "day_pillar_hangul": hangul,
        }
    except Exception as e:
        print(f"❌ /saju/day-pillar 에러: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/saju/full")
async def get_full_saju(req: SajuRequest):
    """✅ 전체 사주 분석 (프론트엔드에서 사용)"""
    try:
        # feature flag를 통해 신규 엔진 사용 여부를 제어한다.
        # 현재는 compute_full_saju 한 경로만 존재하지만, 향후 구엔진과 신엔진을 병행할 수 있도록 설계.
        if not use_new_saju_engine():
            payload: dict[str, Any] = {
                "calendar_type": req.calendar_type,
                "year": req.year,
                "month": req.month,
                "day": req.day,
                "hour": req.hour if req.hour is not None else 12,
                "minute": req.minute if req.minute is not None else 0,
                "gender": req.gender,
                "is_leap_month": req.is_leap_month,
                "time_unknown": req.time_unknown,
                "iana_timezone": req.iana_timezone,
            }
        else:
            payload = {
                "calendar_type": req.calendar_type,
                "year": req.year,
                "month": req.month,
                "day": req.day,
                "hour": req.hour,
                "minute": req.minute,
                "gender": req.gender,
                "is_leap_month": req.is_leap_month,
                "time_unknown": req.time_unknown,
                "iana_timezone": req.iana_timezone,
            }

        data = compute_full_saju(payload, DB)
        data["engine_version"] = get_engine_version_label()
        _attach_sinsal_to_saju_full_payload(data)
        return data
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
    쿠키 또는 Authorization Bearer 토큰으로 user_id를 확인합니다.
    """
    user_id = get_user_id_from_request(request)
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
    user_id = get_user_id_from_request(request)
    print(f"🧩 /api/saju/save user_id = {user_id!r}")
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

        iana_tz = (body.iana_timezone or "").strip() or None

        saju_id = save_saju_for_user(
            user_id=user_id,
            name=name,
            relation=relation,
            birthdate=birthdate,
            birth_time=birth_time,
            calendar_type=calendar_type,
            gender=gender,
            iana_timezone=iana_tz,
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
    쿠키 또는 Authorization Bearer 토큰으로 user_id를 확인합니다.
    """
    user_id = get_user_id_from_request(request)
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
        "iana_timezone": row.get("iana_timezone"),
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
  "resolution_hint": "이 고민이 풀리는 시기 힌트 (2~4문장)",
  "suggested_questions": [
    "추천 질문 1",
    "추천 질문 2"
  ]
}

추천질문 생성 규칙:
- 추천질문은 반드시 현재 답변 주제와 직접 연결되어야 한다.
- 원인/시기/해결 중 하나를 더 깊게 묻는 형태여야 한다.
- 바로 다음 턴에서 즉시 답변 가능한 구체적 질문이어야 한다.
- 다른 주제로 갑자기 확장하지 마라.
- 추천질문은 정확히 2개만 생성한다.
- 첫 번째는 심화 질문 (원인 또는 시기).
- 두 번째는 실전 질문 (해결 또는 행동 방향).
- 질문 끝은 반드시 "~볼까요?" 또는 "~해볼까요?"로 끝낸다.
- 의미 없는 포괄적 질문, 반복 질문, 다른 분야 점프 금지.

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


def _normalize_suggested_questions(value: Any) -> list[str]:
    """추천 질문을 정확히 2개로 보정."""
    items: list[str] = []
    if isinstance(value, list):
        items = [str(v).strip() for v in value if str(v).strip()]
    elif isinstance(value, str) and value.strip():
        items = [value.strip()]

    if len(items) < 2:
        fallback = [
            "이 고민이 반복되는 구조적 이유를 더 볼까요?",
            "이 상황을 풀기 위해 이번 주에 바로 해볼 행동을 정해볼까요?",
        ]
        items.extend(fallback[len(items):])

    items = items[:2]

    def _with_valid_ending(q: str) -> str:
        if q.endswith("볼까요?") or q.endswith("해볼까요?"):
            return q
        base = q.rstrip("?").strip()
        return f"{base} 볼까요?" if base else "더 깊게 살펴볼까요?"

    return [_with_valid_ending(items[0]), _with_valid_ending(items[1])]


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
    """고민 분석: 사주 + 고민 텍스트 → GPT-4o로 5가지 포맷 결과 반환 (총 2500자 내외)"""
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
    suggested_questions = _normalize_suggested_questions(parsed.get("suggested_questions"))

    return {
        "success": True,
        "root_cause": root_cause,
        "reason_now": reason_now,
        "directions": directions,
        "resolution_hint": resolution_hint,
        "suggested_questions": suggested_questions,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
