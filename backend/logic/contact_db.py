# backend/logic/contact_db.py
"""문의하기 저장용 SQLite."""
import sqlite3
from pathlib import Path
from datetime import datetime

DB_DIR = Path(__file__).resolve().parent
CONTACT_DB = DB_DIR / "contact.db"


def get_conn():
    return sqlite3.connect(CONTACT_DB)


def init_contact_db():
    conn = get_conn()
    try:
        conn.execute("""
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
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO inquiries (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)",
            (name.strip(), email.strip(), subject.strip(), message.strip(), now),
        )
        conn.commit()
        cur = conn.execute("SELECT last_insert_rowid()")
        return cur.fetchone()[0]
    finally:
        conn.close()
