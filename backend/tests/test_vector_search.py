"""A4. Vector Search Tests."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.retrieval.search import search_evidence


@pytest.mark.asyncio
async def test_vector_search_execution(session: AsyncSession, seed_demo_corpus):
    """Verify vector search executes and returns relevant results with cosine distances."""
    query = "What is database replication used for?"
    results = await search_evidence(session, query, limit=3)

    assert len(results) > 0
    assert len(results) <= 3

    # Results contain (Evidence, distance)
    for ev, dist in results:
        assert ev.id is not None
        assert isinstance(dist, float)
        assert 0.0 <= dist <= 2.0  # Cosine distance range [0, 2]

    # Verify results are sorted in ascending order of cosine distance (most similar first)
    distances = [dist for _, dist in results]
    assert distances == sorted(distances)

    # Top result should be the replication evidence
    top_ev = results[0][0]
    assert "replication" in top_ev.content.lower()


@pytest.mark.asyncio
async def test_vector_search_top_k_respected(session: AsyncSession, seed_demo_corpus):
    """Verify limit / top_k parameter is strictly respected."""
    results_1 = await search_evidence(session, "database", limit=1)
    assert len(results_1) == 1

    results_4 = await search_evidence(session, "database", limit=4)
    assert len(results_4) == 4


@pytest.mark.asyncio
async def test_vector_search_no_duplicates(session: AsyncSession, seed_demo_corpus):
    """Verify duplicate evidence IDs are not returned."""
    results = await search_evidence(session, "database architecture", limit=5)
    ids = [ev.id for ev, _ in results]
    assert len(ids) == len(set(ids))


@pytest.mark.asyncio
async def test_vector_search_empty_query(session: AsyncSession):
    """Verify empty or whitespace queries return an empty list."""
    assert await search_evidence(session, "") == []
    assert await search_evidence(session, "   ") == []
