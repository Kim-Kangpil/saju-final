# backend/logic/user_db.py
"""사용자 저장용 DB — DATABASE_URL 있으면 PostgreSQL, 없으면 SQLite."""
import sqlite3
import hashlib
import logging
import os
from pathlib import Path
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

from logic._db import USE_PG, get_conn, adapt

DB_PATH = Path(__file__).resolve().parent / "users.db"


def _conn():
    return get_conn(DB_PATH)


def init_user_db():
    conn = _conn()
    try:
        cur = conn.cursor()
        if USE_PG:
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
            # PostgreSQL: IF NOT EXISTS 지원 (9.6+)
            for col_sql in (
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS seed_balance INTEGER DEFAULT 0",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_member INTEGER DEFAULT 0",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_started_at TEXT",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_expires_at TEXT",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS report_credits INTEGER DEFAULT 0",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS beta_coupon_data TEXT",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT",
            ):
                cur.execute(col_sql)
        else:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            for col_sql in (
                "ALTER TABLE users ADD COLUMN seed_balance INTEGER DEFAULT 0",
                "ALTER TABLE users ADD COLUMN is_member INTEGER DEFAULT 0",
                "ALTER TABLE users ADD COLUMN membership_started_at TEXT",
                "ALTER TABLE users ADD COLUMN membership_expires_at TEXT",
                "ALTER TABLE users ADD COLUMN report_credits INTEGER DEFAULT 0",
                "ALTER TABLE users ADD COLUMN beta_coupon_data TEXT",
                "ALTER TABLE users ADD COLUMN password_hash TEXT",
            ):
                try:
                    cur.execute(col_sql)
                except Exception:
                    pass

        cur.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_provider_id ON users(provider, provider_id)"
        )
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
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT id FROM users WHERE provider = ? AND provider_id = ?"),
            (provider, provider_id),
        )
        row = cur.fetchone()
        if row:
            user_id = row[0]
            cur.execute(
                adapt("UPDATE users SET last_login = ? WHERE id = ?"),
                (now, user_id),
            )
            conn.commit()
            return user_id

        sql = adapt(
            "INSERT INTO users (provider, provider_id, email, nickname, created_at, last_login)"
            " VALUES (?, ?, ?, ?, ?, ?)"
        )
        if USE_PG:
            sql += " RETURNING id"
        cur.execute(sql, (provider, provider_id, email or "", nickname or "", now, now))
        new_id = cur.fetchone()[0] if USE_PG else cur.lastrowid
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
            conn = _conn()
            try:
                cur = conn.cursor()
                cur.execute(
                    adapt("SELECT id FROM users WHERE provider = 'kakao' AND provider_id = ?"),
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
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT provider, email, nickname FROM users WHERE id = ?"),
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
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT seed_balance FROM users WHERE id = ?"),
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
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("UPDATE users SET seed_balance = seed_balance - ? WHERE id = ?"),
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
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("""
            SELECT is_member, membership_started_at, membership_expires_at
            FROM users WHERE id = ?
            """),
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
            cur.execute(adapt("UPDATE users SET is_member = 0 WHERE id = ?"), (user_id,))
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
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(adapt("SELECT id FROM users WHERE id = ?"), (user_id,))
        if not cur.fetchone():
            raise LookupError("user not found")
        cur.execute(
            adapt("""
            UPDATE users SET
                is_member = 1,
                membership_started_at = ?,
                membership_expires_at = ?
            WHERE id = ?
            """),
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


def get_report_credits(user_id: int) -> int:
    if not user_id:
        return 0
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(adapt("SELECT report_credits FROM users WHERE id = ?"), (user_id,))
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


def add_report_credits(user_id: int, amount: int = 1) -> int:
    """분析권 N개 추가. 새 잔액 반환."""
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("UPDATE users SET report_credits = COALESCE(report_credits, 0) + ? WHERE id = ?"),
            (amount, user_id),
        )
        conn.commit()
        return get_report_credits(user_id)
    finally:
        conn.close()


def deduct_report_credit(user_id: int) -> tuple[bool, int]:
    """분析권 1개 차감. (success, remaining) 반환."""
    current = get_report_credits(user_id)
    if current < 1:
        return False, current
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("UPDATE users SET report_credits = report_credits - 1 WHERE id = ? AND report_credits > 0"),
            (user_id,),
        )
        conn.commit()
        return True, current - 1
    except Exception:
        conn.rollback()
        return False, current
    finally:
        conn.close()


def list_users(limit: int = 50, offset: int = 0) -> list[dict]:
    limit = max(1, min(int(limit), 200))
    offset = max(0, int(offset))
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("""
            SELECT id, provider, provider_id, email, nickname, created_at, last_login
            FROM users
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            """),
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


def save_beta_coupon(user_id: int, coupon_data: dict) -> None:
    """베타 쿠폰 데이터를 DB에 저장 (서버 재시작해도 유지)."""
    import json
    if not user_id:
        return
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("UPDATE users SET beta_coupon_data = ? WHERE id = ?"),
            (json.dumps(coupon_data), user_id),
        )
        conn.commit()
    except Exception:
        pass
    finally:
        conn.close()


def get_beta_coupon(user_id: int) -> dict | None:
    """DB에서 베타 쿠폰 데이터 조회."""
    import json
    if not user_id:
        return None
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(adapt("SELECT beta_coupon_data FROM users WHERE id = ?"), (user_id,))
        row = cur.fetchone()
        if not row or not row[0]:
            return None
        return json.loads(row[0])
    except Exception:
        return None
    finally:
        conn.close()


# ─────────────────────────────────────────────────────────────
# 이메일 회원가입 / 로그인
# ─────────────────────────────────────────────────────────────

def _hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 260000).hex()
    return f"{salt}:{hashed}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, hashed = stored.split(":", 1)
        return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 260000).hex() == hashed
    except Exception:
        return False


def create_email_user(email: str, password: str, nickname: str = "") -> int | None:
    """이메일 회원가입. 이미 존재하면 None 반환, 성공 시 user_id 반환."""
    now = datetime.utcnow().isoformat()
    pw_hash = _hash_password(password)
    conn = _conn()
    try:
        cur = conn.cursor()
        # 이미 같은 이메일로 가입된 계정 확인
        cur.execute(adapt("SELECT id FROM users WHERE provider = ? AND provider_id = ?"), ("email", email))
        if cur.fetchone():
            return None  # 이미 존재
        sql = adapt(
            "INSERT INTO users (provider, provider_id, email, nickname, password_hash, created_at, last_login)"
            " VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        if USE_PG:
            sql += " RETURNING id"
        cur.execute(sql, ("email", email, email, nickname or email.split("@")[0], pw_hash, now, now))
        new_id = cur.fetchone()[0] if USE_PG else cur.lastrowid
        conn.commit()
        return new_id
    except Exception:
        return None
    finally:
        conn.close()


def verify_email_login(email: str, password: str) -> int | None:
    """이메일 로그인 검증. 성공 시 user_id, 실패 시 None."""
    now = datetime.utcnow().isoformat()
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("SELECT id, password_hash FROM users WHERE provider = ? AND provider_id = ?"),
            ("email", email),
        )
        row = cur.fetchone()
        if not row:
            # email provider 로 없는 경우 — 다른 provider로 가입했는지 확인
            cur.execute(adapt("SELECT id, provider FROM users WHERE email = ?"), (email,))
            other = cur.fetchone()
            if other:
                logger.warning("login_fail email=%s: email provider row 없음, 실제 provider=%s id=%s", email, other[1], other[0])
            else:
                logger.warning("login_fail email=%s: 계정 자체 없음", email)
            return None
        user_id, pw_hash = row[0], row[1]
        if not pw_hash:
            logger.warning("login_fail email=%s user_id=%s: password_hash NULL (OAuth 계정?)", email, user_id)
            return None
        if not _verify_password(password, pw_hash):
            logger.warning("login_fail email=%s user_id=%s: 비밀번호 불일치", email, user_id)
            return None
        cur.execute(adapt("UPDATE users SET last_login = ? WHERE id = ?"), (now, user_id))
        conn.commit()
        return user_id
    except Exception as e:
        logger.error("verify_email_login DB 오류 email=%s: %s", email, e)
        return None
    finally:
        conn.close()
