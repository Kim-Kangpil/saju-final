"""사주 저장용 DB (PostgreSQL)."""
import psycopg2
from datetime import datetime
from typing import Optional, List

from config import DATABASE_URL


def get_conn():
    return psycopg2.connect(DATABASE_URL)


def init_saju_db():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
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
            """
        )
        cur.execute(
            "ALTER TABLE saju ADD COLUMN IF NOT EXISTS iana_timezone TEXT"
        )
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_saju_user_id ON saju(user_id)"
        )
        conn.commit()
    finally:
        conn.close()


def get_saju_count_for_user(user_id: int) -> int:
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT COUNT(*) FROM saju WHERE user_id = %s",
            (user_id,),
        )
        row = cur.fetchone()
        return int(row[0]) if row and row[0] is not None else 0
    finally:
        conn.close()


def get_saju_by_id(saju_id: int, user_id: int) -> Optional[dict]:
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, user_id, name, relation, birthdate, birth_time, calendar_type, gender, created_at, iana_timezone FROM saju WHERE id = %s AND user_id = %s",
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
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, user_id, name, relation, birthdate, birth_time, calendar_type, gender, created_at, iana_timezone "
            "FROM saju WHERE user_id = %s ORDER BY created_at DESC",
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
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO saju (
                user_id, name, relation,
                birthdate, birth_time,
                calendar_type, gender,
                created_at, iana_timezone
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
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
        new_id = cur.fetchone()[0]
        conn.commit()
        return int(new_id)
    finally:
        conn.close()
