import uuid
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.connection import get_session
from backend.app.retrieval.search import search_evidence
from backend.app.retrieval.expansion import expand_evidence
from backend.app.services.ai_provider import ai_provider

router = APIRouter(prefix="/api/query", tags=["query"])


def calculate_confidence_category(distance: float) -> str:
    """Classify retrieval vector distance into calibrated 7-tier confidence bands for dense embeddings."""
    if distance < 0.20:
        return "Full"
    elif distance < 0.32:
        return "Very High"
    elif distance < 0.44:
        return "High"
    elif distance < 0.58:
        return "Moderate"
    elif distance < 0.70:
        return "Low"
    elif distance < 0.85:
        return "Very Low"
    else:
        return "Zero"


class QueryRequest(BaseModel):
    question: str = Field(..., description="Query question")
    limit: int = Field(5, ge=1, le=50, description="Top-K evidence items to retrieve")
    text_only_baseline: bool = Field(False, description="If True, bypasses multimodal expansion and limits search to text")
    project_id: Optional[uuid.UUID] = Field(None, description="Optional Project ID to scope the query context")

@router.post("")
async def query_knowledge(
    request: QueryRequest,
    session: AsyncSession = Depends(get_session)
):
    """Level 7 & 8: Cross-Modal RAG query endpoint with Provenance and Project isolation."""
    q = request.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Question cannot be empty or blank")

    # 1. Retrieve initial evidence scoped to project
    try:
        modalities = ["pdf_text", "ocr"] if request.text_only_baseline else None
        initial_results = await search_evidence(
            session,
            q,
            request.limit,
            modalities=modalities,
            project_id=request.project_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval error: {str(e)}")

    if not initial_results:
        return {
            "answer": "The provided evidence does not contain enough information to answer.",
            "evidence": []
        }

    # 2. Expand evidence via relationships (Level 7) unless running text baseline (Level 11)
    if request.text_only_baseline:
        expanded_results = [(e, dist, "Direct retrieval (Text-Only)") for e, dist in initial_results]
    else:
        expanded_results = await expand_evidence(session, initial_results)

    # 3. Build context string
    context_parts = []
    for i, (e, dist, chain) in enumerate(expanded_results):
        context_parts.append(f"--- Evidence {i+1} [ID: {e.id}, Modality: {e.modality.value}] ---")
        context_parts.append(e.content)
        if e.start_time is not None:
            context_parts.append(f"Time: {e.start_time}s - {e.end_time}s" if e.end_time is not None else f"Time: {e.start_time}s")
        if e.page_number is not None:
            context_parts.append(f"Page: {e.page_number}")
        context_parts.append("")

    context_str = "\n".join(context_parts)

    # 4. Synthesize answer
    answer = ai_provider.synthesize_answer(q, context_str)

    # 5. Level 8: Format response with provenance, cosine distance, vector similarity, and confidence category
    return {
        "answer": answer,
        "evidence": [
            {
                "id": str(e.id),
                "source_id": str(e.source_id),
                "modality": e.modality.value,
                "content": e.content,
                "start_time": e.start_time,
                "end_time": e.end_time,
                "page_number": e.page_number,
                "frame_path": e.frame_path,
                "distance": round(dist, 4),
                "similarity": round(max(0.0, min(1.0, 1.0 - dist)), 4),
                "confidence_tier": calculate_confidence_category(dist),
                "chain": chain,
            }
            for e, dist, chain in expanded_results
        ]
    }

