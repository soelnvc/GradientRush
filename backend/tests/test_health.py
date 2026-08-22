"""A1. Infrastructure Tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    """Verify /health returns HTTP 200 with service metadata."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data


@pytest.mark.asyncio
async def test_database_connection(session: AsyncSession):
    """Verify database connection and simple query."""
    result = await session.execute(text("SELECT 1"))
    assert result.scalar() == 1


@pytest.mark.asyncio
async def test_pgvector_extension(session: AsyncSession):
    """Verify pgvector extension exists and is enabled."""
    result = await session.execute(
        text("SELECT extname FROM pg_extension WHERE extname = 'vector'")
    )
    row = result.scalar_one_or_none()
    assert row == "vector"


@pytest.mark.asyncio
async def test_embedding_column_dimension(session: AsyncSession):
    """Verify evidence embedding column is 384 dimensions."""
    result = await session.execute(
        text("""
            SELECT atttypmod 
            FROM pg_attribute 
            WHERE attrelid = 'evidence'::regclass AND attname = 'embedding'
        """)
    )
    typmod = result.scalar_one_or_none()
    # typmod for Vector(384) is 384
    assert typmod == 384
