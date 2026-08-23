import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database.models import Evidence, Source
from backend.app.services.embeddings import generate_embedding


async def search_evidence(
    session: AsyncSession,
    query: str,
    limit: int = 5,
    modalities: list[str] = None,
    project_id: Optional[uuid.UUID] = None,
) -> list[tuple[Evidence, float]]:
    """Retrieve the most relevant evidence for a given query scoped to a project."""
    if not query or not query.strip():
        return []

    # Generate embedding for the query
    query_embedding = generate_embedding(query.strip())

    distance_col = Evidence.embedding.cosine_distance(query_embedding).label("distance")

    stmt = select(Evidence, distance_col).where(Evidence.embedding.isnot(None))

    if project_id:
        stmt = stmt.join(Source, Evidence.source_id == Source.id).where(Source.project_id == project_id)

    # Cosine distance search using pgvector
    if modalities:
        # Direct filtered query (e.g. Text-Only baseline)
        stmt = stmt.where(Evidence.modality.in_(modalities))
        result = await session.execute(
            stmt.order_by(distance_col.asc()).limit(limit)
        )
        rows = result.all()
        evidence_with_scores = [(row[0], float(row[1])) for row in rows]
    else:
        # Multimodal balanced retrieval: ensure visual/media and document evidence both get represented
        visual_stmt = select(Evidence, distance_col).where(Evidence.embedding.isnot(None))
        doc_stmt = select(Evidence, distance_col).where(Evidence.embedding.isnot(None))

        if project_id:
            visual_stmt = visual_stmt.join(Source, Evidence.source_id == Source.id).where(Source.project_id == project_id)
            doc_stmt = doc_stmt.join(Source, Evidence.source_id == Source.id).where(Source.project_id == project_id)

        visual_stmt = visual_stmt.where(Evidence.modality.in_(["frame", "speech"]))
        doc_stmt = doc_stmt.where(Evidence.modality.in_(["pdf_text", "ocr", "image"]))

        k_each = max(1, (limit + 1) // 2)
        vis_res = await session.execute(visual_stmt.order_by(distance_col.asc()).limit(k_each))
        doc_res = await session.execute(doc_stmt.order_by(distance_col.asc()).limit(k_each))

        combined = vis_res.all() + doc_res.all()
        seen_ids = set()
        deduped = []
        for row in combined:
            if row[0].id not in seen_ids:
                seen_ids.add(row[0].id)
                deduped.append((row[0], float(row[1])))

        # Sort by distance
        deduped.sort(key=lambda x: x[1])
        evidence_with_scores = deduped[:limit]

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

