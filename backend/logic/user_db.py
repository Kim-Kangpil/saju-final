# backend/logic/user_db.py
"""사용자 저장용 SQLite (카카오/구글/이메일 로그인)."""
import sqlite3
from pathlib import Path
from datetime import datetime

DB_DIR = Path(__file__).resolve().parent
USERS_DB = DB_DIR / "users.db"


def get_conn():
    return sqlite3.connect(USERS_DB)


def init_user_db():
    conn = get_conn()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                provider TEXT NOT NULL,
                provider_id TEXT NOT NULL,
                email TEXT,
                nickname TEXT,
                created_at TEXT NOT NULL,
                last_login TEXT NOT NULL,
                UNIQUE(provider, provider_id)
            )
        """)
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_provider_id ON users(provider, provider_id)"
        )
        conn.commit()
    finally:
        conn.close()


def get_or_create_user(
    provider: str,
    provider_id: str,
    email: str | None = None,
    nickname: str | None = None,
) -> int:
    """
    provider + provider_id로 유저 조회.
    없으면 INSERT, 있으면 last_login만 UPDATE 후 id 반환.
    """
    now = datetime.utcnow().isoformat()
    conn = get_conn()
    try:
        cur = conn.execute(
            "SELECT id FROM users WHERE provider = ? AND provider_id = ?",
            (provider, provider_id),
        )
        row = cur.fetchone()
        if row:
            user_id = row[0]
            conn.execute(
                "UPDATE users SET last_login = ? WHERE id = ?",
                (now, user_id),
            )
            conn.commit()
            return user_id
        conn.execute(
            "INSERT INTO users (provider, provider_id, email, nickname, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)",
            (provider, provider_id, email or "", nickname or "", now, now),
        )
        conn.commit()
        cur = conn.execute("SELECT last_insert_rowid()")
        return cur.fetchone()[0]
    finally:
        conn.close()
