# backend/logic/payment_db.py
"""결제 내역 저장용 DB (SQLite)."""
import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent / "payments.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_payments_db():
    conn = get_conn()
    try:
        cur = conn.cursor()
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
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO payments (user_id, payment_id, order_id, status, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, payment_id, order_id, status, datetime.utcnow().isoformat()),
        )
        conn.commit()
    finally:
        conn.close()
