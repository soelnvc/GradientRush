"""Database connection and session management."""

import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://gradientrush:gradientrush_dev@localhost:5432/knowledge_engine")

engine = create_async_engine(DATABASE_URL, poolclass=NullPool, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncSession:
    """Dependency for FastAPI endpoints."""
    async with async_session() as session:
        yield session


async def init_db():
    """Create all tables and enable pgvector extension."""
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        from backend.app.database.models import Source, Evidence, EvidenceRelationship  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
