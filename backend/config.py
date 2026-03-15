"""
설정 집약. 환경 변수는 .env 또는 시스템에서 로드.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path)

# 프로젝트 루트 (backend/)
ROOT_DIR = Path(__file__).resolve().parent

# -----------------------------
# DB (Supabase = PostgreSQL)
# -----------------------------
# Supabase: Project Settings → Database → Connection string → URI
# async 드라이버 사용: postgresql+asyncpg://user:pass@host:port/dbname
DATABASE_URL: str | None = (os.getenv("DATABASE_URL") or "").strip() or None

# -----------------------------
# 기존 앱 설정 (참고용, main.py에서 그대로 써도 됨)
# -----------------------------
FRONTEND_URL: str = (os.getenv("FRONTEND_URL") or "https://hsaju.com").strip().rstrip("/")
CORS_ORIGINS_STR: str = (os.getenv("CORS_ORIGINS") or "").strip()
OPENAI_API_KEY: str | None = (os.getenv("OPENAI_API_KEY") or "").strip() or None
PORTONE_API_SECRET: str | None = (
    (os.getenv("PORTONE_API_SECRET") or os.getenv("PORTONE_SECRET_KEY") or "").strip() or None
)
SESSION_TOKEN_SECRET: str = (
    (os.getenv("SESSION_TOKEN_SECRET") or os.getenv("SECRET_KEY") or "hsaju-fallback-secret-change-in-production")
    .strip()
)

# 절기 DB (사주 기둥 계산용, JSON 파일)
SOLAR_TERMS_DB_PATH: Path = ROOT_DIR / "logic" / "solar_terms_db.json"


def get_cors_origins() -> list[str]:
    """CORS 허용 origin 목록. main.py에서 사용."""
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    if FRONTEND_URL and FRONTEND_URL not in origins:
        origins.append(FRONTEND_URL)
    if CORS_ORIGINS_STR:
        for o in CORS_ORIGINS_STR.split(","):
            o = o.strip().rstrip("/")
            if o and o not in origins:
                origins.append(o)
    return origins
