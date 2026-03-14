# backend/logic/session_token.py
"""모바일 등 크로스 도메인에서 쿠키가 안 붙을 때 사용하는 세션 토큰. HMAC 서명으로 검증."""
import os
import hmac
import hashlib
import base64
import time
from typing import Optional

TOKEN_EXPIRE_SEC = 60 * 60 * 24 * 30  # 30일
SECRET = (os.getenv("SESSION_TOKEN_SECRET") or os.getenv("SECRET_KEY") or "hsaju-fallback-secret-change-in-production").strip()


def _b64enc(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64dec(s: str) -> bytes:
    pad = 4 - len(s) % 4
    if pad != 4:
        s += "=" * pad
    return base64.urlsafe_b64decode(s.encode("ascii"))


def create_session_token(user_id: int) -> str:
    """user_id와 만료 시각을 담은 서명된 토큰 반환."""
    expiry = int(time.time()) + TOKEN_EXPIRE_SEC
    payload = f"{user_id}:{expiry}"
    sig = hmac.new(SECRET.encode(), payload.encode(), hashlib.sha256).digest()
    return _b64enc(payload.encode()) + "." + _b64enc(sig)


def verify_session_token(token: str) -> Optional[int]:
    """토큰 검증 후 user_id 반환. 만료/위조 시 None."""
    if not token or "." not in token:
        return None
    try:
        payload_b64, sig_b64 = token.split(".", 1)
        payload = _b64dec(payload_b64).decode()
        sig = _b64dec(sig_b64)
        user_id_s, expiry_s = payload.split(":", 1)
        user_id = int(user_id_s)
        expiry = int(expiry_s)
        if time.time() > expiry:
            return None
        expected = hmac.new(SECRET.encode(), payload.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(sig, expected):
            return None
        return user_id
    except Exception:
        return None
