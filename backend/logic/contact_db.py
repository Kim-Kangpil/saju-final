# backend/logic/contact_db.py
"""문의하기 저장용 DB — DATABASE_URL 있으면 PostgreSQL, 없으면 SQLite."""
from pathlib import Path
from datetime import datetime

from logic._db import USE_PG, get_conn, adapt

DB_PATH = Path(__file__).resolve().parent / "contact.db"


def _conn():
    return get_conn(DB_PATH)


def init_contact_db():
    conn = _conn()
    try:
        cur = conn.cursor()
        if USE_PG:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS inquiries (
                    id BIGSERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
        else:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS inquiries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
        conn.commit()
    finally:
        conn.close()


def save_inquiry(name: str, email: str, subject: str, message: str) -> int:
    now = datetime.utcnow().isoformat()
    conn = _conn()
    try:
        cur = conn.cursor()
        sql = adapt(
            "INSERT INTO inquiries (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)"
        )
        if USE_PG:
            sql += " RETURNING id"
        cur.execute(sql, (name.strip(), email.strip(), subject.strip(), message.strip(), now))
        new_id = cur.fetchone()[0] if USE_PG else cur.lastrowid
        conn.commit()
        return new_id
    finally:
        conn.close()
