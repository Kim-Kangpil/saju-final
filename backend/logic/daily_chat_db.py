"""일간 채팅 횟수 추적 DB — 로그인 유저의 하루 채팅 카운터."""
from pathlib import Path
from datetime import datetime, timezone
from typing import Tuple

from logic._db import get_conn, adapt

DB_PATH = Path(__file__).resolve().parent / "daily_chat.db"


def _conn():
    return get_conn(DB_PATH)


def init_daily_chat_db() -> None:
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS daily_chat_counts (
                user_key TEXT NOT NULL,
                date TEXT NOT NULL,
                count INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (user_key, date)
            )
        """)
        conn.commit()
    finally:
        conn.close()


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def get_daily_chat_count(user_key: str) -> int:
    today = _today()
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT count FROM daily_chat_counts WHERE user_key = ? AND date = ?"),
            (user_key, today),
        )
        row = cur.fetchone()
        return int(row[0]) if row else 0
    finally:
        conn.close()


def consume_daily_chat(user_key: str, limit: int = 3) -> Tuple[bool, int]:
    """채팅 1회 사용 처리. (ok, current_count) 반환."""
    today = _today()
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT count FROM daily_chat_counts WHERE user_key = ? AND date = ?"),
            (user_key, today),
        )
        row = cur.fetchone()
        current = int(row[0]) if row else 0
        if current >= limit:
            return False, current
        new_count = current + 1
        cur.execute(
            adapt("""
            INSERT INTO daily_chat_counts (user_key, date, count)
            VALUES (?, ?, ?)
            ON CONFLICT(user_key, date) DO UPDATE SET count = EXCLUDED.count
            """),
            (user_key, today, new_count),
        )
        conn.commit()
        return True, new_count
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
