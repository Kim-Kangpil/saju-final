"""
채팅 로그 저장용 DB(SQLite)

- 목적: /api/chat-logs/* 로 사용자(또는 게스트)의 채팅 기록을 저장/조회할 수 있게 함
- 구현: SQLite 테이블 2개 (sessions, messages)
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional, Any


DB_DIR = Path(__file__).resolve().parent
CHAT_LOGS_DB = DB_DIR / "chat_logs.db"


def get_conn() -> sqlite3.Connection:
    return sqlite3.connect(CHAT_LOGS_DB)


def init_chat_logs_db() -> None:
    conn = get_conn()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS chat_sessions (
              session_id TEXT PRIMARY KEY,
              user_id INTEGER,
              guest_key TEXT,
              title TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS chat_messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              session_id TEXT NOT NULL,
              idx INTEGER NOT NULL,
              role TEXT NOT NULL,
              content TEXT NOT NULL,
              created_at TEXT NOT NULL,
              FOREIGN KEY(session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chat_messages_session_idx ON chat_messages(session_id, idx)")
        conn.commit()
    finally:
        conn.close()


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


def save_chat_session(
    *,
    session_id: str,
    user_id: Optional[int],
    guest_key: Optional[str],
    title: Optional[str],
    messages: list[dict[str, Any]],
) -> None:
    """
    messages: [{idx, role, content}, ...]

    - 세션 저장 시 해당 session_id의 기존 메시지를 모두 지우고 재삽입
    - 프론트가 “대화가 끝난 시점”에 전체 messages를 보내는 방식으로 안정성을 우선
    """
    if not session_id:
        return

    now = _now_iso()

    # 메시지 정규화(최소 유효성 체크)
    normalized: list[dict[str, Any]] = []
    for m in messages or []:
        role = (m.get("role") or "").strip()
        content = (m.get("content") or "").strip()
        idx = m.get("idx")
        if role not in ("user", "assistant"):
            continue
        if not content:
            continue
        if not isinstance(idx, int):
            try:
                idx = int(idx)
            except Exception:
                continue
        normalized.append({"idx": idx, "role": role, "content": content})

    normalized.sort(key=lambda x: x["idx"])

    conn = get_conn()
    try:
        conn.execute("BEGIN IMMEDIATE")
        conn.execute(
            """
            INSERT INTO chat_sessions (session_id, user_id, guest_key, title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(session_id) DO UPDATE SET
              user_id = excluded.user_id,
              guest_key = excluded.guest_key,
              title = COALESCE(excluded.title, chat_sessions.title),
              updated_at = excluded.updated_at
            """,
            (session_id, user_id, guest_key, title or "", now, now),
        )

        conn.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))

        for m in normalized:
            conn.execute(
                """
                INSERT INTO chat_messages (session_id, idx, role, content, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (session_id, int(m["idx"]), m["role"], m["content"], now),
            )

        conn.commit()
    finally:
        conn.close()


def get_sessions_for_owner(
    *,
    user_id: Optional[int] = None,
    guest_key: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> list[dict[str, Any]]:
    conn = get_conn()
    try:
        where = ""
        params: list[Any] = []
        if user_id is not None:
            where = "user_id = ?"
            params.append(user_id)
        else:
            where = "guest_key = ?"
            params.append(guest_key or "")

        limit = max(1, min(int(limit), 50))
        offset = max(0, int(offset))

        cur = conn.execute(
            f"""
            SELECT
              s.session_id,
              s.title,
              s.updated_at,
              (
                SELECT COUNT(*)
                FROM chat_messages m
                WHERE m.session_id = s.session_id
              ) AS message_count,
              (
                SELECT m.content
                FROM chat_messages m
                WHERE m.session_id = s.session_id
                ORDER BY m.idx DESC
                LIMIT 1
              ) AS last_message
            FROM chat_sessions s
            WHERE {where}
            ORDER BY s.updated_at DESC
            LIMIT ? OFFSET ?
            """,
            (*params, limit, offset),
        )

        rows = cur.fetchall()
        result: list[dict[str, Any]] = []
        for r in rows:
            session_id, title, updated_at, message_count, last_message = r
            result.append(
                {
                    "sessionId": session_id,
                    "title": title or "",
                    "updatedAt": updated_at,
                    "messageCount": int(message_count or 0),
                    "lastMessagePreview": (last_message or "")[:80],
                }
            )
        return result
    finally:
        conn.close()


def get_messages_for_session(
    *,
    session_id: str,
    user_id: Optional[int] = None,
    guest_key: Optional[str] = None,
) -> Optional[list[dict[str, Any]]]:
    conn = get_conn()
    try:
        # 권한 확인: 해당 세션이 요청자에게 속하는지 확인
        if user_id is not None:
            cur = conn.execute(
                """
                SELECT 1 FROM chat_sessions
                WHERE session_id = ? AND user_id = ?
                """,
                (session_id, user_id),
            )
        else:
            cur = conn.execute(
                """
                SELECT 1 FROM chat_sessions
                WHERE session_id = ? AND guest_key = ?
                """,
                (session_id, guest_key or ""),
            )

        if cur.fetchone() is None:
            return None

        cur2 = conn.execute(
            """
            SELECT role, content, idx, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY idx ASC
            """,
            (session_id,),
        )
        rows = cur2.fetchall()
        return [
            {"idx": int(idx), "role": str(role), "content": str(content), "createdAt": created_at}
            for (role, content, idx, created_at) in rows
        ]
    finally:
        conn.close()


def get_messages_for_admin(
    *,
    session_id: str,
    target_user_id: int,
) -> Optional[list[dict[str, Any]]]:
    # admin은 user_id 기준으로 세션 소유권을 확인한 뒤 메시지를 반환
    conn = get_conn()
    try:
        cur = conn.execute(
            """
            SELECT 1 FROM chat_sessions
            WHERE session_id = ? AND user_id = ?
            """,
            (session_id, target_user_id),
        )
        if cur.fetchone() is None:
            return None

        cur2 = conn.execute(
            """
            SELECT role, content, idx, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY idx ASC
            """,
            (session_id,),
        )
        rows = cur2.fetchall()
        return [
            {"idx": int(idx), "role": str(role), "content": str(content), "createdAt": created_at}
            for (role, content, idx, created_at) in rows
        ]
    finally:
        conn.close()


def get_sessions_for_admin_user(
    *,
    target_user_id: int,
    limit: int = 20,
    offset: int = 0,
) -> list[dict[str, Any]]:
    return get_sessions_for_owner(user_id=target_user_id, limit=limit, offset=offset)

