"""
채팅 로그 저장용 DB (SQLite)
"""

import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, Any

DB_PATH = Path(__file__).resolve().parent / "chat_logs.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_chat_logs_db() -> None:
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
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
        cur.execute(
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
        cur.execute("CREATE INDEX IF NOT EXISTS idx_chat_messages_session_idx ON chat_messages(session_id, idx)")
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
    if not session_id:
        return

    now = _now_iso()

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
        cur = conn.cursor()
        cur.execute(
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

        cur.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))

        for m in normalized:
            cur.execute(
                """
                INSERT INTO chat_messages (session_id, idx, role, content, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (session_id, int(m["idx"]), m["role"], m["content"], now),
            )

        conn.commit()
    except Exception:
        conn.rollback()
        raise
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
        cur = conn.cursor()
        if user_id is not None:
            where = "user_id = ?"
            params: list[Any] = [user_id]
        else:
            where = "guest_key = ?"
            params = [guest_key or ""]

        limit = max(1, min(int(limit), 50))
        offset = max(0, int(offset))

        cur.execute(
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
        return [
            {
                "sessionId": r[0],
                "title": r[1] or "",
                "updatedAt": r[2],
                "messageCount": int(r[3] or 0),
                "lastMessagePreview": (r[4] or "")[:80],
            }
            for r in rows
        ]
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
        cur = conn.cursor()
        if user_id is not None:
            cur.execute(
                "SELECT 1 FROM chat_sessions WHERE session_id = ? AND user_id = ?",
                (session_id, user_id),
            )
        else:
            cur.execute(
                "SELECT 1 FROM chat_sessions WHERE session_id = ? AND guest_key = ?",
                (session_id, guest_key or ""),
            )

        if cur.fetchone() is None:
            return None

        cur.execute(
            """
            SELECT role, content, idx, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY idx ASC
            """,
            (session_id,),
        )
        rows = cur.fetchall()
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
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT 1 FROM chat_sessions WHERE session_id = ? AND user_id = ?",
            (session_id, target_user_id),
        )
        if cur.fetchone() is None:
            return None

        cur.execute(
            """
            SELECT role, content, idx, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY idx ASC
            """,
            (session_id,),
        )
        rows = cur.fetchall()
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
