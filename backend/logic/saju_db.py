"""사주 저장용 DB — DATABASE_URL 있으면 PostgreSQL, 없으면 SQLite."""
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, List

from logic._db import USE_PG, get_conn, adapt

DB_PATH = Path(__file__).resolve().parent / "saju.db"


def _conn():
    return get_conn(DB_PATH)


def init_saju_db():
    conn = _conn()
    try:
        cur = conn.cursor()
        if USE_PG:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS saju (
                    id BIGSERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    relation TEXT,
                    birthdate TEXT NOT NULL,
                    birth_time TEXT,
                    calendar_type TEXT NOT NULL,
                    gender TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    iana_timezone TEXT
                )
            """)
            cur.execute(
                "ALTER TABLE saju ADD COLUMN IF NOT EXISTS iana_timezone TEXT"
            )
            cur.execute("""
                CREATE TABLE IF NOT EXISTS report_cache (
                    cache_key TEXT NOT NULL,
                    section_key TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    PRIMARY KEY (cache_key, section_key)
                )
            """)
        else:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS saju (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    relation TEXT,
                    birthdate TEXT NOT NULL,
                    birth_time TEXT,
                    calendar_type TEXT NOT NULL,
                    gender TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    iana_timezone TEXT
                )
            """)
            try:
                cur.execute("ALTER TABLE saju ADD COLUMN iana_timezone TEXT")
            except Exception:
                pass
            cur.execute("""
                CREATE TABLE IF NOT EXISTS report_cache (
                    cache_key TEXT NOT NULL,
                    section_key TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    PRIMARY KEY (cache_key, section_key)
                )
            """)

        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_saju_user_id ON saju(user_id)"
        )
        conn.commit()
    finally:
        conn.close()


def get_saju_count_for_user(user_id: int) -> int:
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT COUNT(*) FROM saju WHERE user_id = ?"),
            (user_id,),
        )
        row = cur.fetchone()
        return int(row[0]) if row and row[0] is not None else 0
    finally:
        conn.close()


def get_saju_by_id(saju_id: int, user_id: int) -> Optional[dict]:
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT id, user_id, name, relation, birthdate, birth_time, calendar_type, gender, created_at, iana_timezone FROM saju WHERE id = ? AND user_id = ?"),
            (saju_id, user_id),
        )
        row = cur.fetchone()
        if not row:
            return None
        return {
            "id": row[0],
            "user_id": row[1],
            "name": row[2],
            "relation": row[3],
            "birthdate": row[4],
            "birth_time": row[5],
            "calendar_type": row[6],
            "gender": row[7],
            "created_at": row[8],
            "iana_timezone": row[9],
        }
    finally:
        conn.close()


def get_saju_list_for_user(user_id: int) -> List[dict]:
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT id, user_id, name, relation, birthdate, birth_time, calendar_type, gender, created_at, iana_timezone "
                  "FROM saju WHERE user_id = ? ORDER BY created_at DESC"),
            (user_id,),
        )
        rows = cur.fetchall()
        return [
            {
                "id": row[0],
                "user_id": row[1],
                "name": row[2],
                "relation": row[3],
                "birthdate": row[4],
                "birth_time": row[5],
                "calendar_type": row[6],
                "gender": row[7],
                "created_at": row[8],
                "iana_timezone": row[9],
            }
            for row in rows
        ]
    finally:
        conn.close()


def save_saju_for_user(
    user_id: int,
    name: str,
    relation: Optional[str],
    birthdate: str,
    birth_time: Optional[str],
    calendar_type: str,
    gender: str,
    iana_timezone: Optional[str] = None,
) -> int:
    now = datetime.utcnow().isoformat()
    conn = _conn()
    try:
        cur = conn.cursor()
        sql = adapt("""
            INSERT INTO saju (
                user_id, name, relation,
                birthdate, birth_time,
                calendar_type, gender,
                created_at, iana_timezone
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """)
        if USE_PG:
            sql += " RETURNING id"
        cur.execute(sql, (
            user_id, name, relation,
            birthdate, birth_time,
            calendar_type, gender,
            now, iana_timezone,
        ))
        new_id = cur.fetchone()[0] if USE_PG else cur.lastrowid
        conn.commit()
        return int(new_id)
    finally:
        conn.close()


# ==================== 리포트 캐시 ====================

def get_report_cache(cache_key: str, section_key: str) -> Optional[str]:
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT content FROM report_cache WHERE cache_key = ? AND section_key = ?"),
            (cache_key, section_key),
        )
        row = cur.fetchone()
        return str(row[0]) if row else None
    finally:
        conn.close()


def save_report_cache(cache_key: str, section_key: str, content: str) -> None:
    now = datetime.utcnow().isoformat()
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("""
            INSERT INTO report_cache (cache_key, section_key, content, created_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(cache_key, section_key) DO UPDATE SET
                content = EXCLUDED.content,
                created_at = EXCLUDED.created_at
            """),
            (cache_key, section_key, content, now),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
