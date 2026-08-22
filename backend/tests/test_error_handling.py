"""A9. Error Handling and Edge Case Tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_empty_query_rejected(client: AsyncClient):
    """Verify empty or blank question strings return HTTP 400."""
    res1 = await client.post("/api/query", json={"question": ""})
    assert res1.status_code == 400

    res2 = await client.post("/api/query", json={"question": "   "})
    assert res2.status_code == 400


@pytest.mark.asyncio
async def test_invalid_limit_rejected(client: AsyncClient):
    """Verify limit < 1 or limit > 50 returns HTTP 422 or 400 validation error."""
    res_zero = await client.post("/api/query", json={"question": "test", "limit": 0})
    assert res_zero.status_code == 422

    res_negative = await client.post("/api/query", json={"question": "test", "limit": -5})
    assert res_negative.status_code == 422

    res_too_large = await client.post("/api/query", json={"question": "test", "limit": 100})
    assert res_too_large.status_code == 422


@pytest.mark.asyncio
async def test_malformed_request_body(client: AsyncClient):
    """Verify malformed payload returns HTTP 422."""
    res = await client.post("/api/query", json={"wrong_field": "test"})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_very_long_query_handled_gracefully(client: AsyncClient, seed_demo_corpus):
    """Verify very long queries (>2000 chars) are processed without crashing."""
    long_query = "What is database replication? " * 100
    res = await client.post("/api/query", json={"question": long_query, "limit": 3})
    assert res.status_code == 200
    assert "answer" in res.json()
