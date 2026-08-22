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
    """Create all tables, enable pgvector extension, and initialize default workspace."""
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        from backend.app.database.models import Project, Source, Evidence, EvidenceRelationship  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)

        # Migration: ensure project_id column exists on sources
        await conn.execute(
            text(
                "ALTER TABLE sources ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE"
            )
        )

        # Ensure default project exists
        default_project_id = "00000000-0000-0000-0000-000000000000"
        await conn.execute(
            text(
                """
                INSERT INTO projects (id, name, description, created_at)
                VALUES (:id, 'System Design Workspace', 'Default workspace for system architecture, video, and documents', NOW())
                ON CONFLICT (id) DO NOTHING
                """
            ),
            {"id": default_project_id},
        )

        # Assign existing legacy sources without a project_id to the default workspace
        await conn.execute(
            text(
                "UPDATE sources SET project_id = :id WHERE project_id IS NULL"
            ),
            {"id": default_project_id},
        )
