"""사주 저장용 SQLite. 로그인한 user_id별로 저장되며, 로그인/재접속 시 초기화되지 않고 계속 유지됩니다."""
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, List

DB_DIR = Path(__file__).resolve().parent
SAJU_DB = DB_DIR / "saju.db"


def get_conn():
    return sqlite3.connect(SAJU_DB)


def _migrate_saju_schema(conn: sqlite3.Connection) -> None:
    cur = conn.execute("PRAGMA table_info(saju)")
    cols = {row[1] for row in cur.fetchall()}
    if "iana_timezone" not in cols:
        conn.execute("ALTER TABLE saju ADD COLUMN iana_timezone TEXT")


def init_saju_db():
    """saju 테이블 초기화."""
    conn = get_conn()
    try:
        conn.execute(
            """
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
            """
        )
        _migrate_saju_schema(conn)
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_saju_user_id ON saju(user_id)"
        )
        conn.commit()
    finally:
        conn.close()


def get_saju_count_for_user(user_id: int) -> int:
    """해당 user_id의 사주 개수 반환."""
    conn = get_conn()
    try:
        cur = conn.execute(
            "SELECT COUNT(*) FROM saju WHERE user_id = ?",
            (user_id,),
        )
        row = cur.fetchone()
        return int(row[0]) if row and row[0] is not None else 0
    finally:
        conn.close()


def get_saju_by_id(saju_id: int, user_id: int) -> Optional[dict]:
    """saju_id에 해당하는 사주 한 건 조회. user_id가 일치할 때만 반환."""
    conn = get_conn()
    try:
        cur = conn.execute(
            "SELECT id, user_id, name, relation, birthdate, birth_time, calendar_type, gender, created_at, iana_timezone FROM saju WHERE id = ? AND user_id = ?",
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
            "iana_timezone": row[9] if len(row) > 9 else None,
        }
    finally:
        conn.close()


def get_saju_list_for_user(user_id: int) -> List[dict]:
    """해당 user_id의 사주 전체 목록 (최신 생성 순) 반환."""
    conn = get_conn()
    try:
        cur = conn.execute(
            "SELECT id, user_id, name, relation, birthdate, birth_time, calendar_type, gender, created_at, iana_timezone "
            "FROM saju WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        )
        rows = cur.fetchall()
        result: List[dict] = []
        for row in rows:
            result.append(
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
                    "iana_timezone": row[9] if len(row) > 9 else None,
                }
            )
        return result
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
    """새 사주 한 건 저장 후 row id 반환."""
    now = datetime.utcnow().isoformat()
    conn = get_conn()
    try:
        conn.execute(
            """
            INSERT INTO saju (
                user_id, name, relation,
                birthdate, birth_time,
                calendar_type, gender,
                created_at, iana_timezone
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                name,
                relation,
                birthdate,
                birth_time,
                calendar_type,
                gender,
                now,
                iana_timezone,
            ),
        )
        conn.commit()
        cur = conn.execute("SELECT last_insert_rowid()")
        row = cur.fetchone()
        return int(row[0]) if row and row[0] is not None else 0
    finally:
        conn.close()
