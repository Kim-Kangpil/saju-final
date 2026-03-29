from fastapi.responses import RedirectResponse
from fastapi import APIRouter, Request
import requests
import secrets
import os
from dotenv import load_dotenv
from pathlib import Path

from logic.user_db import get_or_create_user
from logic.session_token import create_session_token

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter()

NAVER_CLIENT_ID = (os.getenv("NAVER_CLIENT_ID") or "").strip()
NAVER_CLIENT_SECRET = (os.getenv("NAVER_CLIENT_SECRET") or "").strip()
NAVER_REDIRECT_URI = (os.getenv("NAVER_REDIRECT_URI") or "").strip()
FRONTEND_URL = (os.getenv("FRONTEND_URL", "https://hsaju.com") or "https://hsaju.com").strip().rstrip("/")

if not NAVER_CLIENT_ID:
    print("[WARNING] NAVER_CLIENT_ID가 .env에 없습니다. 네이버 로그인은 비활성됩니다.")
else:
    print(f"[INFO] NAVER_CLIENT_ID 로드됨: {NAVER_CLIENT_ID[:10]}...")
if not NAVER_CLIENT_SECRET:
    print("[WARNING] NAVER_CLIENT_SECRET가 .env에 없습니다. 네이버 토큰 교환이 실패할 수 있습니다.")
if not NAVER_REDIRECT_URI:
    print("[WARNING] NAVER_REDIRECT_URI가 .env에 없습니다. 네이버 개발자 센터에 등록한 콜백 URL을 넣어주세요.")
else:
    print(f"[INFO] NAVER_REDIRECT_URI: {NAVER_REDIRECT_URI}")
print(f"[INFO] FRONTEND_URL: {FRONTEND_URL}")


def naver_exchange_token(code: str, state: str) -> dict:
    """네이버 인증 코드를 액세스 토큰으로 교환"""
    url = "https://nid.naver.com/oauth2.0/token"
    params = {
        "grant_type": "authorization_code",
        "client_id": NAVER_CLIENT_ID,
        "client_secret": NAVER_CLIENT_SECRET,
        "code": code,
        "state": state,
    }
    r = requests.get(url, params=params, timeout=10)
    r.raise_for_status()
    return r.json()


def naver_userinfo(access_token: str) -> dict:
    """액세스 토큰으로 네이버 사용자 정보 조회"""
    url = "https://openapi.naver.com/v1/nid/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    r = requests.get(url, headers=headers, timeout=10)
    r.raise_for_status()
    return r.json()


@router.get("/auth/naver/login")
def naver_login():
    """네이버 로그인 페이지로 리다이렉트"""
    if not NAVER_CLIENT_ID or not NAVER_REDIRECT_URI:
        return RedirectResponse(
            f"{FRONTEND_URL}/start?error=naver_not_configured",
            status_code=302,
        )
    
    state = secrets.token_urlsafe(16)
    
    # 네이버 OAuth2 인증 URL
    auth_url = (
        "https://nid.naver.com/oauth2.0/authorize"
        f"?response_type=code"
        f"&client_id={NAVER_CLIENT_ID}"
        f"&redirect_uri={NAVER_REDIRECT_URI}"
        f"&state={state}"
    )
    
    resp = RedirectResponse(auth_url, status_code=302)
    resp.set_cookie(
        key="naver_oauth_state",
        value=state,
        max_age=600,
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return resp


@router.get("/auth/naver/callback")
def naver_callback(request: Request, code: str, state: str):
    """네이버 로그인 콜백 처리"""
    # state 검증 (CSRF 방지)
    saved_state = request.cookies.get("naver_oauth_state")
    if not saved_state or saved_state != state:
        print(f"[ERROR] State mismatch: saved={saved_state}, received={state}")
        return RedirectResponse(
            f"{FRONTEND_URL}/start?error=invalid_state",
            status_code=302,
        )
    
    try:
        # 1. 액세스 토큰 발급
        token_data = naver_exchange_token(code, state)
        access_token = token_data.get("access_token")
        
        if not access_token:
            print(f"[ERROR] No access token in response: {token_data}")
            return RedirectResponse(
                f"{FRONTEND_URL}/start?error=token_exchange_failed",
                status_code=302,
            )
        
        # 2. 사용자 정보 조회
        user_data = naver_userinfo(access_token)
        
        if user_data.get("resultcode") != "00":
            print(f"[ERROR] Naver API error: {user_data}")
            return RedirectResponse(
                f"{FRONTEND_URL}/start?error=user_info_failed",
                status_code=302,
            )
        
        response = user_data.get("response", {})
        provider_id = response.get("id")
        email = response.get("email")
        nickname = response.get("nickname") or response.get("name")
        
        if not provider_id:
            print("[ERROR] No provider_id from Naver")
            return RedirectResponse(
                f"{FRONTEND_URL}/start?error=no_user_id",
                status_code=302,
            )
        
        # 3. DB에 사용자 저장/조회
        user = get_or_create_user(
            provider="naver",
            provider_id=str(provider_id),
            email=email,
            nickname=nickname,
        )
        
        # 4. 세션 토큰 생성
        session_token = create_session_token(user["id"])
        
        # 5. 프론트엔드로 리다이렉트 (쿠키 설정)
        resp = RedirectResponse(
            f"{FRONTEND_URL}/home?login=success&provider=naver",
            status_code=302,
        )
        resp.set_cookie(
            key="hsaju_session",
            value=session_token,
            max_age=60 * 60 * 24 * 7,  # 7일
            httponly=True,
            secure=True,
            samesite="none",
        )
        resp.delete_cookie("naver_oauth_state")
        
        print(f"[INFO] Naver login success: user_id={user['id']}, email={email}")
        return resp
        
    except requests.HTTPError as e:
        print(f"[ERROR] Naver API HTTP error: {e}")
        return RedirectResponse(
            f"{FRONTEND_URL}/start?error=naver_api_error",
            status_code=302,
        )
    except Exception as e:
        print(f"[ERROR] Naver login failed: {e}")
        return RedirectResponse(
            f"{FRONTEND_URL}/start?error=login_failed",
            status_code=302,
        )
