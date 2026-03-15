"""
비동기 DB 연결 (Supabase PostgreSQL).
DATABASE_URL이 없으면 엔진을 만들지 않음. Phase 2 이후 Repository에서 사용.
"""
from collections.abc import AsyncGenerator
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from config import DATABASE_URL
from sqlmodel import SQLModel

# 엔진·세션: DATABASE_URL 있을 때만 생성
_engine: Optional[AsyncEngine] = None
_async_session_factory: Optional[async_sessionmaker[AsyncSession]] = None


def get_engine() -> Optional[AsyncEngine]:
    """비동기 엔진. DATABASE_URL 없으면 None."""
    global _engine
    if _engine is not None:
        return _engine
    if not DATABASE_URL or not DATABASE_URL.strip():
        return None
    # postgresql+asyncpg://...
    url = DATABASE_URL.strip()
    if url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    _engine = create_async_engine(
        url,
        echo=False,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )
    return _engine


def get_async_session_factory() -> Optional[async_sessionmaker[AsyncSession]]:
    """비동기 세션 팩토리. FastAPI Depends에서 사용."""
    global _async_session_factory
    if _async_session_factory is not None:
        return _async_session_factory
    engine = get_engine()
    if engine is None:
        return None
    _async_session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    return _async_session_factory


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI Depends용. 요청마다 세션 생성 후 닫음."""
    factory = get_async_session_factory()
    if factory is None:
        raise RuntimeError("DATABASE_URL가 설정되지 않았습니다. .env에 DATABASE_URL를 넣어주세요.")
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db_create_tables():
    """모든 SQLModel 테이블 생성 (Supabase에 테이블이 없을 때 한 번 실행)."""
    engine = get_engine()
    if engine is None:
        return
    # SQLModel.metadata에 등록된 테이블만 생성
    from models import Inquiry, Payment, Saju, User  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(lambda sync_conn: SQLModel.metadata.create_all(sync_conn))
