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
                    iana_timezone TEXT,
                    share_token TEXT
                )
            """)
            cur.execute(
                "ALTER TABLE saju ADD COLUMN IF NOT EXISTS iana_timezone TEXT"
            )
            cur.execute(
                "ALTER TABLE saju ADD COLUMN IF NOT EXISTS share_token TEXT"
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
                    iana_timezone TEXT,
                    share_token TEXT
                )
            """)
            try:
                cur.execute("ALTER TABLE saju ADD COLUMN iana_timezone TEXT")
            except Exception:
                pass
            try:
                cur.execute("ALTER TABLE saju ADD COLUMN share_token TEXT")
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
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_saju_share_token ON saju(share_token)"
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


def get_saju_by_share_token(share_token: str) -> Optional[dict]:
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT id, user_id, name, relation, birthdate, birth_time, calendar_type, gender, created_at, iana_timezone FROM saju WHERE share_token = ?"),
            (share_token,),
        )
        row = cur.fetchone()
        if not row:
            return None
        return {
            "id": row[0], "user_id": row[1], "name": row[2], "relation": row[3],
            "birthdate": row[4], "birth_time": row[5], "calendar_type": row[6],
            "gender": row[7], "created_at": row[8], "iana_timezone": row[9],
        }
    finally:
        conn.close()


def set_saju_share_token(saju_id: int, user_id: int, share_token: str) -> bool:
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("UPDATE saju SET share_token = ? WHERE id = ? AND user_id = ?"),
            (share_token, saju_id, user_id),
        )
        conn.commit()
        return (cur.rowcount or 0) > 0
    finally:
        conn.close()


def delete_saju_for_user(saju_id: int, user_id: int) -> bool:
    """본인 소유 사주 1건 삭제. 삭제 성공 시 True 반환."""
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("DELETE FROM saju WHERE id = ? AND user_id = ?"),
            (saju_id, user_id),
        )
        conn.commit()
        return (cur.rowcount or 0) > 0
    finally:
        conn.close()


# ==================== 리포트 캐시 ====================

_CACHE_TTL_DAYS = 30

def get_report_cache(cache_key: str, section_key: str) -> Optional[str]:
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT content, created_at FROM report_cache WHERE cache_key = ? AND section_key = ?"),
            (cache_key, section_key),
        )
        row = cur.fetchone()
        if not row:
            return None
        created_at_str = str(row[1]) if row[1] else ""
        if created_at_str:
            try:
                from datetime import timezone
                created_at = datetime.fromisoformat(created_at_str.rstrip("Z"))
                age_days = (datetime.utcnow() - created_at).days
                if age_days > _CACHE_TTL_DAYS:
                    return None  # 만료
            except Exception:
                pass
        return str(row[0])
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


def clear_all_report_cache() -> int:
    """리포트/요약 등 LLM 결과 캐시 전부 삭제. 반환: 삭제된 행 수(드라이버에 따라 -1일 수 있음)."""
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(adapt("DELETE FROM report_cache"))
        conn.commit()
        n = cur.rowcount
        return int(n) if n is not None and n >= 0 else 0
    finally:
        conn.close()
