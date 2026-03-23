"""게스트 채팅(로그인 전) 사용 횟수 저장용 DB (SQLite)."""

import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Tuple

DB_PATH = Path(__file__).resolve().parent / "guest_chat_usage.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


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
        cur.execute(
            "SELECT count FROM guest_chat_usage WHERE guest_key = ?",
            (guest_key,),
        )
        row = cur.fetchone()
        current = int(row[0]) if row else 0

        if current >= limit:
            return False, current

        new_count = current + 1
        cur.execute(
            """
            INSERT INTO guest_chat_usage (guest_key, count, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(guest_key) DO UPDATE SET
              count = excluded.count,
              updated_at = excluded.updated_at
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
