# backend/logic/payment_db.py
"""결제 내역 저장용 DB — DATABASE_URL 있으면 PostgreSQL, 없으면 SQLite."""
from pathlib import Path
from datetime import datetime

from logic._db import USE_PG, get_conn, adapt

DB_PATH = Path(__file__).resolve().parent / "payments.db"


def _conn():
    return get_conn(DB_PATH)


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


def save_pending_payment(order_id: str, user_id: int, order_type: str, tid: str) -> None:
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
        cur.execute(
            adapt("""
            INSERT INTO pending_payments (order_id, user_id, order_type, tid, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(order_id) DO UPDATE SET
              tid = EXCLUDED.tid, order_type = EXCLUDED.order_type
            """),
            (order_id, user_id, order_type, tid, now),
        )
        conn.commit()
    finally:
        conn.close()


def get_pending_payment(order_id: str) -> dict | None:
    conn = _conn()
    try:
        cur = conn.cursor()
        try:
            cur.execute(
                adapt("SELECT user_id, order_type, tid FROM pending_payments WHERE order_id = ?"),
                (order_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            return {"user_id": int(row[0]), "order_type": row[1], "tid": row[2]}
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
