# ==================== 1. 환경변수 로드 (가장 먼저!) ====================
import io
import logging
import sys

logger = logging.getLogger(__name__)

if getattr(sys.stdout, "buffer", None):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import openai
import hashlib
from logic.twelve_states import calculate_twelve_states, get_twelve_state
from logic import test
from logic import lunar_converter
from logic.jijanggan import calculate_jijanggan_for_pillars
from logic.saju_core import compute_full_saju
from logic.saju_engine.core.sinsal import analyze_sinsal
from logic.saju_engine.core.ten_gods import calculate_ten_god
from logic.saju_engine.core.harmony_clash import analyze_harmony_clash
from logic.saju_engine.core.strength import calculate_strength_score, analyze_strength_combination
from logic.feature_flags import use_new_saju_engine, get_engine_version_label
from logic.theory_retriever import TheoryRetriever
from auth_kakao import router as kakao_router
from auth_google2 import router as google_router
import os
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from typing import Optional, Any, Dict
import json
from datetime import datetime, date, timezone, timedelta
import asyncio
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# ==================== 2. 나머지 import ====================

# ==================== 3. AI 클라이언트 초기화 (Lazy Loading) ====================
# Gemini 우선 사용, OpenAI는 fallback만을 위해 lazy loading

# ==================== 3b. Gemini 클라이언트 초기화 ====================
from google import genai as _genai_lib
from google.genai import types as _genai_types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    gemini_client = _genai_lib.Client(api_key=GEMINI_API_KEY)
    logger.warning("✅ Gemini 클라이언트 초기화 성공")
else:
    gemini_client = None
    logger.warning("⚠️ GEMINI_API_KEY 없음")

# OpenAI 클라이언트는 fallback을 위해 lazy loading
client = None

def get_openai_client():
    """OpenAI 클라이언트 lazy loading"""
    global client
    if client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                from openai import OpenAI
                client = OpenAI(
                    api_key=api_key,
                    timeout=30.0,
                    max_retries=2
                )
                print("✅ OpenAI 클라이언트 lazy loading 성공")
            except Exception as e:
                print(f"⚠️ OpenAI 클라이언트 초기화 실패: {e}")
                client = None
    return client

# ==================== 4. FastAPI 앱 생성 ====================
TEST_MODE = os.getenv("TEST_MODE", "false").lower() == "true"
print(f"TEST_MODE: {TEST_MODE}")

app = FastAPI(title="Saju API", version="0.1.0")
app.include_router(kakao_router)
app.include_router(google_router)

# ... 나머지 코드 그대로 ...

# CORS: credentials(쿠키) 사용 시 allow_origins에 "*" 불가 → 명시적 origin 필요
_cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://hsaju.com",
    "https://www.hsaju.com",
]
_frontend_url = (os.getenv("FRONTEND_URL") or "").strip().rstrip("/")
if _frontend_url and _frontend_url not in _cors_origins:
    _cors_origins.append(_frontend_url)
_cors_origins_str = os.getenv("CORS_ORIGINS", "").strip()
if _cors_origins_str:
    for o in _cors_origins_str.split(","):
        o = o.strip().rstrip("/")
        if o and o not in _cors_origins:
            _cors_origins.append(o)

# Railway URL 추가 (Railway 배포 시 자동으로 인식)
railway_url = os.getenv("RAILWAY_PUBLIC_URL", "").strip().rstrip("/")
if railway_url and railway_url not in _cors_origins:
    _cors_origins.append(railway_url)

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
    delete_saju_for_user,
    get_report_cache,
    save_report_cache,
    clear_all_report_cache,
)
from logic.user_db import (
    get_user_id_from_session,
    get_user_by_id,
    get_seed_balance,
    deduct_seed,
    refresh_and_get_membership_status,
    activate_membership,
    get_report_credits,
    add_report_credits,
    deduct_report_credit,
)
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

# 일간 채팅 카운터 DB 초기화
try:
    from logic.daily_chat_db import init_daily_chat_db
    init_daily_chat_db()
    print("✅ 일간 채팅 DB 초기화 완료")
except Exception as e:
    print(f"⚠️ 일간 채팅 DB 초기화: {e}")

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
    return {"allowed": True, "loggedIn": user_id is not None}


class MembershipActivateRequest(BaseModel):
    user_id: int
    months: int = 1


def _can_activate_membership(request: Request, target_user_id: int) -> bool:
    """결제 웹훅용 시크릿 또는 본인 로그인일 때만 허용."""
    secret = (os.getenv("MEMBERSHIP_ACTIVATE_SECRET") or "").strip()
    if secret:
        hdr = (request.headers.get("x-membership-activate-secret") or "").strip()
        if hdr == secret:
            return True
    sess_uid = get_user_id_from_request(request)
    return sess_uid is not None and sess_uid == target_user_id


@app.get("/api/membership/status")
async def membership_status(request: Request):
    """로그인 유저 멤버십 상태. 만료 시 DB에서 is_member=False로 갱신."""
    user_id = get_user_id_from_request(request)
    if user_id is None:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    st = refresh_and_get_membership_status(user_id)
    return {
        "is_member": bool(st.get("is_member")),
        "membership_started_at": st.get("membership_started_at"),
        "membership_expires_at": st.get("membership_expires_at"),
    }


@app.post("/api/membership/activate")
async def membership_activate(request: Request, body: MembershipActivateRequest):
    """
    결제 완료 후 멤버십 활성화.
    - 환경변수 MEMBERSHIP_ACTIVATE_SECRET 이 설정된 경우: 헤더 x-membership-activate-secret 일치 필요
    - 또는 로그인한 사용자가 body.user_id 와 동일할 때 허용
    """
    if not _can_activate_membership(request, body.user_id):
        raise HTTPException(status_code=403, detail="권한이 없습니다.")
    months = body.months if body.months is not None else 1
    months = max(1, min(int(months), 120))
    try:
        result = activate_membership(body.user_id, months)
        return result
    except LookupError:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


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


def _attach_ten_gods_to_payload(data: dict[str, Any]) -> None:
    try:
        dp = (data.get("day_pillar") or "").strip()
        yp = (data.get("year_pillar") or "").strip()
        mp = (data.get("month_pillar") or "").strip()
        if len(dp) < 2 or len(yp) < 2 or len(mp) < 2:
            data["ten_gods"] = {}
            return
        day_stem = dp[0]
        targets: dict[str, str] = {
            "year_stem": yp[0],
            "year_branch": yp[1],
            "month_stem": mp[0],
            "month_branch": mp[1],
            "day_branch": dp[1],
        }
        hp = data.get("hour_pillar")
        if isinstance(hp, str) and len(hp.strip()) >= 2:
            hs = hp.strip()[:2]
            targets["hour_stem"] = hs[0]
            targets["hour_branch"] = hs[1]
        data["ten_gods"] = {k: calculate_ten_god(day_stem, v) for k, v in targets.items()}
    except Exception:
        data["ten_gods"] = {}


def _attach_strength_to_payload(data: dict[str, Any]) -> None:
    try:
        day_stem = data["day_pillar"][0]
        pillars = {
            "year": data["year_pillar"],
            "month": data["month_pillar"],
            "day": data["day_pillar"],
            "hour": data.get("hour_pillar") or data.get("_hour_pillar_for_sinsal", ""),
        }
        result = calculate_strength_score(day_stem, pillars)
        result["combination"] = analyze_strength_combination(
            result["deukryeong"], result["deukji"], result["deukse"]
        )
        data["strength"] = result
    except Exception:
        data["strength"] = {
            "strength": "알 수 없음",
            "total_score": 0,
            "deukryeong": False,
            "deukji": False,
            "deukse": False,
            "combination": "판단 불가",
        }


_HARMONY_CLASH_EMPTY: dict[str, list] = {
    "cheongan_hap": [],
    "cheongan_jaenghap": [],
    "cheongan_chung": [],
    "jiji_yukhap": [],
    "jiji_samhap": [],
    "jiji_banhap": [],
    "jiji_chung": [],
}


def _attach_harmony_clash_to_payload(data: dict[str, Any]) -> None:
    try:
        yp = (data.get("year_pillar") or "").strip()
        mp = (data.get("month_pillar") or "").strip()
        dp = (data.get("day_pillar") or "").strip()
        if len(yp) < 2 or len(mp) < 2 or len(dp) < 2:
            data["harmony_clash"] = dict(_HARMONY_CLASH_EMPTY)
            return
        hp = data.get("hour_pillar")
        if isinstance(hp, str) and len(hp.strip()) >= 2:
            hour_str = hp.strip()[:2]
        else:
            solar_str = (data.get("solar_datetime_used") or "").strip()
            solar_dt = datetime.strptime(solar_str, "%Y-%m-%d %H:%M")
            hour_str = test.calculate_hour_pillar(
                solar_dt, dp[:2], apply_korea_dst=True
            )
        if len(hour_str) < 2:
            data["harmony_clash"] = dict(_HARMONY_CLASH_EMPTY)
            return
        pillars = {
            "year": yp[:2],
            "month": mp[:2],
            "day": dp[:2],
            "hour": hour_str[:2],
        }
        data["harmony_clash"] = analyze_harmony_clash(pillars)
    except Exception:
        data["harmony_clash"] = dict(_HARMONY_CLASH_EMPTY)


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
    사주 AI 채팅. TheoryRetriever로 질문 관련 이론 검색, 사주 context 포함, Gemini 3 Flash 스트리밍 응답.
    """
    # Gemini 우선 사용, 없으면 GPT-4o fallback
    if not gemini_client and not client:
        raise HTTPException(status_code=503, detail="AI API not configured")
    if not req.messages or not any(m.role == "user" and (m.content or "").strip() for m in req.messages):
        raise HTTPException(status_code=400, detail="사용자 메시지가 필요합니다.")

    chat_uid = get_user_id_from_request(request)
    _chat_mem_required = (os.getenv("CHAT_MEMBERSHIP_REQUIRED") or "").strip().lower() in (
        "1",
        "true",
        "yes",
    )
    if chat_uid is not None and _chat_mem_required:
        _mst = refresh_and_get_membership_status(chat_uid)
        if not _mst.get("is_member"):
            raise HTTPException(status_code=403, detail="멤버십이 필요합니다.")

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
        "\n【응답 길이 규칙 — 반드시 준수】",
        "- 답변은 **1-2줄 이내**로 짧고 간결하게 작성하세요.",
        "- 핵심만 전달하고, 불필요한 설명은 생략하세요.",
        "- 사용자가 '자세히', '더', '구체적으로' 등을 요청할 때만 3-4줄로 답변하세요.",
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
            if gemini_client:
                # Gemini 스트리밍 사용
                import google.genai as _genai
                from google.genai import types as _genai_types
                
                # 전체 대화 히스토리를 포함한 프롬프트 구성
                conversation = system_content + "\n\n[대화 기록]\n"
                for msg in openai_messages[1:]:  # system 메시지 제외
                    role_label = "사용자" if msg["role"] == "user" else "AI 상담사"
                    conversation += f"\n{role_label}: {msg['content']}\n"
                
                response = await gemini_client.aio.models.generate_content_stream(
                    model="gemini-2.5-flash",
                    contents=conversation,
                    config=_genai_types.GenerateContentConfig(
                        max_output_tokens=300,  # 짧은 응답 (1-2줄)
                        temperature=0.7,
                    )
                )
                
                async for chunk in response:
                    if chunk.text:
                        yield f"data: {json.dumps({'content': chunk.text}, ensure_ascii=False)}\n\n"
                yield "data: [DONE]\n\n"
            else:
                # GPT-4o fallback
                openai_client = get_openai_client()
                if openai_client:
                    stream = openai_client.chat.completions.create(
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
                else:
                    yield f"data: {json.dumps({'error': 'AI 서비스를 사용할 수 없습니다.'}, ensure_ascii=False)}\n\n"
        except Exception as e:
            print(f"❌ /api/chat 스트리밍 오류: {e}")
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/theory/search")
async def search_theory(request: Request):
    """
    채팅 AI용 이론 검색 엔드포인트
    의도(intent)와 질문(query)을 받아
    관련 이론 텍스트 + 규칙 기반 해석 결과를 반환
    """
    try:
        body = await request.json()
        query = body.get("query", "")
        intent = body.get("intent", "")
        saju_data = body.get("saju_data", None)

        result: dict[str, Any] = {"theory": "", "ok": True, "interpretation": None}

        if query or intent:
            retriever = get_theory_retriever()
            search_query = query or intent
            theory_text = retriever.get_theories_by_query(search_query)
            if len(theory_text) > 8000:
                theory_text = theory_text[:8000] + "\n...(이하 생략)"
            result["theory"] = theory_text
            result["query"] = search_query
            result["length"] = len(theory_text)

        # 사주 데이터가 있으면 규칙 기반 해석 엔진 실행
        if saju_data and isinstance(saju_data, dict):
            try:
                from logic.saju_engine.core.saju_interpreter import interpret_all
                result["interpretation"] = interpret_all(saju_data)
            except Exception as e:
                print(f"⚠️ saju_interpreter error: {e}")

        return result
    except Exception as e:
        print(f"❌ theory search error: {e}")
        return {"theory": "", "ok": False, "error": str(e)}


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
    cache_key: Optional[str] = None
    report_type: str = "basic"  # basic | deep


class DeepReportRequest(BaseModel):
    day_stem: str
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str
    gender: Optional[str] = None
    cache_key: Optional[str] = None
    birth_year: Optional[int] = None
    birth_month: Optional[int] = None
    birth_day: Optional[int] = None
    birth_hour: Optional[int] = None
    calendar_type: Optional[str] = "solar"


class SummaryGPTRequest(BaseModel):
    """종합 요약 GPT 요청 (프론트에서 system + user 프롬프트 전달)"""
    system: str
    user: str
    harmony_clash: Optional[Dict[str, Any]] = None
    cache_key: Optional[str] = None
    year_pillar: Optional[str] = None
    month_pillar: Optional[str] = None
    day_pillar: Optional[str] = None
    hour_pillar: Optional[str] = None
    ten_gods: Optional[Dict[str, Any]] = None
    strength: Optional[str] = None
    sinsal: Optional[Dict[str, Any]] = None
    gender: Optional[str] = None


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


def _fmt_prompt_value(v: Any) -> str:
    if isinstance(v, list):
        return " / ".join(str(x) for x in v if x)
    return str(v).strip() if v is not None else ""


def _build_non_empty_block(title: str, data: dict[str, Any], ordered_keys: list[str]) -> str:
    lines = []
    for k in ordered_keys:
        text = _fmt_prompt_value(data.get(k))
        if text:
            lines.append(f"{k}: {text}")
    if not lines:
        return ""
    return f"[{title}]\n" + "\n".join(lines)


def _build_money_analysis_block(data: dict[str, Any]) -> str:
    """재물 심화 데이터를 GPT가 읽기 쉬운 구조화 텍스트로 변환."""
    ILGAN_NAME = {
        "甲": "갑목", "乙": "을목", "丙": "병화", "丁": "정화",
        "戊": "무토", "己": "기토", "庚": "경금", "辛": "신금",
        "壬": "임수", "癸": "계수",
    }
    ELEMENT_KO = {
        "목": "목(木)", "화": "화(火)", "토": "토(土)",
        "금": "금(金)", "수": "수(水)",
    }

    ilgan = data.get("ilgan", "")
    jaeseong_element = data.get("jaeseong_element", "")
    jaeseong_absent = data.get("jaeseong_absent", True)
    jaeseong_positions = data.get("jaeseong_positions") or []
    jaeseong_tonggeun = data.get("jaeseong_tonggeun") or {}
    jaeseong_hap = data.get("jaeseong_hap") or []
    jaeseong_chung = data.get("jaeseong_chung") or []
    bigeop_count = data.get("bigeop_count", 0)
    siksang_count = data.get("siksang_count", 0)
    siksang_saengjae = data.get("siksang_saengjae", False)
    strength = data.get("strength", "")
    strength_score = data.get("strength_score", 0)
    can_handle_money = data.get("can_handle_money", False)
    daeun_effect = data.get("daeun_effect", "")
    daeun_branch_tg = data.get("daeun_branch_tg", "")
    alt_income = data.get("alt_income") or []
    seun_stem_god = data.get("seun_stem_god", "")
    seun_branch_god = data.get("seun_branch_god", "")
    seun_favorable = data.get("seun_favorable")
    yongshin_elements = data.get("yongshin_elements") or []
    gishin_elements = data.get("gishin_elements") or []
    geunmyo_stages = data.get("geunmyo_money_stages") or []
    money_sinsal = data.get("money_sinsal") or []

    lines = ["[재물 분석 데이터 - 이것만 사용, 추측 금지]"]
    lines.append(f"일간: {ilgan} ({ILGAN_NAME.get(ilgan, ilgan)})")
    lines.append(f"재성 오행: {ELEMENT_KO.get(jaeseong_element, jaeseong_element)}")

    if jaeseong_absent:
        lines.append(f"재성 사주 존재 여부: 없음 ({jaeseong_element} 오행이 원국에 없음)")
    else:
        pos_strs = []
        for jp in jaeseong_positions:
            tong = "통근O" if jaeseong_tonggeun.get(jp["position"]) else ""
            pos_strs.append(f"{jp['position']}({jp['char']}/{jp['ten_god']}{' ' + tong if tong else ''})")
        lines.append(f"재성 위치: {', '.join(pos_strs)}")

    lines.append(f"비겁 개수: {bigeop_count}{'  (비겁 과다 — 재물 분산 위험)' if bigeop_count >= 3 else ''}")
    lines.append(f"식상 개수: {siksang_count}")
    lines.append(f"식상생재: {'있음' if siksang_saengjae else '없음'}")
    if alt_income:
        alt_strs = [f"{a['type']}: {a['meaning']}" for a in alt_income]
        lines.append(f"대안 수입 구조 (재성 없을 때): {' / '.join(alt_strs)}")
    lines.append(f"신강약: {strength} (점수: {strength_score})")
    lines.append(f"재성 감당 여부: {'가능' if can_handle_money else '어려움 (신약 — 재물 들어와도 소화 힘듦)'}")

    if daeun_effect:
        lines.append(f"현재 대운: {daeun_effect}")
    if seun_stem_god or seun_branch_god:
        seun_label = "유리" if seun_favorable else "중립/불리"
        lines.append(f"올해 세운: {seun_stem_god}/{seun_branch_god} 세운 ({seun_label})")
    if yongshin_elements:
        lines.append(f"용신: {'/'.join(str(e) for e in yongshin_elements)}")
    if gishin_elements:
        lines.append(f"기신: {'/'.join(str(e) for e in gishin_elements)}")
    if jaeseong_hap:
        lines.append(f"재성 합: {'; '.join(jaeseong_hap)}")
    if jaeseong_chung:
        lines.append(f"재성 충: {'; '.join(jaeseong_chung)}")
    if geunmyo_stages:
        lines.append(f"재물 활성 인생 단계: {', '.join(geunmyo_stages)}")
    if money_sinsal:
        sinsal_strs = [f"{s['type']}({s.get('meaning', s.get('items', ''))})" for s in money_sinsal]
        lines.append(f"재물 신살: {', '.join(sinsal_strs)}")
    
    # 십이운성 (재성 위치의 생명력)
    jaeseong_sibiun = data.get("jaeseong_sibiun") or []
    if jaeseong_sibiun:
        sibiun_strs = []
        for js in jaeseong_sibiun:
            sibiun_strs.append(
                f"{js['position']} {js.get('char', '')} — {js['sibiun']}({js['vitality']}점): {js['meaning']}"
            )
        lines.append(f"재성 십이운성 (생명력): {' / '.join(sibiun_strs)}")

    return "\n".join(lines)


def _call_gpt_with_retry(
    system_prompt: str,
    user_prompt: str,
    model: str = "gpt-4o",
    max_tokens: int = 4000,
    max_retries: int = 2,
) -> str:
    """GPT-4o fallback 호출 (GEMINI_API_KEY 없을 때)."""
    current_system = system_prompt
    content = ""
    for attempt in range(max_retries + 1):
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": current_system},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.4,
        )
        content = (resp.choices[0].message.content or "").strip()
        section_count = sum(1 for m in ["1.", "2.", "3.", "4.", "5.", "6."] if m in content)
        logger.warning(f"[GPT] attempt {attempt + 1}: {len(content)} chars, {section_count} sections")

        if len(content) >= 3000 and section_count >= 6:
            return content

        if attempt < max_retries:
            logger.warning(f"[GPT] Too short ({len(content)} chars), retrying...")
            current_system = (
                "[재시도: 이전 응답이 너무 짧았음. 반드시 각 섹션 600자 이상 작성]\n\n"
                + system_prompt
            )

    logger.warning(f"[GPT] Final attempt result: {len(content)} chars")
    return content


async def _call_gemini_with_retry(
    system_prompt: str,
    user_prompt: str,
    model: str = "gemini-2.5-flash",
    max_tokens: int = 8192,
    max_retries: int = 2,
    temperature: float = 0.7,
) -> str:
    """Gemini 호출 + 길이 검증 재시도. 최소 2,000자 & 6개 섹션 보장."""
    if not gemini_client:
        raise RuntimeError("GEMINI_API_KEY not configured")

    cfg = _genai_types.GenerateContentConfig(
        max_output_tokens=max_tokens,
        temperature=temperature,
    )

    current_system = system_prompt
    content = ""
    for attempt in range(max_retries + 1):
        try:
            full_prompt = f"{current_system}\n\n{user_prompt}"
            response = await asyncio.to_thread(
                gemini_client.models.generate_content,
                model=model,
                contents=full_prompt,
                config=cfg,
            )
            content = response.text or ""

            section_count = sum(
                1 for marker in ["1.", "2.", "3.", "4.", "5.", "6."]
                if marker in content
            )
            logger.warning(f"[Gemini] attempt {attempt + 1}: {len(content)} chars, {section_count} sections")

            if len(content) >= 2000 and section_count >= 6:
                return content

            if attempt < max_retries:
                logger.warning(f"[Gemini] Too short ({len(content)} chars), retrying...")
                current_system = "[재시도: 이전 응답이 너무 짧음. 각 섹션 600자 이상 필수]\n\n" + system_prompt

        except Exception as e:
            logger.warning(f"[Gemini] attempt {attempt + 1} error: {e}")
            if attempt == max_retries:
                raise

    logger.warning(f"[Gemini] Final attempt result: {len(content)} chars")
    return content


def _build_deep_report_system_prompt(topic: str, analysis_block: str, tone: str = "empathy") -> str:
    """tone: empathy(기본) | realistic(수정 전 직설 톤, 동일 분량·섹션)."""
    SECTION_NAMES = {
        "재물": [
            "💰 재물 기질",
            "💵 수입 구조",
            "🕳 지출 패턴",
            "📈 현재 재물 흐름",
            "🗓 올해 재물운",
            "✅ 실천 조언",
        ],
        "연애": [
            "❤️ 연애 기질",
            "👤 이상형",
            "🔄 관계 패턴",
            "💫 현재 인연 흐름",
            "🗓 올해 연애운",
            "✅ 실천 조언",
        ],
        "직업": [
            "💼 일하는 방식",
            "🎯 잘 맞는 직종",
            "🏢 조직 vs 독립",
            "📈 현재 커리어 흐름",
            "🗓 올해 직업운",
            "✅ 실천 조언",
        ],
    }
    sections = SECTION_NAMES.get(topic, [f"섹션 {i+1}" for i in range(6)])
    sections_str = "\n".join(f"{i+1}. {s}" for i, s in enumerate(sections))

    shared_head = f"""[CRITICAL: 분량 규칙 - 이것이 가장 중요한 규칙]
반드시 6개 섹션을 모두 작성해야 합니다.
각 섹션은 최소 600자 이상이어야 합니다.
전체 응답은 최소 4,000자 이상이어야 합니다.
섹션을 건너뛰거나 짧게 끝내는 것은 절대 금지입니다.

[계산된 사실 — 이 내용만 사용. 없는 내용 추가 금지. 추측 금지.]
{analysis_block}

[작성 전 필수 확인]
위 계산된 사실만 사용해서 각 섹션을 작성해줘.
데이터에 없는 내용 절대 추가 금지.
사실이 부정적이어도 솔직하게 쓰고, 그 의미를 현실 언어로 풀어줘.
긍정 추측 금지 — 데이터가 없으면 없는 이유와 그 영향을 설명해.

[섹션 구성 — 반드시 아래 순서대로 작성]
{sections_str}

섹션 제목은 위 이모지+한글 그대로 사용. 순서·이름 변경 금지.

[분량 기준 — 반드시 지킬 것]
• 전체: 4,000~5,000자
• 섹션 6개, 각 섹션 600~800자
• 각 섹션 최소 5~7문장 — 한 문장으로 끝내는 섹션 절대 금지
• 각 섹션 구조:
  1) 행동/상황으로 시작하는 첫 문장 ("돈이 들어와도 손에 안 잡히는 느낌..." 같은 식)
  2) 왜 그런지 현실 언어로 2~3문장
  3) 실제 삶에서 어떻게 나타나는지 2~3문장
  4) 지금 이 시기와 연결 1~2문장
"""

    empathy_tail = f"""
[표현 규칙 — 절대 준수]
1. 사주 용어 완전 금지:
   - 재성, 관성, 식신, 상관, 편재, 정재, 비겁, 인성 → 사용 금지
   - 대운, 세운, 천간, 지지, 오행 → 사용 금지
   - 신강, 신약, 통근, 합충 → 사용 금지

2. 톤 규칙 (Claude Sonnet 스타일 — 공감적이고 따뜻하게):
   a) 부정적 사실을 말할 때 반드시 3단 구조:
      ① 공감/상황 묘사 ("~하죠?", "~한 느낌 들죠?")
      ② 사실 전달 (계산된 데이터 기반)
      ③ "하지만" 또는 "그 대신"으로 실제 가능한 출구 제시
   
   b) 각 섹션 구조:
      - 1~2문장: 공감 또는 상황 묘사 (독자가 "맞아, 나 이래" 느끼게)
      - 2~3문장: 왜 그런지 (계산된 사실 기반)
      - 2~3문장: 실제 삶에서 어떻게 나타나는지 + 구체적 예시
      - 1~2문장: 출구/전략 (계산된 데이터에서 실제로 가능한 것만)
   
   c) 희망 신호 (단, 데이터 근거 있을 때만):
      - "지금은 ~이지만, 앞으로는 ~" (대운·세운 데이터 있을 때)
      - "~하면 달라질 수 있어요" (대안 구조가 데이터에 있을 때)
      - "이미 ~는 잘하고 있어요" (강점 데이터 있을 때)
      - 근거 없는 희망은 절대 금지

3. 표현 변환 (사실 기반 + 공감 톤):
   - 재성 없음 → "돈이 내 손에서 직접 만들어지진 않지만, 그 대신 사람·관계·기회를 통해 들어오는 구조예요. 혼자 벌려고 하면 힘들지만, 연결되면 오히려 더 잘 풀려요."
   - 신약 → "에너지가 분산되기 쉬운 타입이에요. 그래서 '많이 하기'보다 '잘 고르기'가 중요하고, 환경을 잘 세팅하면 오히려 더 효율적으로 움직일 수 있어요."
   - 비겁 과다 → "형제·친구·동료와 나누는 일이 많은 사주예요. 혼자 쌓아두는 것보다, 함께 쓰면서 관계를 키우는 게 원래 방식이거든요. 다만 '자동으로 빠지는 구조'를 만들면 같은 수입으로도 2배는 더 모을 수 있어요."
   - 식상생재 → "재능과 표현이 수입으로 연결되는 구조예요. 내가 만든 것, 내가 한 말, 내 작품이 돈이 되는 방식이거든요."
   - 정관 대운 → "지금은 급하게 뭔가 새로 만들려 하기보다, 현재 자리에서 인정받는 게 더 유리한 시기예요."

4. 금지 표현 → 대체 표현:
   - "~할 수 없습니다" → "~하긴 어렵지만, 대신 ~가 더 잘 맞아요"
   - "~가 부족합니다" → "~보다는 ~가 강해요"
   - "~하세요" (명령) → "~하면 더 편해요" (제안)
   - "제한적입니다" → "이 방식보다는 저 방식이 더 잘 맞아요"

5. 주어는 항상 "당신은" 또는 "이 사주는" 사용
   "이런 사람들은", "이들은", "이러한 유형은" 절대 금지

6. 문체 규칙:
   - "~하는 경향이 있습니다" → "~해요"
   - "~할 수 있습니다" → "~예요" 또는 "~할 수 있어요"
   - "실제로, 이들은" → 삭제
   - "~에 있어" → 삭제
   - 존댓말 유지, 구어체 허용

[좋은 예시 — 공감 → 사실 → 출구]
나쁜: "재성이 없기 때문에 재정적 기회가 제한적입니다"
좋은: "돈이 들어와도 왜 이렇게 불안한지 모르겠죠? 벌어도 벌어도 통장에 안 남는 느낌.
      이 사주는 돈을 '내 손으로 만드는' 구조보다는, '사람·관계·기회를 통해 들어오는' 구조예요.
      그래서 혼자 벌려고 하면 오히려 더 힘들어지고, 협업·소개·연결로 움직이면 훨씬 잘 풀려요."

나쁜: "정관 대운이 진행 중이기 때문에 안정적인 흐름입니다"
좋은: "지금은 급하게 뭔가 만들려 하기보다, 현재 자리에서 인정받는 게 더 유리한 시기예요.
      새로 시작하는 것보다, 지금 하는 일을 더 잘하는 게 오히려 빠른 길이거든요."

나쁜: "비겁이 많아 재물 분산 위험이 있습니다"
좋은: "형제·친구·가족과 나누는 일이 많은 사주예요. 이게 나쁜 건 아니에요.
      이 사주는 '혼자 쌓기'보다 '함께 쓰면서 관계 키우기'가 원래 방식이거든요.
      다만 '의지로 모으기'보다 '자동으로 빠지는 구조'를 만들면 같은 수입으로도 2배는 더 모을 수 있어요."

[✅ 실천 조언 섹션 필수 요소]
- 추상적 조언 금지 ("긍정적으로 생각하세요" 같은 것)
- 반드시 구체적 행동 3~5가지 제시
- 각 행동은 "왜 이게 이 사주에 맞는지" 근거 포함
- 예: "월급날 자동 이체 (의지 필요 없음) / 체크카드 대신 신용카드 (심리적 거리) / 쓰고 남은 돈이 아니라 처음부터 없던 돈으로 만들기"

주제는 {topic}에만 집중. 다른 주제 확장 금지.
"""

    realistic_tail = f"""
[표현 규칙 — 절대 준수]
1. 사주 용어 완전 금지:
   - 재성, 관성, 식신, 상관, 편재, 정재, 비겁, 인성 → 사용 금지
   - 대운, 세운, 천간, 지지, 오행 → 사용 금지
   - 신강, 신약, 통근, 합충 → 사용 금지

2. 대신 이렇게 표현:
   - 재성 없음 → "돈을 직접 만들어내는 힘이 약한 구조예요"
   - 신약 → "에너지가 분산되기 쉬운 타입이에요"
   - 겁재 대운 → "경쟁과 소비가 많아지는 시기예요"
   - 식상생재 → "재능과 표현이 수입으로 연결되는 구조예요"
   - 정관 대운 → "지금 자리에서 인정받는 게 더 유리한 시기예요"

3. 톤: 위로·공감 멘트·질문형 첫머리를 과하게 쓰지 말 것. 계산된 사실을 현실 언어로 직설적으로 전달. 데이터에 없는 희망·완충 문장 금지.

4. 주어는 항상 "당신은" 또는 "이 사주는" 사용
   "이런 사람들은", "이들은", "이러한 유형은" 절대 금지

5. 문체 규칙:
   - "~하는 경향이 있습니다" → "~해요"
   - "~할 수 있습니다" → "~예요"
   - "실제로, 이들은" → 삭제
   - "~에 있어" → 삭제
   - 존댓말 유지, 구어체 허용

[좋은 예시]
나쁜: "재성이 없기 때문에 재정적 기회가 제한적입니다"
좋은: "돈이 내 손에서 만들어지기보다, 누군가 줘야 생기는 구조예요.
      혼자 벌겠다고 움직이면 오히려 더 힘들어지는 패턴이거든요."

나쁜: "정관 대운이 진행 중이기 때문에 안정적인 흐름입니다"
좋은: "지금은 급하게 뭔가 만들려 하기보다,
      현재 자리에서 인정받는 게 더 유리한 시기예요."

주제는 {topic}에만 집중. 다른 주제 확장 금지.
"""

    if (tone or "empathy").strip().lower() == "realistic":
        return (shared_head + realistic_tail).strip()
    return (shared_head + empathy_tail).strip()


def _build_interp_saju_data(req: GPTInterpretRequest | DeepReportRequest, analysis: dict[str, Any]) -> dict[str, Any]:
    # analyze_full_saju() returns ten_gods as {"년간": {"char": "庚", "ten_god": "정인"}, ...}
    # saju_interpreter expects flat string values: {"년간": "정인", ...}
    raw_tg = analysis.get("ten_gods", {})
    flat_ten_gods: dict[str, str] = {}
    for pos, val in raw_tg.items():
        if isinstance(val, dict):
            tg_name = val.get("ten_god") or val.get("ten_god_name", "")
            if tg_name:
                flat_ten_gods[pos] = tg_name
        elif isinstance(val, str) and val:
            flat_ten_gods[pos] = val

    # basic_info lets tonggeun/geunmyo/seun sub-modules find pillar data
    # (those modules only read basic_info or pillars, not year_pillar etc.)
    basic_info = {
        "day_stem": req.day_stem,
        "year": req.year_pillar,
        "month": req.month_pillar,
        "day": req.day_pillar,
        "hour": req.hour_pillar,
    }

    # Build pillars dict from basic_info so tonggeun/geunmyo sub-modules can read it.
    # analyze_full_saju does not return a 'pillars' key — basic_info has full pillar strings.
    pillars: dict[str, Any] = {}
    for pos, key in [("year", "year"), ("month", "month"), ("day", "day"), ("hour", "hour")]:
        val = basic_info.get(key, "")
        if isinstance(val, str) and len(val) >= 2:
            pillars[pos] = {
                "stem": val[0],
                "branch": val[1],
                "heavenly_stem": val[0],
                "earthly_branch": val[1],
            }

    result: dict[str, Any] = {
        "day_stem": req.day_stem,
        "day_pillar": req.day_pillar,
        "month_pillar": req.month_pillar,
        "year_pillar": req.year_pillar,
        "hour_pillar": req.hour_pillar,
        "ten_gods": flat_ten_gods,
        "ten_gods_count": analysis.get("summary", {}).get("ten_gods_count", {}),
        "strength": analysis.get("strength", analysis.get("summary", {}).get("strength", "")),
        "harmony_clash": analysis.get("harmony_clash", {}),
        "sinsal": analysis.get("sinsal", {}),
        "gender": getattr(req, "gender", None),
        "basic_info": basic_info,
        "pillars": pillars if pillars else None,
    }
    return result


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
        _attach_ten_gods_to_payload(data)
        _attach_harmony_clash_to_payload(data)
        _attach_strength_to_payload(data)
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
async def interpret_with_gpt(req: GPTInterpretRequest, request: Request):
    """✅ RAG 기반 GPT 오행 해석 (합화 포함) — Pro 또는 분析권 보유 필요."""
    # 접근 제어: Pro 또는 분析권 보유
    _uid = get_user_id_from_request(request)
    if _uid is None:
        raise HTTPException(status_code=403, detail=json.dumps({"error": "report_locked"}, ensure_ascii=False))
    if not TEST_MODE:
        _mst = refresh_and_get_membership_status(_uid)
        _is_pro = bool(_mst.get("is_member"))
        if (req.report_type or "basic").lower() == "deep":
            if not _is_pro:
                from logic.payment_db import has_purchased_report as _has_pr
                if not _has_pr(_uid, "deep"):
                    raise HTTPException(status_code=403, detail=json.dumps({"error": "purchase_required", "price": 4900}, ensure_ascii=False))
        else:
            if not _is_pro:
                if get_report_credits(_uid) <= 0:
                    raise HTTPException(status_code=403, detail=json.dumps({"error": "report_locked"}, ensure_ascii=False))

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

        if 'harmony_clash' not in analysis or not isinstance(
            analysis.get('harmony_clash'), dict
        ):
            analysis['harmony_clash'] = analyze_harmony_clash(pillars_dict)

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

        # ✅ 3-5. 규칙 기반 사주 해석 (interpret_all)
        interpretation = None
        interpretation_block = ""
        deep_block = ""
        try:
            from logic.saju_engine.core.saju_interpreter import interpret_all
            saju_data_for_interp = _build_interp_saju_data(req, analysis)
            interpretation = interpret_all(saju_data_for_interp)
            summary = interpretation.get("summary_for_gpt", {}) if isinstance(interpretation, dict) else {}
            interpretation_block = f"""
[규칙 기반 사주 해석 결과 — 반드시 이 내용 기반으로만 답변]
성격: {summary.get('personality_points', '')}
재물: {summary.get('money_points', '')}
연애: {summary.get('love_points', '')}
직업: {summary.get('career_points', '')}
현재시기: {summary.get('current_period_points', summary.get('period_points', ''))}
"""
            if (req.report_type or "basic").lower() == "deep":
                deep_block = f"""
[심화 분석 데이터]
통근투출: {summary.get('tonggeun_points', '')}
기둥별 구조: {summary.get('geunmyo_points', '')}
형파해원진: {summary.get('hyeong_points', '')}
올해 세운: {summary.get('seun_points', '')}
"""
            print(f"✅ interpret_all 완료: {list(interpretation.keys())}")
        except Exception as e:
            print(f"⚠️ interpret_all 실패: {e}")

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
        # 월지 추출 (캐시 반환에도 필요)
        month_pillar_str = pillars_dict.get('month', '')
        month_branch = month_pillar_str[1] if isinstance(
            month_pillar_str, str) and len(month_pillar_str) >= 2 else ''

        # ✅ 6-0. 캐시 확인
        cache_key = req.cache_key or f"{req.year_pillar}_{req.month_pillar}_{req.day_pillar}_{req.hour_pillar}_{req.tone}"
        cached_elements = get_report_cache(cache_key, "elements")
        cached_core_values = get_report_cache(cache_key, "core_values")
        if cached_elements and cached_core_values:
            print(f"✅ 리포트 캐시 히트: {cache_key}")
            return {
                "success": True,
                "cached": True,
                "interpretations": [
                    {
                        "section": "elements",
                        "title": get_title_by_tone(req.tone),
                        "content": cached_elements,
                        "related_theories": ["신강약", "오행십신", "합충", "신살"]
                    },
                    {
                        "section": "core_values",
                        "title": "삶의 핵심 가치관과 지향점",
                        "content": cached_core_values,
                        "related_theories": ["월지", "십신", "가치관"]
                    }
                ],
                "metadata": {
                    "model": "cached",
                    "day_stem": req.day_stem,
                    "tone": req.tone,
                    "strength": analysis['summary']['strength'],
                    "strength_score": analysis['summary']['strength_score'],
                    "element_counts": element_counts,
                    "ten_gods": analysis['summary']['ten_gods_count'],
                    "patterns": analysis.get('patterns', []),
                    "harmony": {
                        "original": element_counts,
                        "transformed": transformed_counts,
                        "transformations": transformations
                    },
                    "core_values": {"month_branch": month_branch}
                }
            }

        try:
            theories_for_gpt = theories
            if interpretation_block:
                theories_for_gpt = f"{theories_for_gpt}\n\n{interpretation_block}"
            if deep_block:
                theories_for_gpt = f"{theories_for_gpt}\n\n{deep_block}"
            # 종합 해석
            content = generator.generate_comprehensive_interpretation(
                analysis=analysis,
                tone=req.tone,
                theories=theories_for_gpt,
                interpretation=interpretation,
                report_type=req.report_type or 'basic',
            )

            core_values = generator.generate_core_values(
                day_stem=req.day_stem,
                month_branch=month_branch,
                tone=req.tone,
                analysis=analysis,
            )

            print(f"✅ GPT 해석 생성 완료: {len(content)}자")

            # ✅ 캐시 저장
            try:
                save_report_cache(cache_key, "elements", content)
                save_report_cache(cache_key, "core_values", core_values)
                print(f"✅ 리포트 캐시 저장: {cache_key}")
            except Exception as ce:
                print(f"⚠️ 리포트 캐시 저장 실패: {ce}")

            return {
                "success": True,
                "cached": False,
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


async def _generate_deep_topic_report(
    request: Request,
    req: DeepReportRequest,
    topic_key: str,
    section_key: str,
    report_tone: str = "empathy",
) -> dict[str, Any]:
    logger.warning(f"[DEBUG] _generate_deep_topic_report called for topic: {topic_key} tone={report_tone}")
    _uid = get_user_id_from_request(request)
    if _uid is None:
        raise HTTPException(status_code=403, detail=json.dumps({"error": "report_locked"}, ensure_ascii=False))
    is_pro = False
    if not TEST_MODE:
        _mst = refresh_and_get_membership_status(_uid)
        is_pro = bool(_mst.get("is_member"))
        if not is_pro:
            from logic.payment_db import has_purchased_report as _has_pr
            if not _has_pr(_uid, topic_key) and get_report_credits(_uid) <= 0:
                raise HTTPException(status_code=403, detail=json.dumps({"error": "purchase_required", "price": 2900}, ensure_ascii=False))
            if (report_tone or "").strip().lower() == "realistic":
                if not _has_pr(_uid, f"{topic_key}_realistic"):
                    raise HTTPException(
                        status_code=403,
                        detail=json.dumps(
                            {"error": "purchase_required", "price": 990, "addon": "realistic"},
                            ensure_ascii=False,
                        ),
                    )

    if not client:
        return {"success": False, "error": "OPENAI_API_KEY not configured"}

    pillars_dict = {
        "year": req.year_pillar,
        "month": req.month_pillar,
        "day": req.day_pillar,
        "hour": req.hour_pillar,
    }

    from logic.saju_engine.core.analyzer import analyze_full_saju
    from logic.saju_engine.core.yongshin import calculate_yongshin
    from logic.saju_engine.core.saju_interpreter import (
        interpret_money_deep,
        interpret_love_deep,
        interpret_career_deep,
    )

    analysis = analyze_full_saju(req.day_stem, pillars_dict)
    saju_data_for_interp = _build_interp_saju_data(req, analysis)

    # 용신 계산 — 모든 심화 리포트에 사용
    try:
        saju_data_for_interp["yongshin"] = calculate_yongshin(analysis)
    except Exception as _ys_err:
        logger.warning(f"yongshin 계산 실패: {_ys_err}")

    # birth_year를 조기에 설정 — _get_current_daeun이 사용
    if req.birth_year:
        saju_data_for_interp["birth_year"] = req.birth_year

    # 대운 계산 — 생년월일이 있을 때만
    if req.birth_year and req.birth_month and req.birth_day:
        try:
            birth_payload = {
                "calendar_type": req.calendar_type or "solar",
                "year": req.birth_year,
                "month": req.birth_month,
                "day": req.birth_day,
                "hour": req.birth_hour,
                "minute": 0,
                "gender": req.gender or "M",
                "is_leap_month": False,
            }
            full_data = compute_full_saju(birth_payload, DB)
            daeun_list = full_data.get("daeun_list") or []
            if daeun_list:
                saju_data_for_interp["daeun_list"] = daeun_list
        except Exception as _daeun_err:
            logger.warning(f"daeun 계산 실패: {_daeun_err}")

    logger.warning(f"[DEBUG] saju_data keys: {list(saju_data_for_interp.keys())}")
    logger.warning(f"[DEBUG] day_stem: {saju_data_for_interp.get('day_stem')}")
    logger.warning(f"[DEBUG] basic_info: {saju_data_for_interp.get('basic_info')}")
    logger.warning(f"[DEBUG] ten_gods: {saju_data_for_interp.get('ten_gods')}")
    logger.warning(f"[DEBUG] pillars after fix: {saju_data_for_interp.get('pillars')}")
    logger.warning(f"[DEBUG] daeun_list after fix: {len(saju_data_for_interp.get('daeun_list', []))}")

    if topic_key == "money":
        deep_result = interpret_money_deep(saju_data_for_interp)
        logger.warning(f"[DEBUG money] ilgan: {deep_result.get('ilgan')}")
        logger.warning(f"[DEBUG money] jaeseong_element: {deep_result.get('jaeseong_element')}")
        logger.warning(f"[DEBUG money] jaeseong_absent: {deep_result.get('jaeseong_absent')}")
        logger.warning(f"[DEBUG money] jaeseong_positions: {deep_result.get('jaeseong_positions')}")
        logger.warning(f"[DEBUG money] siksang_saengjae: {deep_result.get('siksang_saengjae')}")
        logger.warning(f"[DEBUG money] bigeop_count: {deep_result.get('bigeop_count')}")
        logger.warning(f"[DEBUG money] strength: {deep_result.get('strength')} (score: {deep_result.get('strength_score')})")
        logger.warning(f"[DEBUG money] daeun_effect: {deep_result.get('daeun_effect')}")
        logger.warning(f"[DEBUG money] seun_effect: {deep_result.get('seun_effect')}")
        logger.warning(f"[DEBUG money] yongshin_elements: {deep_result.get('yongshin_elements')}")
        topic_label = "재물"
    elif topic_key == "love":
        deep_result = interpret_love_deep(saju_data_for_interp)
        ordered_keys = [
            "partner_type", "pattern", "current_flow", "seun_love", "timing",
            "ilji_ten_god", "ilji_state", "partner_positions", "partner_tonggeun",
            "yeonin_life_stages", "dohwa_count", "hongyeom_count", "daeun_ten_god",
            "daeun_branch_tg", "daeun_favorable", "seun_favorable",
            "yongshin_elements", "gishin_elements", "yongshin_love_tip",
            "yeonin_sibiun",
        ]
        topic_label = "연애"
    else:
        deep_result = interpret_career_deep(saju_data_for_interp)
        ordered_keys = [
            "work_style", "best_field", "org_vs_independent", "org_reason",
            "current_flow", "seun_career",
            "siksang_count", "siksang_root_count", "gwan_count", "gwan_root_count",
            "career_life_stages", "special_sinsal", "daeun_ten_god", "daeun_branch_tg",
            "daeun_favorable", "seun_favorable",
            "yongshin_elements", "gishin_elements", "yongshin_career_tip",
            "career_sibiun",
        ]
        topic_label = "직업"

    if not deep_result:
        return {"success": False, "error": "deep analysis unavailable"}

    _tone = (report_tone or "empathy").strip().lower()
    _ck_suffix = "realistic" if _tone == "realistic" else "deep"
    cache_key = req.cache_key or f"{topic_key}_{req.year_pillar}_{req.month_pillar}_{req.day_pillar}_{req.hour_pillar}_{_ck_suffix}"
    cached = get_report_cache(cache_key, section_key)
    if cached:
        return {
            "success": True,
            "cached": True,
            "report_type": topic_key,
            "report_tone": _tone,
            "content": cached,
            "analysis": deep_result,
        }

    if topic_key == "money":
        analysis_block = _build_money_analysis_block(deep_result)
    else:
        analysis_block = _build_non_empty_block(f"{topic_label} 심화 해석", deep_result, ordered_keys)
    logger.warning(f"[DEBUG GPT input]:\n{analysis_block[:1000]}")
    if not analysis_block:
        return {"success": False, "error": "empty analysis block"}

    system_prompt = _build_deep_report_system_prompt(topic_label, analysis_block, tone=_tone)
    user_prompt = (
        f"이 사람의 {topic_label} 리포트를 작성해줘. "
        "반드시 6개 섹션 전부 작성하고, 각 섹션 600자 이상으로 상세하게 써줘. 전체 4,000자 이상이어야 함."
    )
    if GEMINI_API_KEY:
        content = await _call_gemini_with_retry(system_prompt, user_prompt)
    else:
        content = _call_gpt_with_retry(system_prompt, user_prompt)

    section_count = sum(1 for m in ["1.", "2.", "3.", "4.", "5.", "6."] if m in content)
    logger.warning(f"[REPORT] Final content length: {len(content)} chars, sections: {section_count}")

    if content and len(content) >= 3000:
        save_report_cache(cache_key, section_key, content)
    elif content:
        logger.warning(f"[REPORT] Skipping cache — content too short ({len(content)} chars)")

    return {
        "success": True,
        "cached": False,
        "report_type": topic_key,
        "report_tone": _tone,
        "content": content,
        "analysis": deep_result,
    }


@app.post("/saju/report/money")
async def report_money(req: DeepReportRequest, request: Request):
    return await _generate_deep_topic_report(
        request=request,
        req=req,
        topic_key="money",
        section_key="report_money_deep",
        report_tone="empathy",
    )


@app.post("/saju/report/love")
async def report_love(req: DeepReportRequest, request: Request):
    return await _generate_deep_topic_report(
        request=request,
        req=req,
        topic_key="love",
        section_key="report_love_deep",
        report_tone="empathy",
    )


@app.post("/saju/report/career")
async def report_career(req: DeepReportRequest, request: Request):
    return await _generate_deep_topic_report(
        request=request,
        req=req,
        topic_key="career",
        section_key="report_career_deep",
        report_tone="empathy",
    )


@app.post("/saju/report/money-realistic")
async def report_money_realistic(req: DeepReportRequest, request: Request):
    return await _generate_deep_topic_report(
        request=request,
        req=req,
        topic_key="money",
        section_key="report_money_realistic",
        report_tone="realistic",
    )


@app.post("/saju/report/love-realistic")
async def report_love_realistic(req: DeepReportRequest, request: Request):
    return await _generate_deep_topic_report(
        request=request,
        req=req,
        topic_key="love",
        section_key="report_love_realistic",
        report_tone="realistic",
    )


@app.post("/saju/report/career-realistic")
async def report_career_realistic(req: DeepReportRequest, request: Request):
    return await _generate_deep_topic_report(
        request=request,
        req=req,
        topic_key="career",
        section_key="report_career_realistic",
        report_tone="realistic",
    )


PAYMENT_PRODUCT = {"orderName": "고민분석", "amount": 3900}

SEED_PRODUCTS = {
    "seed_1": {"orderName": "씨앗 1개", "amount": 770},
    "seed_5": {"orderName": "씨앗 5개+보너스 1개", "amount": 3850},
    "seed_10": {"orderName": "씨앗 10개+보너스 2개", "amount": 7700},
}

# ── KakaoPay ──────────────────────────────────────────────────────────────

KAKAO_PAY_API = "https://open-api.kakaopay.com/online/v1/payment"


@app.get("/api/payment/status")
async def payment_status_api(request: Request):
    """현재 로그인 유저의 결제 상태 반환. 비로그인 시 기본값."""
    user_id = get_user_id_from_request(request)
    if not user_id:
        return {
            "is_pro": False, "pro_expires_at": None,
            "report_credits": 0, "daily_chat_count": 0, "chat_limit": 3,
        }
    from logic.daily_chat_db import get_daily_chat_count
    status = refresh_and_get_membership_status(user_id)
    credits = get_report_credits(user_id)
    daily_count = get_daily_chat_count(str(user_id))
    is_pro = bool(status.get("is_member"))
    return {
        "is_pro": is_pro,
        "pro_expires_at": status.get("membership_expires_at"),
        "report_credits": credits,
        "daily_chat_count": daily_count,
        "chat_limit": 999 if is_pro else 5,  # Pro: 무제한(999), 일반: 5회
    }


@app.get("/api/payment/report-access/{report_type}")
async def report_access_check(report_type: str, request: Request):
    """리포트 접근 권한 확인 — Pro·구매·분析권 여부에 따라 has_access 반환."""
    _price_map = {
        "basic": 990, "deep": 4900,
        "money": 2900, "love": 2900, "career": 2900, "couple": 2900,
    }
    user_id = get_user_id_from_request(request)

    def _addon_fields(uid: Optional[int], is_member: bool) -> dict[str, Any]:
        out: dict[str, Any] = {"direct_addon_price": 990, "has_direct_addon": False}
        if report_type not in ("money", "love", "career"):
            return out
        if TEST_MODE:
            out["has_direct_addon"] = True
            return out
        if not uid:
            return out
        from logic.payment_db import has_purchased_report as _hpr
        if is_member or _hpr(uid, f"{report_type}_realistic"):
            out["has_direct_addon"] = True
        return out

    if TEST_MODE:
        base = {"has_access": True, "reason": "test_mode"}
        base.update(_addon_fields(user_id, True))
        return base

    if not user_id:
        base = {"has_access": False, "reason": "not_logged_in", "price": _price_map.get(report_type, 2900)}
        base.update(_addon_fields(None, False))
        return base
    mst = refresh_and_get_membership_status(user_id)
    is_member = bool(mst.get("is_member"))
    if is_member:
        base = {"has_access": True, "reason": "pro"}
        base.update(_addon_fields(user_id, True))
        return base
    from logic.payment_db import has_purchased_report
    if has_purchased_report(user_id, report_type):
        base = {"has_access": True, "reason": "purchased"}
        base.update(_addon_fields(user_id, False))
        return base
    if report_type in ("basic", "analysis_ticket") and get_report_credits(user_id) > 0:
        base = {"has_access": True, "reason": "credits"}
        base.update(_addon_fields(user_id, False))
        return base
    base = {"has_access": False, "reason": "purchase_required", "price": _price_map.get(report_type, 2900)}
    base.update(_addon_fields(user_id, False))
    return base


_REPORT_PURCHASE_LABELS: dict[str, str] = {
    "deep": "심화 리포트",
    "money": "재물운 리포트",
    "love": "연애운 리포트",
    "career": "직업운 리포트",
    "couple": "궁합 리포트",
    "money_realistic": "재물운 · 더 직설적인 분석",
    "love_realistic": "연애운 · 더 직설적인 분석",
    "career_realistic": "직업운 · 더 직설적인 분석",
}


@app.get("/api/payment/my-purchased-reports")
async def my_purchased_reports_list(request: Request):
    """로그인 유저의 카카오페이 리포트 구매 이력 (표시용 사주 메타 포함)."""
    user_id = get_user_id_from_request(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    try:
        from logic.payment_db import get_purchased_reports
        from logic.saju_db import get_saju_by_id

        rows = get_purchased_reports(user_id)
        items: list[dict[str, Any]] = []
        for r in rows:
            rt = r.get("report_type") or ""
            saju_out: Optional[dict[str, Any]] = None
            sid = r.get("saju_id")
            if sid is not None:
                sj = get_saju_by_id(int(sid), int(user_id))
                if sj:
                    saju_out = {
                        "id": sj["id"],
                        "name": sj.get("name") or "",
                        "birthdate": sj.get("birthdate") or "",
                        "birth_time": sj.get("birth_time"),
                        "calendar_type": sj.get("calendar_type") or "",
                        "gender": sj.get("gender") or "",
                    }
            items.append(
                {
                    "id": r.get("id"),
                    "report_type": rt,
                    "report_label": _REPORT_PURCHASE_LABELS.get(rt, rt),
                    "amount": r.get("amount"),
                    "purchased_at": r.get("purchased_at"),
                    "saju": saju_out,
                }
            )
        return {"items": items}
    except Exception as e:
        print(f"⚠️ /api/payment/my-purchased-reports 오류: {e}")
        return {"items": []}


@app.post("/api/chat/consume")
async def chat_consume_api(request: Request):
    """로그인 유저 채팅 1회 차감 — Pro면 무제한, 아니면 하루 3회."""
    user_id = get_user_id_from_request(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    return {"ok": True, "is_pro": True}


@app.post("/api/payment/kakao/ready")
async def kakao_pay_ready(request: Request):
    """KakaoPay 결제 준비 — tid 및 redirect URL 반환."""
    user_id = get_user_id_from_request(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    try:
        body = await request.json()
    except Exception:
        body = {}
    _ORDER_PRICE_MAP = {
        "pro_monthly":     ("한양사주 Pro (월간)", 4900),
        "basic":           ("분석권 1개", 990),
        "analysis_ticket": ("분석권 1개", 990),
        "deep":            ("심화 리포트", 4900),
        "money":           ("재물운 리포트", 2900),
        "love":            ("연애운 리포트", 2900),
        "career":          ("직업운 리포트", 2900),
        "couple":          ("궁합 리포트", 2900),
        "money_realistic": ("재물운 직설 분석", 990),
        "love_realistic":  ("연애운 직설 분석", 990),
        "career_realistic": ("직업운 직설 분석", 990),
    }
    order_type = body.get("order_type", "basic")
    if order_type not in _ORDER_PRICE_MAP:
        order_type = "basic"
    item_name, amount = _ORDER_PRICE_MAP[order_type]
    cid = os.getenv("KAKAO_PAY_CID", "TC0ONETIME")
    secret_key = os.getenv("KAKAO_PAY_SECRET_KEY", "")
    frontend_url = os.getenv("FRONTEND_URL", "https://hsaju.com")
    import uuid as _uuid
    order_id = f"kp_{_uuid.uuid4().hex[:16]}"
    payload = {
        "cid": cid,
        "partner_order_id": order_id,
        "partner_user_id": str(user_id),
        "item_name": item_name,
        "quantity": 1,
        "total_amount": amount,
        "vat_amount": 0,
        "tax_free_amount": amount,
        "approval_url": f"{frontend_url}/payment/success?order_id={order_id}&order_type={order_type}",
        "fail_url": f"{frontend_url}/payment/fail",
        "cancel_url": f"{frontend_url}/payment/cancel",
    }
    import httpx as _httpx
    
    try:
        async with _httpx.AsyncClient() as hc:
            resp = await hc.post(
                f"{KAKAO_PAY_API}/ready",
                headers={"Authorization": f"SECRET_KEY {secret_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=15,
            )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"KakaoPay 연결 실패: {e}")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"KakaoPay ready 실패: {resp.text}")
    data = resp.json()
    tid = data.get("tid", "")
    from logic.payment_db import normalize_saju_id_from_client, save_pending_payment

    pending_saju_id = normalize_saju_id_from_client(body.get("saju_id"))
    save_pending_payment(
        order_id=order_id,
        user_id=user_id,
        order_type=order_type,
        tid=tid,
        saju_id=pending_saju_id,
    )
    return {
        "tid": tid,
        "order_id": order_id,
        "next_redirect_mobile_url": data.get("next_redirect_mobile_url"),
        "next_redirect_pc_url": data.get("next_redirect_pc_url"),
    }


@app.post("/api/payment/kakao/approve")
async def kakao_pay_approve(request: Request):
    """KakaoPay 결제 승인 — 성공 시 멤버십 or 분析권 지급."""
    user_id = get_user_id_from_request(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    try:
        body = await request.json()
    except Exception:
        body = {}
    pg_token = (body.get("pg_token") or "").strip()
    order_id = (body.get("order_id") or "").strip()
    if not pg_token or not order_id:
        raise HTTPException(status_code=400, detail="pg_token, order_id 필수")
    from logic.payment_db import get_pending_payment, save_payment
    pending = get_pending_payment(order_id)
    if not pending:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")
    if int(pending["user_id"]) != int(user_id):
        raise HTTPException(status_code=403, detail="주문 정보가 일치하지 않습니다.")
    tid = pending["tid"]
    order_type = pending["order_type"]
    purchase_saju_id = pending.get("saju_id")
    cid = os.getenv("KAKAO_PAY_CID", "TC0ONETIME")
    secret_key = os.getenv("KAKAO_PAY_SECRET_KEY", "")
    payload = {
        "cid": cid, "tid": tid,
        "partner_order_id": order_id, "partner_user_id": str(user_id),
        "pg_token": pg_token,
    }
    import httpx as _httpx
    try:
        async with _httpx.AsyncClient() as hc:
            resp = await hc.post(
                f"{KAKAO_PAY_API}/approve",
                headers={"Authorization": f"SECRET_KEY {secret_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=15,
            )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"KakaoPay 연결 실패: {e}")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"KakaoPay approve 실패: {resp.text}")
    # 혜택 지급
    _SINGLE_REPORT_PRICES = {
        "deep": 4900,
        "money": 2900,
        "love": 2900,
        "career": 2900,
        "couple": 2900,
        "money_realistic": 990,
        "love_realistic": 990,
        "career_realistic": 990,
    }
    if order_type == "pro_monthly":
        activate_membership(user_id, 1)
        redirect_url = "/home?payment=pro_success"
    elif order_type in ("basic", "analysis_ticket"):
        add_report_credits(user_id, 1)
        redirect_url = "/home?payment=ticket_success"
    elif order_type in _SINGLE_REPORT_PRICES:
        from logic.payment_db import save_purchased_report

        save_purchased_report(
            user_id,
            order_type,
            _SINGLE_REPORT_PRICES[order_type],
            tid,
            saju_id=purchase_saju_id if isinstance(purchase_saju_id, int) else None,
        )
        if order_type == "money_realistic":
            redirect_url = "/report/money"
        elif order_type == "love_realistic":
            redirect_url = "/report/love"
        elif order_type == "career_realistic":
            redirect_url = "/report/career"
        else:
            redirect_url = f"/report/{order_type}"
    else:
        add_report_credits(user_id, 1)
        redirect_url = "/home?payment=ticket_success"
    save_payment(user_id=str(user_id), payment_id=tid, order_id=order_id, status="paid")
    return {"success": True, "order_type": order_type, "redirect_url": redirect_url}


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


@app.post("/api/payment/inicis/ready")
async def inicis_pay_ready(request: Request):
    """KG이니시스 바로오픈 결제 준비."""
    user_id = get_user_id_from_request(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    
    try:
        body = await request.json()
    except Exception:
        body = {}
    
    _ORDER_PRICE_MAP = {
        "pro_monthly":     ("한양사주 Pro (월간)", 4900),
        "basic":           ("분석권 1개", 990),
        "analysis_ticket": ("분석권 1개", 990),
        "deep":            ("심화 리포트", 4900),
        "money":           ("재물운 리포트", 2900),
        "love":            ("연애운 리포트", 2900),
        "career":          ("직업운 리포트", 2900),
        "couple":          ("궁합 리포트", 2900),
        "money_realistic": ("재물운 직설 분석", 990),
        "love_realistic":  ("연애운 직설 분석", 990),
        "career_realistic": ("직업운 직설 분석", 990),
    }
    
    order_type = body.get("order_type", "basic")
    if order_type not in _ORDER_PRICE_MAP:
        order_type = "basic"
    
    item_name, amount = _ORDER_PRICE_MAP[order_type]
    frontend_url = os.getenv("FRONTEND_URL", "https://hsaju.com")
    
    import uuid as _uuid
    order_id = f"in_{_uuid.uuid4().hex[:16]}"
    
    # KG이니시스 결제 정보
    from logic.payment_db import normalize_saju_id_from_client, save_pending_payment
    
    pending_saju_id = normalize_saju_id_from_client(body.get("saju_id"))
    save_pending_payment(
        order_id=order_id,
        user_id=user_id,
        order_type=order_type,
        tid="",  # 이니시스는 tid가 필요 없음
        saju_id=pending_saju_id,
    )
    
    return {
        "order_id": order_id,
        "item_name": item_name,
        "amount": amount,
        "mid": "MOI5470692",  # KG이니시스 상점 ID
        "currency": "KRW",
        "return_url": f"{frontend_url}/payment/inicis/success",
        "close_url": f"{frontend_url}/payment/close",
    }


@app.post("/api/payment/portone/ready")
async def portone_pay_ready(request: Request):
    """포트원 결제 준비 — 간단한 테스트용."""
    user_id = get_user_id_from_request(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    
    try:
        body = await request.json()
    except Exception:
        body = {}
    
    _ORDER_PRICE_MAP = {
        "pro_monthly":     ("한양사주 Pro (월간)", 4900),
        "basic":           ("분석권 1개", 990),
        "analysis_ticket": ("분석권 1개", 990),
        "deep":            ("심화 리포트", 4900),
        "money":           ("재물운 리포트", 2900),
        "love":            ("연애운 리포트", 2900),
        "career":          ("직업운 리포트", 2900),
        "couple":          ("궁합 리포트", 2900),
        "money_realistic": ("재물운 직설 분석", 990),
        "love_realistic":  ("연애운 직설 분석", 990),
        "career_realistic": ("직업운 직설 분석", 990),
    }
    
    order_type = body.get("order_type", "basic")
    if order_type not in _ORDER_PRICE_MAP:
        order_type = "basic"
    
    item_name, amount = _ORDER_PRICE_MAP[order_type]
    frontend_url = os.getenv("FRONTEND_URL", "https://hsaju.com")
    
    import uuid as _uuid
    order_id = f"po_{_uuid.uuid4().hex[:16]}"
    
    # PortOne은 클라이언트에서 직접 결제를 처리하므로 간단한 정보만 반환
    from logic.payment_db import normalize_saju_id_from_client, save_pending_payment
    
    pending_saju_id = normalize_saju_id_from_client(body.get("saju_id"))
    save_pending_payment(
        order_id=order_id,
        user_id=user_id,
        order_type=order_type,
        tid="",  # PortOne은 tid가 필요 없음
        saju_id=pending_saju_id,
    )
    
    return {
        "order_id": order_id,
        "item_name": item_name,
        "amount": amount,
        "store_id": "store-1234",  # 포트원 상점 ID (테스트용)
        "channel_key": "channel-key-1234",  # 포트원 채널 키 (테스트용)
        "payment_method": "card",  # 카드 결제
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


@app.delete("/api/saju/{saju_id}")
def delete_saju(saju_id: int, request: Request):
    """저장된 사주 1건 삭제 (본인 소유만)."""
    user_id = get_user_id_from_request(request)
    if user_id is None:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    deleted = delete_saju_for_user(saju_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="해당 사주를 찾을 수 없습니다.")
    return {"success": True}


@app.post("/saju/summary-gpt")
async def summary_gpt(req: SummaryGPTRequest, request: Request):
    """종합 요약 GPT — Pro 또는 분析권 1개 차감 후 허용."""
    # 접근 제어: Pro 또는 분析권 보유 확인 + 차감
    _uid = get_user_id_from_request(request)
    if _uid is None:
        raise HTTPException(status_code=403, detail=json.dumps({"error": "report_locked"}, ensure_ascii=False))
    _mst = refresh_and_get_membership_status(_uid)
    if not _mst.get("is_member"):
        _ok, _remaining = deduct_report_credit(_uid)
        if not _ok:
            raise HTTPException(status_code=403, detail=json.dumps({"error": "report_locked"}, ensure_ascii=False))

    try:
        if not client:
            print("⚠️ OPENAI_API_KEY 없음 — summary-gpt 스킵")
            return {"summary": None, "error": "OPENAI_API_KEY not configured"}

        # ✅ 캐시 확인
        cache_key = req.cache_key
        if cache_key:
            cached = get_report_cache(cache_key, "summary")
            if cached:
                print(f"✅ 요약 캐시 히트: {cache_key}")
                return {"summary": cached, "cached": True}

        system_prompt = req.system
        hc = req.harmony_clash

        # 합충 섹션 추가
        if hc and isinstance(hc, dict):
            try:
                from logic.gpt_generator import GPTInterpretationGenerator
                gen = GPTInterpretationGenerator()
                hapcheung_section = gen._build_hapcheung_prompt_section({"harmony_clash": hc})
                if hapcheung_section:
                    system_prompt = f"{system_prompt}\n\n{hapcheung_section}"
            except Exception as e:
                print(f"⚠️ summary-gpt 합충 섹션 생성 실패: {e}")

        # 규칙 기반 해석 결과 주입
        try:
            from logic.saju_engine.core.saju_interpreter import interpret_all
            saju_data: dict[str, Any] = {}
            if hc:
                saju_data["harmony_clash"] = hc
            for field in ("year_pillar", "month_pillar", "day_pillar", "hour_pillar",
                          "ten_gods", "strength", "sinsal", "gender"):
                val = getattr(req, field, None)
                if val is not None:
                    saju_data[field] = val
            if saju_data:
                interp = interpret_all(saju_data)
                s = interp.get("summary_for_gpt", {})
                def _fmt(v: Any) -> str:
                    if isinstance(v, list):
                        return " / ".join(str(x) for x in v if x)
                    return str(v) if v else ""
                interp_block = (
                    "\n[규칙 기반 사주 해석 결과 — 반드시 반영]\n"
                    f"성격: {_fmt(s.get('personality_points'))}\n"
                    f"재물: {_fmt(s.get('money_points'))}\n"
                    f"연애: {_fmt(s.get('love_points'))}\n"
                    f"직업: {_fmt(s.get('career_points'))}\n"
                    f"현재시기: {_fmt(s.get('current_period_points', s.get('period_points')))}\n"
                    f"통근투출: {_fmt(s.get('tonggeun_points'))}\n"
                    f"기둥별구조: {_fmt(s.get('geunmyo_points'))}\n"
                    f"형파해원진: {_fmt(s.get('hyeong_points'))}\n"
                    f"올해세운: {_fmt(s.get('seun_points'))}\n"
                )
                system_prompt = interp_block + "\n" + system_prompt
        except Exception as e:
            print(f"⚠️ summary-gpt interpreter 실패: {e}")

        system_prompt += (
            "\n\n[작성 원칙]\n"
            "읽다가 '나 얘기인데?' 반응이 나와야 성공.\n"
            "사주 용어 없이 현실 언어로.\n"
            "한 줄 + 괄호 힌트 방식 사용.\n\n"
            "[분량] 전체 950~1,050자."
        )

        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.user},
            ],
            max_tokens=1000,
            temperature=0.2,
        )
        content = (resp.choices[0].message.content or "").strip()

        # ✅ 캐시 저장
        if cache_key and content:
            try:
                save_report_cache(cache_key, "summary", content)
                print(f"✅ 요약 캐시 저장: {cache_key}")
            except Exception as ce:
                print(f"⚠️ 요약 캐시 저장 실패: {ce}")

        return {"summary": content, "cached": False}
    except Exception as e:
        print(f"❌ summary-gpt 오류: {e}")
        import traceback
        traceback.print_exc()
        return {"summary": None, "error": str(e)}


@app.get("/saju/report-cache")
async def get_cached_report(cache_key: str, section_key: str):
    """캐시된 리포트 섹션 조회"""
    try:
        content = get_report_cache(cache_key, section_key)
        if content:
            return {"found": True, "content": content}
        return {"found": False, "content": None}
    except Exception as e:
        print(f"❌ report-cache 조회 오류: {e}")
        return {"found": False, "content": None, "error": str(e)}


@app.post("/saju/dev/clear-report-cache")
async def dev_clear_report_cache():
    """
    로컬 개발용: report_cache 테이블 전체 비우기.
    TEST_MODE=true 일 때만 동작. (프론트가 같은 cache_key로 재요청하면 새로 생성됨)
    """
    if not TEST_MODE:
        raise HTTPException(status_code=404, detail="not found")
    try:
        deleted = clear_all_report_cache()
        logger.warning(f"[dev] report_cache cleared, rows affected: {deleted}")
        return {"ok": True, "deleted_rows": deleted}
    except Exception as e:
        logger.warning(f"[dev] clear_report_cache failed: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


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


# =====================================================
# /saju/analyze-v2  — 규칙엔진 + GPT 표현변환 정밀분석
# =====================================================

class AnalyzeV2Request(BaseModel):
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str
    gender: Optional[str] = None
    birthdate: Optional[str] = None
    daeun_list: Optional[list] = None
    daeun_direction: Optional[str] = None
    ten_gods: Optional[dict] = None
    strength: Optional[Any] = None
    harmony_clash: Optional[dict] = None
    sinsal: Optional[dict] = None
    tone: str = "empathy"
    cache_key: Optional[str] = None


@app.post("/saju/analyze-v2")
async def analyze_v2(req: AnalyzeV2Request, request: Request):
    """
    v2 정밀 분석
    1) interpret_all()  — 규칙 엔진 (환각 없음)
    2) GPT             — 표현 변환만 담당
    """
    _uid = get_user_id_from_request(request)
    if _uid is None:
        raise HTTPException(
            status_code=401,
            detail=json.dumps({"error": "login_required"}, ensure_ascii=False),
        )

    if not client:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")

    # ── saju_data 조립 ──────────────────────────────────
    saju_data: dict[str, Any] = {
        "year_pillar":     req.year_pillar,
        "month_pillar":    req.month_pillar,
        "day_pillar":      req.day_pillar,
        "hour_pillar":     req.hour_pillar,
        "gender":          req.gender or "",
        "ten_gods":        req.ten_gods or {},
        "strength": (
            req.strength.get("strength")
            if isinstance(req.strength, dict)
            else str(req.strength or "")
        ) or "알 수 없음",
        "harmony_clash":   req.harmony_clash or {},
        "sinsal":          req.sinsal or {},
        "daeun_list":      req.daeun_list or [],
        "daeun_direction": req.daeun_direction or "순행",
    }
    if req.birthdate:
        saju_data["birthdate"] = req.birthdate

    # ── 1) 규칙 엔진 ────────────────────────────────────
    try:
        from logic.saju_engine.core.saju_interpreter import interpret_all
        interpretation = interpret_all(saju_data)
    except Exception as e:
        print(f"❌ interpret_all 실패: {e}")
        raise HTTPException(status_code=500, detail=f"규칙 엔진 오류: {e}")

    # ── 2) analyzer (GPT generator 입력용) ──────────────
    try:
        from logic.saju_engine.core.analyzer import analyze_full_saju
        day_stem = req.day_pillar[0] if req.day_pillar else ""
        pillars = {
            "year":  req.year_pillar,
            "month": req.month_pillar,
            "day":   req.day_pillar,
            "hour":  req.hour_pillar,
        }
        analysis = analyze_full_saju(day_stem, pillars)
        if req.harmony_clash:
            analysis["harmony_clash"] = req.harmony_clash
    except Exception as e:
        print(f"❌ analyze_full_saju 실패: {e}")
        raise HTTPException(status_code=500, detail=f"분석 엔진 오류: {e}")

    # ── 3) 이론 검색 ────────────────────────────────────
    theories = ""
    try:
        retriever = get_theory_retriever()
        theories = retriever.get_relevant_theories(analysis) or ""
    except Exception as e:
        print(f"⚠️ 이론 검색 실패: {e}")

    # ── 4) 캐시 확인 ────────────────────────────────────
    cache_key = (
        req.cache_key
        or f"v2_{req.year_pillar}_{req.month_pillar}_{req.day_pillar}_{req.hour_pillar}_{req.tone}"
    )
    cached_main = get_report_cache(cache_key, "v2_comprehensive")
    cached_cv   = get_report_cache(cache_key, "v2_core_values")
    cached_sections = get_report_cache(cache_key, "v2_sections")
    if cached_main and cached_cv:
        parsed_sections: dict[str, str] = {}
        if cached_sections:
            try:
                obj = json.loads(cached_sections)
                if isinstance(obj, dict):
                    parsed_sections = {k: str(v) for k, v in obj.items() if isinstance(v, str)}
            except Exception:
                parsed_sections = {}
        print(f"✅ v2 캐시 히트: {cache_key}")
        return {
            "success": True,
            "cached": True,
            "comprehensive": cached_main,
            "core_values": cached_cv,
            "section_personality": parsed_sections.get("section_personality", ""),
            "section_strength": parsed_sections.get("section_strength", ""),
            "section_problem": parsed_sections.get("section_problem", ""),
            "section_money": parsed_sections.get("section_money", ""),
            "section_career": parsed_sections.get("section_career", ""),
            "section_relationship": parsed_sections.get("section_relationship", ""),
            "section_current": parsed_sections.get("section_current", ""),
            "rule_summary": interpretation.get("summary_for_gpt", {}),
        }

    # ── 5) GPT 표현 변환 ────────────────────────────────
    try:
        from logic.gpt_generator import GPTInterpretationGenerator
        generator = GPTInterpretationGenerator()

        # 종합 해석 (규칙엔진 결과를 시스템 프롬프트에 주입)
        comprehensive = generator.generate_comprehensive_interpretation(
            analysis=analysis,
            tone=req.tone,
            theories=theories,
            interpretation=interpretation,   # ← 규칙엔진 결과 전달
        )

        # 월지 기반 가치관
        month_branch = req.month_pillar[1] if len(req.month_pillar) >= 2 else ""
        core_values = generator.generate_core_values(
            day_stem=day_stem,
            month_branch=month_branch,
            tone=req.tone,
            analysis=analysis,
        )

        # 섹션형 응답 생성(JSON)
        summary_for_gpt = interpretation.get("summary_for_gpt", {}) if isinstance(interpretation, dict) else {}
        section_prompt = f"""
아래 규칙 엔진 결과를 기반으로, 반드시 JSON 객체 하나만 반환하세요.
키는 정확히 다음 7개만 사용:
section_personality, section_strength, section_problem, section_money, section_career, section_relationship, section_current

[규칙]
- 사주 전문 용어 직접 사용 금지
- 일상적이고 공감되는 표현
- 짧은 문장 위주 (모바일 가독성)
- 각 항목은 1~3개의 짧은 단락
- 데이터에 없는 내용 추측 금지

[데이터]
성격: {summary_for_gpt.get("personality_points", [])}
재물: {summary_for_gpt.get("money_points", [])}
연애: {summary_for_gpt.get("love_points", [])}
직업: {summary_for_gpt.get("career_points", [])}
현재시기: {summary_for_gpt.get("period_points", [])}
신강약: {summary_for_gpt.get("strength", "")}
종합참고: {comprehensive}
"""

        sections = {
            "section_personality": "",
            "section_strength": "",
            "section_problem": "",
            "section_money": "",
            "section_career": "",
            "section_relationship": "",
            "section_current": "",
        }
        try:
            sec_resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "당신은 한국어 리포트 편집기입니다. JSON 객체만 출력하세요."},
                    {"role": "user", "content": section_prompt},
                ],
                temperature=0.3,
                max_tokens=2200,
                response_format={"type": "json_object"},
            )
            sec_raw = (sec_resp.choices[0].message.content or "").strip()
            sec_obj = json.loads(sec_raw) if sec_raw else {}
            if isinstance(sec_obj, dict):
                for k in sections.keys():
                    v = sec_obj.get(k, "")
                    sections[k] = str(v).strip() if v is not None else ""
        except Exception as se:
            print(f"⚠️ v2 섹션 생성 실패: {se}")
    except Exception as e:
        print(f"❌ GPT 생성 실패: {e}")
        raise HTTPException(status_code=502, detail=f"GPT 생성 오류: {e}")

    # ── 6) 캐시 저장 ────────────────────────────────────
    try:
        save_report_cache(cache_key, "v2_comprehensive", comprehensive)
        save_report_cache(cache_key, "v2_core_values",   core_values)
        save_report_cache(cache_key, "v2_sections", json.dumps(sections, ensure_ascii=False))
        print(f"✅ v2 캐시 저장: {cache_key}")
    except Exception as e:
        print(f"⚠️ v2 캐시 저장 실패: {e}")

    rule_summary_data = interpretation.get("summary_for_gpt", {})
    print(f"[DEBUG] visual_data keys: {list(rule_summary_data.get('visual_data', {}).keys())}")

    return {
        "success": True,
        "cached": False,
        "comprehensive": comprehensive,
        "core_values": core_values,
        "section_personality": sections.get("section_personality", ""),
        "section_strength": sections.get("section_strength", ""),
        "section_problem": sections.get("section_problem", ""),
        "section_money": sections.get("section_money", ""),
        "section_career": sections.get("section_career", ""),
        "section_relationship": sections.get("section_relationship", ""),
        "section_current": sections.get("section_current", ""),
        "rule_summary": rule_summary_data,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
