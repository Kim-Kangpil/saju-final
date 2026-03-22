# backend/logic/contact_db.py
"""문의하기 저장용 DB (PostgreSQL)."""
import psycopg2
from datetime import datetime

from config import DATABASE_URL


def get_conn():
    return psycopg2.connect(DATABASE_URL)


def init_contact_db():
    conn = get_conn()
    try:
        cur = conn.cursor()
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
        conn.commit()
    finally:
        conn.close()


def save_inquiry(name: str, email: str, subject: str, message: str) -> int:
    now = datetime.utcnow().isoformat()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO inquiries (name, email, subject, message, created_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (name.strip(), email.strip(), subject.strip(), message.strip(), now),
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return new_id
    finally:
        conn.close()
