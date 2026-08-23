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

    # Multi-aspect sub-queries for entity-dense technical queries
    import re
    clean_q = re.sub(r"[^\w\s-]", "", query)
    tokens = [w for w in clean_q.split() if len(w) > 3]
    subqueries = [query.strip()]

    if len(tokens) > 5:
        stopwords = {
            "what", "when", "where", "which", "that", "this", "about", "from",
            "with", "does", "show", "said", "being", "approx", "approximately",
            "same", "time", "point", "video", "reference", "described", "relate",
            "evidence", "visual", "material", "moments", "accompanying"
        }
        topic_words = [w for w in tokens if w.lower() not in stopwords]
        if topic_words:
            subqueries.append(" ".join(topic_words[:4]))
            if len(topic_words) > 2:
                subqueries.append(f"{topic_words[0]} {topic_words[1]}")

    all_found = []
    seen = set()

    for sub_q in subqueries:
        sub_emb = generate_embedding(sub_q)
        s_dist_col = Evidence.embedding.cosine_distance(sub_emb).label("distance")

        if modalities:
            stmt = select(Evidence, s_dist_col).where(Evidence.embedding.isnot(None), Evidence.modality.in_(modalities))
            if project_id:
                stmt = stmt.join(Source, Evidence.source_id == Source.id).where(Source.project_id == project_id)
            res = await session.execute(stmt.order_by(s_dist_col.asc()).limit(max(limit, 8)))
            for row in res.all():
                if row[0].id not in seen:
                    seen.add(row[0].id)
                    all_found.append((row[0], float(row[1])))
        else:
            # Parallel multi-modality retrieval across frames, speech, and documents
            f_stmt = select(Evidence, s_dist_col).where(Evidence.embedding.isnot(None), Evidence.modality == "frame")
            s_stmt = select(Evidence, s_dist_col).where(Evidence.embedding.isnot(None), Evidence.modality == "speech")
            d_stmt = select(Evidence, s_dist_col).where(Evidence.embedding.isnot(None), Evidence.modality.in_(["pdf_text", "ocr", "image"]))

            if project_id:
                f_stmt = f_stmt.join(Source, Evidence.source_id == Source.id).where(Source.project_id == project_id)
                s_stmt = s_stmt.join(Source, Evidence.source_id == Source.id).where(Source.project_id == project_id)
                d_stmt = d_stmt.join(Source, Evidence.source_id == Source.id).where(Source.project_id == project_id)

            k_sub = max(2, (limit + 1) // 2)
            f_res = await session.execute(f_stmt.order_by(s_dist_col.asc()).limit(k_sub))
            s_res = await session.execute(s_stmt.order_by(s_dist_col.asc()).limit(k_sub))
            d_res = await session.execute(d_stmt.order_by(s_dist_col.asc()).limit(k_sub))

            for row in f_res.all() + s_res.all() + d_res.all():
                if row[0].id not in seen:
                    seen.add(row[0].id)
                    all_found.append((row[0], float(row[1])))

    all_found.sort(key=lambda x: x[1])
    evidence_with_scores = all_found[:limit]

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

