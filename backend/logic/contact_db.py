# backend/logic/contact_db.py
"""문의하기 저장용 DB (SQLite)."""
import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent / "contact.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_contact_db():
    conn = get_conn()
    try:
        cur = conn.cursor()
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
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO inquiries (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)",
            (name.strip(), email.strip(), subject.strip(), message.strip(), now),
        )
        new_id = cur.lastrowid
        conn.commit()
        return new_id
    finally:
        conn.close()
