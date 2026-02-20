# app/auth_kakao.py
import os
import secrets
import requests
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse

router = APIRouter()

KAKAO_REST_KEY = os.environ["KAKAO_REST_KEY"]
KAKAO_REDIRECT_URI = os.environ["KAKAO_REDIRECT_URI"]  # 예: https://saju-backend-eqd6.onrender.com/auth/kakao/callback
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://hsaju.com")

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
    # state는 보안용(대충 위조 방지)
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
        secure=True,
        samesite="lax",
        max_age=300,
    )
    return resp

@router.get("/auth/kakao/callback")
def kakao_callback(request: Request):
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

    # 1) code -> access_token 교환
    token = exchange_token(code)
    access_token = token.get("access_token")
    if not access_token:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_access_token", status_code=302)

    # 2) 카카오 사용자 정보 조회
    me = kakao_me(access_token)
    kakao_id = me.get("id")

    # 3) 여기서 원래는 DB에 회원 저장/로그인 처리 해야 함
    # 지금은 “로그인 됐다고 표시하는 쿠키”만 간단히 발급
    resp = RedirectResponse(f"{FRONTEND_URL}/login/success", status_code=302)
    resp.set_cookie(
        "hsaju_session",
        f"kakao:{kakao_id}",
        httponly=True,
        secure=True,
        samesite="none",   # 프론트/백엔드 도메인 다르면 none이 편함(https 필수)
        max_age=60 * 60 * 24 * 7,
    )
    return resp