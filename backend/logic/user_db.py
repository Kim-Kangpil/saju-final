# backend/logic/user_db.py
"""사용자 저장용 SQLite (카카오/구글/이메일 로그인)."""
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta

DB_DIR = Path(__file__).resolve().parent
USERS_DB = DB_DIR / "users.db"


def get_conn():
    return sqlite3.connect(USERS_DB)


def init_user_db():
    conn = get_conn()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                provider TEXT NOT NULL,
                provider_id TEXT NOT NULL,
                email TEXT,
                nickname TEXT,
                created_at TEXT NOT NULL,
                last_login TEXT NOT NULL,
                UNIQUE(provider, provider_id)
            )
        """)
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_provider_id ON users(provider, provider_id)"
        )
        conn.commit()
        # 씨앗 잔액 컬럼 (기존 DB에 없으면 추가)
        try:
            conn.execute("ALTER TABLE users ADD COLUMN seed_balance INTEGER DEFAULT 0")
            conn.commit()
        except sqlite3.OperationalError:
            pass  # column already exists
        for col_sql in (
            "ALTER TABLE users ADD COLUMN is_member INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN membership_started_at TEXT",
            "ALTER TABLE users ADD COLUMN membership_expires_at TEXT",
        ):
            try:
                conn.execute(col_sql)
                conn.commit()
            except sqlite3.OperationalError:
                pass
    finally:
        conn.close()


def get_or_create_user(
    provider: str,
    provider_id: str,
    email: str | None = None,
    nickname: str | None = None,
) -> int:
    """
    provider + provider_id로 유저 조회.
    없으면 INSERT, 있으면 last_login만 UPDATE 후 id 반환.
    """
    now = datetime.utcnow().isoformat()
    conn = get_conn()
    try:
        cur = conn.execute(
            "SELECT id FROM users WHERE provider = ? AND provider_id = ?",
            (provider, provider_id),
        )
        row = cur.fetchone()
        if row:
            user_id = row[0]
            conn.execute(
                "UPDATE users SET last_login = ? WHERE id = ?",
                (now, user_id),
            )
            conn.commit()
            return user_id
        conn.execute(
            "INSERT INTO users (provider, provider_id, email, nickname, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)",
            (provider, provider_id, email or "", nickname or "", now, now),
        )
        conn.commit()
        cur = conn.execute("SELECT last_insert_rowid()")
        return cur.fetchone()[0]
    finally:
        conn.close()


def get_user_id_from_session(session_value: str) -> int | None:
    """
    hsaju_session 쿠키 값을 파싱해 user_id(DB id)를 반환합니다.
    - 숫자만 있으면 해당 값을 user_id로 사용
    - "kakao:123" 형태면 users 테이블에서 provider+provider_id로 조회 후 id 반환
    """
    if not session_value or not session_value.strip():
        return None
    s = session_value.strip()

    # 숫자만 있으면 user_id로 사용 (auth_kakao에서 설정한 DB id)
    try:
        uid = int(s)
        if uid > 0:
            return uid
    except (ValueError, TypeError):
        pass

    # "kakao:123" 형태
    if s.startswith("kakao:"):
        provider_id = s[6:].strip()
        if provider_id:
            conn = get_conn()
            try:
                cur = conn.execute(
                    "SELECT id FROM users WHERE provider = 'kakao' AND provider_id = ?",
                    (provider_id,),
                )
                row = cur.fetchone()
                return int(row[0]) if row else None
            finally:
                conn.close()
    return None


def get_user_by_id(user_id: int) -> dict | None:
    """user_id로 사용자 정보(provider, email, nickname) 반환."""
    if not user_id:
        return None
    conn = get_conn()
    try:
        cur = conn.execute(
            "SELECT provider, email, nickname FROM users WHERE id = ?",
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
    """user_id의 씨앗 잔액 반환. 컬럼 없으면 0."""
    if not user_id:
        return 0
    conn = get_conn()
    try:
        cur = conn.execute(
            "SELECT seed_balance FROM users WHERE id = ?",
            (user_id,),
        )
        row = cur.fetchone()
        if not row:
            return 0
        try:
            return int(row[0]) if row[0] is not None else 0
        except (TypeError, ValueError):
            return 0
    except sqlite3.OperationalError:
        return 0  # seed_balance column missing
    finally:
        conn.close()


def deduct_seed(user_id: int, amount: int = 1) -> tuple[bool, int]:
    """
    user_id의 씨앗을 amount만큼 차감합니다.
    Returns: (success, remaining_balance)
    """
    if not user_id or amount < 1:
        return False, get_seed_balance(user_id or 0)
    current = get_seed_balance(user_id)
    if current < amount:
        return False, current
    conn = get_conn()
    try:
        conn.execute(
            "UPDATE users SET seed_balance = seed_balance - ? WHERE id = ?",
            (amount, user_id),
        )
        conn.commit()
        return True, current - amount
    except sqlite3.OperationalError:
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
    """
    SQLite users 행 기준 멤버십 상태.
    membership_expires_at이 현재(UTC)보다 이전이면 is_member=0으로 갱신 후 반환.
    """
    if not user_id:
        return {"is_member": False, "membership_started_at": None, "membership_expires_at": None}
    conn = get_conn()
    try:
        cur = conn.execute(
            """
            SELECT is_member, membership_started_at, membership_expires_at
            FROM users WHERE id = ?
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
            conn.execute("UPDATE users SET is_member = 0 WHERE id = ?", (user_id,))
            conn.commit()
            is_m = False
        return {
            "is_member": is_m,
            "membership_started_at": started,
            "membership_expires_at": expires,
        }
    except sqlite3.OperationalError:
        return {"is_member": False, "membership_started_at": None, "membership_expires_at": None}
    finally:
        conn.close()


def activate_membership(user_id: int, months: int) -> dict:
    """
    is_member=1, membership_started_at=지금(UTC), membership_expires_at=지금+months×30일(근사).
    """
    if not user_id or months < 1:
        raise ValueError("user_id와 months(>=1)가 필요합니다.")
    months = min(int(months), 120)
    now = datetime.utcnow()
    expires = now + timedelta(days=30 * months)
    iso_now = now.isoformat()
    iso_exp = expires.isoformat()
    conn = get_conn()
    try:
        cur = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not cur.fetchone():
            raise LookupError("user not found")
        conn.execute(
            """
            UPDATE users SET
                is_member = 1,
                membership_started_at = ?,
                membership_expires_at = ?
            WHERE id = ?
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
    """관리자용: 유저 목록 반환(개인정보 포함)."""
    limit = max(1, min(int(limit), 200))
    offset = max(0, int(offset))

    conn = get_conn()
    try:
        cur = conn.execute(
            """
            SELECT id, provider, provider_id, email, nickname, created_at, last_login
            FROM users
            ORDER BY id DESC
            LIMIT ? OFFSET ?
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
