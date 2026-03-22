# backend/logic/user_db.py
"""사용자 저장용 DB (PostgreSQL)."""
import psycopg2
import psycopg2.extras
from datetime import datetime, timedelta

from config import DATABASE_URL


def get_conn():
    return psycopg2.connect(DATABASE_URL)


def init_user_db():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                provider TEXT NOT NULL,
                provider_id TEXT NOT NULL,
                email TEXT,
                nickname TEXT,
                created_at TEXT NOT NULL,
                last_login TEXT NOT NULL,
                seed_balance INTEGER DEFAULT 0,
                is_member INTEGER DEFAULT 0,
                membership_started_at TEXT,
                membership_expires_at TEXT,
                UNIQUE(provider, provider_id)
            )
        """)
        cur.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_provider_id ON users(provider, provider_id)"
        )
        # 기존 테이블에 컬럼 없으면 추가 (PostgreSQL IF NOT EXISTS 지원)
        for col_sql in (
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS seed_balance INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_member INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_started_at TEXT",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_expires_at TEXT",
        ):
            cur.execute(col_sql)
        conn.commit()
    finally:
        conn.close()


def get_or_create_user(
    provider: str,
    provider_id: str,
    email: str | None = None,
    nickname: str | None = None,
) -> int:
    now = datetime.utcnow().isoformat()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM users WHERE provider = %s AND provider_id = %s",
            (provider, provider_id),
        )
        row = cur.fetchone()
        if row:
            user_id = row[0]
            cur.execute(
                "UPDATE users SET last_login = %s WHERE id = %s",
                (now, user_id),
            )
            conn.commit()
            return user_id
        cur.execute(
            "INSERT INTO users (provider, provider_id, email, nickname, created_at, last_login) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (provider, provider_id, email or "", nickname or "", now, now),
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return new_id
    finally:
        conn.close()


def get_user_id_from_session(session_value: str) -> int | None:
    if not session_value or not session_value.strip():
        return None
    s = session_value.strip()

    try:
        uid = int(s)
        if uid > 0:
            return uid
    except (ValueError, TypeError):
        pass

    if s.startswith("kakao:"):
        provider_id = s[6:].strip()
        if provider_id:
            conn = get_conn()
            try:
                cur = conn.cursor()
                cur.execute(
                    "SELECT id FROM users WHERE provider = 'kakao' AND provider_id = %s",
                    (provider_id,),
                )
                row = cur.fetchone()
                return int(row[0]) if row else None
            finally:
                conn.close()
    return None


def get_user_by_id(user_id: int) -> dict | None:
    if not user_id:
        return None
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT provider, email, nickname FROM users WHERE id = %s",
            (user_id,),
        )
        row = cur.fetchone()
        if not row:
            return None
        return {
            "provider": row[0] or "",
            "email": (row[1] or "").strip() or None,
            "nickname": (row[2] or "").strip() or None,
        }
    finally:
        conn.close()


def get_seed_balance(user_id: int) -> int:
    if not user_id:
        return 0
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT seed_balance FROM users WHERE id = %s",
            (user_id,),
        )
        row = cur.fetchone()
        if not row:
            return 0
        try:
            return int(row[0]) if row[0] is not None else 0
        except (TypeError, ValueError):
            return 0
    except Exception:
        return 0
    finally:
        conn.close()


def deduct_seed(user_id: int, amount: int = 1) -> tuple[bool, int]:
    if not user_id or amount < 1:
        return False, get_seed_balance(user_id or 0)
    current = get_seed_balance(user_id)
    if current < amount:
        return False, current
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE users SET seed_balance = seed_balance - %s WHERE id = %s",
            (amount, user_id),
        )
        conn.commit()
        return True, current - amount
    except Exception:
        conn.rollback()
        return False, current
    finally:
        conn.close()


def _parse_iso_dt(value: str | None) -> datetime | None:
    if not value or not str(value).strip():
        return None
    s = str(value).strip()
    try:
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return datetime.fromisoformat(s)
    except ValueError:
        return None


def refresh_and_get_membership_status(user_id: int) -> dict:
    if not user_id:
        return {"is_member": False, "membership_started_at": None, "membership_expires_at": None}
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT is_member, membership_started_at, membership_expires_at
            FROM users WHERE id = %s
            """,
            (user_id,),
        )
        row = cur.fetchone()
        if not row:
            return {"is_member": False, "membership_started_at": None, "membership_expires_at": None}
        raw_im = row[0]
        if raw_im is None:
            is_m = False
        else:
            try:
                is_m = bool(int(raw_im))
            except (TypeError, ValueError):
                is_m = bool(raw_im)
        started = row[1]
        expires = row[2]
        exp_dt = _parse_iso_dt(expires)
        now = datetime.utcnow()
        if exp_dt is not None and exp_dt < now and is_m:
            cur.execute("UPDATE users SET is_member = 0 WHERE id = %s", (user_id,))
            conn.commit()
            is_m = False
        return {
            "is_member": is_m,
            "membership_started_at": started,
            "membership_expires_at": expires,
        }
    except Exception:
        return {"is_member": False, "membership_started_at": None, "membership_expires_at": None}
    finally:
        conn.close()


def activate_membership(user_id: int, months: int) -> dict:
    if not user_id or months < 1:
        raise ValueError("user_id와 months(>=1)가 필요합니다.")
    months = min(int(months), 120)
    now = datetime.utcnow()
    expires = now + timedelta(days=30 * months)
    iso_now = now.isoformat()
    iso_exp = expires.isoformat()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if not cur.fetchone():
            raise LookupError("user not found")
        cur.execute(
            """
            UPDATE users SET
                is_member = 1,
                membership_started_at = %s,
                membership_expires_at = %s
            WHERE id = %s
            """,
            (iso_now, iso_exp, user_id),
        )
        conn.commit()
        return {
            "ok": True,
            "user_id": user_id,
            "is_member": True,
            "membership_started_at": iso_now,
            "membership_expires_at": iso_exp,
        }
    finally:
        conn.close()


def list_users(limit: int = 50, offset: int = 0) -> list[dict]:
    limit = max(1, min(int(limit), 200))
    offset = max(0, int(offset))
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, provider, provider_id, email, nickname, created_at, last_login
            FROM users
            ORDER BY id DESC
            LIMIT %s OFFSET %s
            """,
            (limit, offset),
        )
        rows = cur.fetchall()
        return [
            {
                "id": int(r[0]),
                "provider": r[1] or "",
                "providerId": r[2] or "",
                "email": (r[3] or "").strip() or None,
                "nickname": (r[4] or "").strip() or None,
                "createdAt": r[5],
                "lastLogin": r[6],
            }
            for r in rows
        ]
    finally:
        conn.close()
