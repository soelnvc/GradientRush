"""Vector search and retrieval."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database.models import Evidence
from backend.app.services.embeddings import generate_embedding


async def search_evidence(session: AsyncSession, query: str, limit: int = 5) -> list[tuple[Evidence, float]]:
    """Retrieve the most relevant evidence for a given query along with cosine distance."""
    if not query or not query.strip():
        return []

    # Generate embedding for the query
    query_embedding = generate_embedding(query.strip())

    distance_col = Evidence.embedding.cosine_distance(query_embedding).label("distance")

    # Cosine distance search using pgvector
    # smaller distance = higher similarity
    result = await session.execute(
        select(Evidence, distance_col)
        .where(Evidence.embedding.isnot(None))
        .order_by(distance_col.asc())
        .limit(limit)
    )

    rows = result.all()
    evidence_with_scores = [(row[0], float(row[1])) for row in rows]

    # Level 5 Debug Output requirement
    print("\n" + "=" * 50)
    print(f"RETRIEVAL DEBUG OUTPUT for query: '{query}'")
    print("=" * 50)
    for i, (e, dist) in enumerate(evidence_with_scores):
        print(f"\n[Result {i+1}] ID: {e.id} | Source: {e.source_id} | Modality: {e.modality.value} | Cosine Distance: {dist:.4f}")
        print(f"Content snippet: {e.content[:150]}...")
        if e.start_time is not None:
            print(f"Time: {e.start_time}s - {e.end_time}s")
        if e.page_number is not None:
            print(f"Page: {e.page_number}")
    print("=" * 50 + "\n")

    return evidence_with_scores

