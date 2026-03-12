# app/auth_kakao.py
from fastapi.responses import RedirectResponse
from fastapi import APIRouter, Request
import requests
import secrets
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter()

# 카카오 로그인용 env (전부 있어야 정상 동작)
KAKAO_REST_KEY = os.getenv("KAKAO_REST_KEY", "").strip()
# Redirect URI = 카카오가 code를 보내줄 주소 → 반드시 백엔드 콜백 URL (예: https://xxx.onrender.com/auth/kakao/callback)
KAKAO_REDIRECT_URI = os.getenv("KAKAO_REDIRECT_URI", "").strip()
FRONTEND_URL = (os.getenv("FRONTEND_URL", "https://hsaju.com") or "https://hsaju.com").strip().rstrip("/")

if not KAKAO_REST_KEY:
    print("⚠️ KAKAO_REST_KEY가 .env에 없습니다. 카카오 로그인은 비활성됩니다.")
else:
    print(f"✅ KAKAO_REST_KEY 로드됨: {KAKAO_REST_KEY[:10]}...")
if not KAKAO_REDIRECT_URI:
    print("⚠️ KAKAO_REDIRECT_URI가 .env에 없습니다. 카카오 개발자 콘솔에 등록한 백엔드 콜백 URL을 넣어주세요.")
else:
    print(f"✅ KAKAO_REDIRECT_URI: {KAKAO_REDIRECT_URI}")
print(f"✅ FRONTEND_URL: {FRONTEND_URL}")


def exchange_token(code: str) -> dict:
    url = "https://kauth.kakao.com/oauth/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": KAKAO_REST_KEY,
        "redirect_uri": KAKAO_REDIRECT_URI,
        "code": code,
    }
    r = requests.post(url, data=data, timeout=10)
    r.raise_for_status()
    return r.json()


def kakao_me(access_token: str) -> dict:
    url = "https://kapi.kakao.com/v2/user/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    r = requests.get(url, headers=headers, timeout=10)
    r.raise_for_status()
    return r.json()


@router.get("/auth/kakao/login")
def kakao_login():
    if not KAKAO_REST_KEY or not KAKAO_REDIRECT_URI:
        return RedirectResponse(
            f"{FRONTEND_URL}/login?error=kakao_not_configured",
            status_code=302,
        )
    state = secrets.token_urlsafe(16)
    redirect_url = (
        "https://kauth.kakao.com/oauth/authorize"
        f"?client_id={KAKAO_REST_KEY}"
        f"&redirect_uri={KAKAO_REDIRECT_URI}"
        f"&response_type=code"
        f"&state={state}"
    )
    resp = RedirectResponse(redirect_url, status_code=302)
    resp.set_cookie(
        "kakao_oauth_state",
        state,
        httponly=True,
        secure=(KAKAO_REDIRECT_URI.startswith("https://")),
        samesite="lax",
        max_age=300,
    )
    return resp


@router.get("/auth/kakao/callback")
def kakao_callback(request: Request):
    if not KAKAO_REST_KEY or not KAKAO_REDIRECT_URI:
        return RedirectResponse(
            f"{FRONTEND_URL}/login?error=kakao_not_configured",
            status_code=302,
        )
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    error = request.query_params.get("error")

    if error:
        return RedirectResponse(f"{FRONTEND_URL}/login?error={error}", status_code=302)

    if not code:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=missing_code", status_code=302)

    saved_state = request.cookies.get("kakao_oauth_state")
    if not saved_state or saved_state != state:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=bad_state", status_code=302)

    try:
        token = exchange_token(code)
    except Exception as e:
        print(f"⚠️ 카카오 토큰 교환 실패: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_access_token", status_code=302)
    access_token = token.get("access_token")
    if not access_token:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_access_token", status_code=302)

    try:
        me = kakao_me(access_token)
    except Exception as e:
        print(f"⚠️ 카카오 사용자 정보 조회 실패: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_access_token", status_code=302)
    kakao_id = me.get("id")
    if not kakao_id:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_access_token", status_code=302)

    # 3) 로그인 성공 → 프론트 로그인 성공 페이지로 리다이렉트 + 쿠키
    resp = RedirectResponse(f"{FRONTEND_URL}/login/success", status_code=302)
    resp.set_cookie(
        "hsaju_session",
        f"kakao:{kakao_id}",
        httponly=True,
        secure=True,
        samesite="none",  # 프론트(hsaju.com) / 백엔드(onrender.com) 도메인 다르므로 none
        max_age=60 * 60 * 24 * 7,
    )
    return resp
