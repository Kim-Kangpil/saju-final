from fastapi.responses import RedirectResponse
from fastapi import APIRouter, Request
import requests
import secrets
import os
from dotenv import load_dotenv
from pathlib import Path

from logic.user_db import get_or_create_user

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter()

GOOGLE_CLIENT_ID = (os.getenv("GOOGLE_CLIENT_ID") or "").strip()
GOOGLE_CLIENT_SECRET = (os.getenv("GOOGLE_CLIENT_SECRET") or "").strip()
# Redirect URI = 구글이 code를 보내줄 주소 → 반드시 백엔드 콜백 URL (예: https://xxx.onrender.com/auth/google/callback)
GOOGLE_REDIRECT_URI = (os.getenv("GOOGLE_REDIRECT_URI") or "").strip()
FRONTEND_URL = (os.getenv("FRONTEND_URL", "https://hsaju.com") or "https://hsaju.com").strip().rstrip("/")

if not GOOGLE_CLIENT_ID:
    print("⚠️ GOOGLE_CLIENT_ID가 .env에 없습니다. 구글 로그인은 비활성됩니다.")
else:
    print(f"✅ GOOGLE_CLIENT_ID 로드됨: {GOOGLE_CLIENT_ID[:10]}...")
if not GOOGLE_CLIENT_SECRET:
    print("⚠️ GOOGLE_CLIENT_SECRET가 .env에 없습니다. 구글 토큰 교환이 실패할 수 있습니다.")
if not GOOGLE_REDIRECT_URI:
    print("⚠️ GOOGLE_REDIRECT_URI가 .env에 없습니다. 구글 콘솔에 등록한 백엔드 콜백 URL을 넣어주세요.")
else:
    print(f"✅ GOOGLE_REDIRECT_URI: {GOOGLE_REDIRECT_URI}")
print(f"✅ FRONTEND_URL: {FRONTEND_URL}")


def google_exchange_token(code: str) -> dict:
    url = "https://oauth2.googleapis.com/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
    }
    r = requests.post(url, data=data, timeout=10)
    r.raise_for_status()
    return r.json()


def google_userinfo(access_token: str) -> dict:
    url = "https://openidconnect.googleapis.com/v1/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    r = requests.get(url, headers=headers, timeout=10)
    r.raise_for_status()
    return r.json()


@router.get("/auth/google/login")
def google_login():
    if not GOOGLE_CLIENT_ID or not GOOGLE_REDIRECT_URI:
        return RedirectResponse(
            f"{FRONTEND_URL}/login?error=google_not_configured",
            status_code=302,
        )
    state = secrets.token_urlsafe(16)
    # scope: email + profile (openid 포함)
    scope = "openid email profile"
    redirect_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scope}"
        f"&state={state}"
        f"&access_type=offline"
        f"&prompt=consent"
        "&hl=ko"
    )
    resp = RedirectResponse(redirect_url, status_code=302)
    resp.set_cookie(
        "google_oauth_state",
        state,
        httponly=True,
        secure=(GOOGLE_REDIRECT_URI.startswith("https://")),
        samesite="lax",
        max_age=300,
    )
    return resp


@router.get("/auth/google/callback")
def google_callback(request: Request):
    if not GOOGLE_CLIENT_ID or not GOOGLE_REDIRECT_URI:
        return RedirectResponse(
            f"{FRONTEND_URL}/login?error=google_not_configured",
            status_code=302,
        )

    code = request.query_params.get("code")
    state = request.query_params.get("state")
    error = request.query_params.get("error")

    if error:
        return RedirectResponse(f"{FRONTEND_URL}/login?error={error}", status_code=302)

    if not code:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=missing_code", status_code=302)

    saved_state = request.cookies.get("google_oauth_state")
    if not saved_state or saved_state != state:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=bad_state", status_code=302)

    try:
        token = google_exchange_token(code)
    except Exception as e:
        print(f"⚠️ 구글 토큰 교환 실패: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_access_token", status_code=302)

    access_token = token.get("access_token")
    if not access_token:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_access_token", status_code=302)

    try:
        info = google_userinfo(access_token)
    except Exception as e:
        print(f"⚠️ 구글 사용자 정보 조회 실패: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_access_token", status_code=302)

    google_id = info.get("sub")
    if not google_id:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_access_token", status_code=302)

    email = (info.get("email") or "").strip() or None
    nickname = (info.get("name") or "").strip() or None

    try:
        user_id = get_or_create_user(
            provider="google",
            provider_id=str(google_id),
            email=email,
            nickname=nickname,
        )
    except Exception as e:
        print(f"⚠️ 구글 유저 DB 저장 실패: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=db_error", status_code=302)

    # 로그인 성공 → 프론트 로그인 성공 페이지로 리다이렉트 + 쿠키 (DB user_id 저장)
    resp = RedirectResponse(f"{FRONTEND_URL}/login/success?provider=google", status_code=302)
    resp.set_cookie(
        "hsaju_session",
        str(user_id),
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 60 * 24 * 30,
    )
    return resp

