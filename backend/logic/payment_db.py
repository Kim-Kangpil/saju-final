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
