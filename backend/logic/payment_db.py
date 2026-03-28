# backend/logic/payment_db.py
"""결제 내역 저장용 DB — DATABASE_URL 있으면 PostgreSQL, 없으면 SQLite."""
from pathlib import Path
from datetime import datetime
from typing import Any, Optional

from logic._db import USE_PG, get_conn, adapt

DB_PATH = Path(__file__).resolve().parent / "payments.db"


def _conn():
    return get_conn(DB_PATH)


def normalize_saju_id_from_client(raw: Any) -> Optional[int]:
    """프론트 saju_id ('srv-123', '123') → DB 정수 id. 실패 시 None."""
    if raw is None:
        return None
    s = str(raw).strip()
    if not s:
        return None
    if s.lower().startswith("srv-"):
        s = s[4:]
    try:
        return int(s)
    except ValueError:
        return None


def _migrate_pending_payments_saju_id(cur) -> None:
    if USE_PG:
        cur.execute(
            "ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS saju_id INTEGER"
        )
    else:
        try:
            cur.execute("ALTER TABLE pending_payments ADD COLUMN saju_id INTEGER")
        except Exception:
            pass


def _migrate_purchased_reports_saju_id(cur) -> None:
    if USE_PG:
        cur.execute(
            "ALTER TABLE purchased_reports ADD COLUMN IF NOT EXISTS saju_id INTEGER"
        )
    else:
        try:
            cur.execute("ALTER TABLE purchased_reports ADD COLUMN saju_id INTEGER")
        except Exception:
            pass


def init_payments_db():
    conn = _conn()
    try:
        cur = conn.cursor()
        if USE_PG:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS payments (
                    id BIGSERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    payment_id TEXT NOT NULL,
                    order_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
        else:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    payment_id TEXT NOT NULL,
                    order_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
        cur.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)"
        )
        conn.commit()
    finally:
        conn.close()


def save_pending_payment(
    order_id: str,
    user_id: int,
    order_type: str,
    tid: str,
    saju_id: Optional[int] = None,
) -> None:
    """카카오페이 ready 후 tid·order_type 임시 저장."""
    now = datetime.utcnow().isoformat()
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS pending_payments (
                order_id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                order_type TEXT NOT NULL,
                tid TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        _migrate_pending_payments_saju_id(cur)
        cur.execute(
            adapt("""
            INSERT INTO pending_payments (order_id, user_id, order_type, tid, created_at, saju_id)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(order_id) DO UPDATE SET
              tid = excluded.tid,
              order_type = excluded.order_type,
              saju_id = excluded.saju_id
            """),
            (order_id, user_id, order_type, tid, now, saju_id),
        )
        conn.commit()
    finally:
        conn.close()


def get_pending_payment(order_id: str) -> dict | None:
    conn = _conn()
    try:
        cur = conn.cursor()
        try:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS pending_payments (
                    order_id TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    order_type TEXT NOT NULL,
                    tid TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
            _migrate_pending_payments_saju_id(cur)
            conn.commit()
            cur.execute(
                adapt(
                    "SELECT user_id, order_type, tid, saju_id FROM pending_payments WHERE order_id = ?"
                ),
                (order_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            sid = row[3]
            saju_id = int(sid) if sid is not None else None
            return {
                "user_id": int(row[0]),
                "order_type": row[1],
                "tid": row[2],
                "saju_id": saju_id,
            }
        except Exception:
            return None
    finally:
        conn.close()


def save_payment(user_id: str, payment_id: str, order_id: str, status: str = "paid"):
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(
            adapt("INSERT INTO payments (user_id, payment_id, order_id, status, created_at) VALUES (?, ?, ?, ?, ?)"),
            (user_id, payment_id, order_id, status, datetime.utcnow().isoformat()),
        )
        conn.commit()
    finally:
        conn.close()


def _ensure_purchased_reports_table(cur) -> None:
    if USE_PG:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS purchased_reports (
                id BIGSERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                report_type TEXT NOT NULL,
                amount INTEGER NOT NULL,
                kakao_tid TEXT DEFAULT '',
                purchased_at TEXT NOT NULL
            )
        """)
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_pr_user_type ON purchased_reports(user_id, report_type)"
        )
    else:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS purchased_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                report_type TEXT NOT NULL,
                amount INTEGER NOT NULL,
                kakao_tid TEXT DEFAULT '',
                purchased_at TEXT NOT NULL
            )
        """)
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_pr_user_type ON purchased_reports(user_id, report_type)"
        )
    _migrate_purchased_reports_saju_id(cur)


def save_purchased_report(
    user_id: int,
    report_type: str,
    amount: int,
    tid: str = "",
    saju_id: Optional[int] = None,
) -> None:
    """리포트 단건 구매 저장."""
    now = datetime.utcnow().isoformat()
    conn = _conn()
    try:
        cur = conn.cursor()
        _ensure_purchased_reports_table(cur)
        cur.execute(
            adapt(
                "INSERT INTO purchased_reports (user_id, report_type, amount, kakao_tid, purchased_at, saju_id) VALUES (?, ?, ?, ?, ?, ?)"
            ),
            (user_id, report_type, amount, tid, now, saju_id),
        )
        conn.commit()
    finally:
        conn.close()


def has_purchased_report(user_id: int, report_type: str) -> bool:
    """해당 유저가 report_type 리포트를 구매한 적 있는지 확인."""
    try:
        conn = _conn()
        try:
            cur = conn.cursor()
            _ensure_purchased_reports_table(cur)
            conn.commit()
            cur.execute(
                adapt("SELECT id FROM purchased_reports WHERE user_id = ? AND report_type = ? LIMIT 1"),
                (user_id, report_type),
            )
            return cur.fetchone() is not None
        finally:
            conn.close()
    except Exception:
        return False


def get_purchased_reports(user_id: int) -> list:
    """유저의 구매 리포트 목록 반환 (최신순)."""
    try:
        conn = _conn()
        try:
            cur = conn.cursor()
            _ensure_purchased_reports_table(cur)
            conn.commit()
            cur.execute(
                adapt(
                    "SELECT id, report_type, amount, kakao_tid, purchased_at, saju_id FROM purchased_reports WHERE user_id = ? ORDER BY purchased_at DESC"
                ),
                (user_id,),
            )
            rows = cur.fetchall()
            out = []
            for r in rows:
                sid = r[5]
                out.append(
                    {
                        "id": int(r[0]),
                        "report_type": r[1],
                        "amount": r[2],
                        "tid": r[3],
                        "purchased_at": r[4],
                        "saju_id": int(sid) if sid is not None else None,
                    }
                )
            return out
        finally:
            conn.close()
    except Exception:
        return []
