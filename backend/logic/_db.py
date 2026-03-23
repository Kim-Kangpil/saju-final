"""DB 연결 헬퍼 — DATABASE_URL 환경변수가 있으면 PostgreSQL(psycopg2), 없으면 SQLite."""

import os
import sqlite3
from pathlib import Path

DATABASE_URL: str = os.getenv("DATABASE_URL", "").strip()
USE_PG: bool = bool(DATABASE_URL)


def sqlite_conn(db_path: Path):
    """SQLite 연결 반환 (row_factory 포함)."""
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def pg_conn():
    """psycopg2 PostgreSQL 연결 반환."""
    import psycopg2
    return psycopg2.connect(DATABASE_URL)


def get_conn(db_path: Path):
    """환경에 맞는 DB 연결 반환."""
    if USE_PG:
        return pg_conn()
    return sqlite_conn(db_path)


def adapt(sql: str) -> str:
    """PostgreSQL용: ? 플레이스홀더를 %s로 변환."""
    if USE_PG:
        return sql.replace("?", "%s")
    return sql
