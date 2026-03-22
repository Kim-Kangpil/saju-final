"""게스트 채팅(로그인 전) 사용 횟수 저장용 DB (PostgreSQL)."""

import psycopg2
from datetime import datetime
from typing import Tuple

from config import DATABASE_URL


def get_conn():
    return psycopg2.connect(DATABASE_URL)


def init_guest_chat_db() -> None:
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS guest_chat_usage (
              guest_key TEXT PRIMARY KEY,
              count INTEGER NOT NULL DEFAULT 0,
              updated_at TEXT NOT NULL
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def consume_guest_chat(guest_key: str, limit: int) -> Tuple[bool, int]:
    """게스트 채팅 1회를 사용 처리."""
    now = datetime.utcnow().isoformat()
    conn = get_conn()
    try:
        cur = conn.cursor()
        # SELECT FOR UPDATE으로 동시성 안전 보장
        cur.execute(
            "SELECT count FROM guest_chat_usage WHERE guest_key = %s FOR UPDATE",
            (guest_key,),
        )
        row = cur.fetchone()
        current = int(row[0]) if row else 0

        if current >= limit:
            conn.rollback()
            return False, current

        new_count = current + 1
        cur.execute(
            """
            INSERT INTO guest_chat_usage (guest_key, count, updated_at)
            VALUES (%s, %s, %s)
            ON CONFLICT(guest_key) DO UPDATE SET
              count = EXCLUDED.count,
              updated_at = EXCLUDED.updated_at
            """,
            (guest_key, new_count, now),
        )
        conn.commit()
        return True, new_count
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
