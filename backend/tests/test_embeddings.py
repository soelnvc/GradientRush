"""A2 & A3. Evidence Integrity and Embedding Tests."""

import math
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.database.models import Evidence, Source
from backend.app.services.embeddings import generate_embedding, get_embedding_model


def test_embedding_generation():
    """Verify embedding generation produces 384-dimensional non-empty vector."""
    text = "Database replication improves read performance."
    emb = generate_embedding(text)
    assert isinstance(emb, list)
    assert len(emb) == 384
    assert all(isinstance(x, float) for x in emb)
    assert not any(math.isnan(x) or math.isinf(x) for x in emb)


def test_multiple_embeddings_distinct():
    """Verify different texts produce distinct vector representations."""
    emb1 = generate_embedding("Cats and dogs are domestic animals.")
    emb2 = generate_embedding("Quantum computing uses qubits for quantum entanglement.")
    assert emb1 != emb2


@pytest.mark.asyncio
async def test_evidence_integrity_in_database(session: AsyncSession, seed_demo_corpus):
    """Verify all evidence objects in the database adhere to the evidence integrity contract."""
    result = await session.execute(select(Evidence))
    items = result.scalars().all()
    assert len(items) >= len(seed_demo_corpus)

    for ev in items:
        # A2: Evidence integrity
        assert ev.id is not None
        assert ev.source_id is not None
        assert ev.modality is not None
        assert ev.content and len(ev.content.strip()) > 0
        assert ev.confidence is not None and 0.0 <= ev.confidence <= 1.0

        # Provenance validity
        if ev.start_time is not None:
            assert isinstance(ev.start_time, (int, float))
            assert ev.start_time >= 0.0
        if ev.page_number is not None:
            assert isinstance(ev.page_number, int)
            assert ev.page_number >= 1

        # A3: Embedding integrity
        assert ev.embedding is not None
        emb_list = list(ev.embedding)
        assert len(emb_list) == 384
        assert not any(math.isnan(x) for x in emb_list)
        assert not any(math.isinf(x) for x in emb_list)
