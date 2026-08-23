import asyncio
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_query_api_contract_success(client: AsyncClient, seed_demo_corpus):
    """Verify /api/query contract returns grounded answer, evidence IDs, and provenance."""
    await asyncio.sleep(1.0)
    payload = {
        "question": "What is database replication used for?",
        "limit": 3
    }
    response = await client.post("/api/query", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "answer" in data
    assert isinstance(data["answer"], str)
    assert len(data["answer"]) > 0

    assert "evidence" in data
    assert isinstance(data["evidence"], list)
    assert len(data["evidence"]) <= 15

    # Check evidence structure
    for ev in data["evidence"]:
        assert "id" in ev
        assert "source_id" in ev
        assert "modality" in ev
        assert "content" in ev
        assert "distance" in ev
        assert "confidence_tier" in ev or "similarity" in ev
        assert "page_number" in ev or "start_time" in ev

    # Check answer mentions replication or read scalability / fault tolerance
    answer_lower = data["answer"].lower()
    assert any(term in answer_lower for term in ["replication", "read", "scalability", "fault", "replica"])


@pytest.mark.asyncio
async def test_query_api_speech_multimodal_evidence(client: AsyncClient, seed_demo_corpus):
    """Verify query retrieves and grounds from speech transcript with timestamps."""
    await asyncio.sleep(1.5)
    payload = {
        "question": "What did Alice recommend regarding Redis?",
        "limit": 3
    }
    response = await client.post("/api/query", json=payload)
    assert response.status_code == 200
    data = response.json()

    # The top evidence should be speech modality with start_time and end_time
    evidence_modalities = [e["modality"] for e in data["evidence"]]
    assert "speech" in evidence_modalities

    speech_item = next(e for e in data["evidence"] if e["modality"] == "speech")
    assert speech_item["start_time"] is not None
    assert speech_item["start_time"] == 12.5

    answer_lower = data["answer"].lower()
    assert "redis" in answer_lower or "caching" in answer_lower or "latency" in answer_lower


@pytest.mark.asyncio
async def test_unknown_questions_grounding(client: AsyncClient, seed_demo_corpus):
    """A8: Verify questions with no evidence in corpus return insufficient information response without fabricating."""
    unknown_questions = [
        "What was the speaker's salary?",
        "What was the exact implementation budget?",
        "What laptop was used?",
        "What cloud bill was paid?",
        "What was the CEO's personal home address?"
    ]

    for q in unknown_questions:
        await asyncio.sleep(4.0)
        response = await client.post("/api/query", json={"question": q, "limit": 3})
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        ans = data["answer"].lower()
        # System should clearly indicate insufficient information or inability to answer from context
        assert any(phrase in ans for phrase in [
            "not contain enough information",
            "not mentioned",
            "no information",
            "does not provide",
            "cannot answer",
            "insufficient",
            "not found"
        ]), f"Failed on question: '{q}', answer was: '{data['answer']}'"
