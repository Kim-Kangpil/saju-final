"""게스트 채팅(로그인 전) 사용 횟수 저장용 DB.

- 목적: 게스트가 무제한으로 `/api/chat`을 호출해서 OpenAI 비용이 폭증하는 것을 방지
- 구현: SQLite 로 간단 카운팅(guest_key -> count)
"""

import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Tuple


DB_DIR = Path(__file__).resolve().parent
GUEST_CHAT_DB = DB_DIR / "guest_chat_usage.db"


def get_conn() -> sqlite3.Connection:
    return sqlite3.connect(GUEST_CHAT_DB)


def init_guest_chat_db() -> None:
    conn = get_conn()
    try:
        conn.execute(
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
    """게스트 채팅 1회를 사용 처리.

    Returns:
      (allowed, new_count_or_current)
        - allowed=True 이면 count는 증가된 값
        - allowed=False 이면 count는 기존 값(제한 도달)
    """
    now = datetime.utcnow().isoformat()
    conn = get_conn()
    try:
        # 동시성 안전을 위해 즉시 트랜잭션 시작
        conn.execute("BEGIN IMMEDIATE")

        cur = conn.execute(
            "SELECT count FROM guest_chat_usage WHERE guest_key = ?",
            (guest_key,),
        )
        row = cur.fetchone()
        current = int(row[0]) if row else 0

        if current >= limit:
            conn.rollback()
            return False, current

        new_count = current + 1
        conn.execute(
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
    finally:
        conn.close()

