"""Relationship expansion at retrieval."""

from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from backend.app.database.models import Evidence, EvidenceRelationship


async def expand_evidence(
    session: AsyncSession, 
    initial_evidence: List[Tuple[Evidence, float]],
    max_results: int = 12
) -> List[Tuple[Evidence, float, str]]:
    """
    Expand the initial evidence set by traversing one hop of relationships,
    then deduplicate and rank by semantic similarity, hop penalty, relationship type,
    and modality diversity (PDF + Speech + Frame) to select the top 10-15 best candidates.
    """
    if not initial_evidence:
        return []

    initial_ids = {e.id for e, _ in initial_evidence}
    all_candidates = []
    seen_ids = set()

    # 1. Add direct retrieval items (0 hop penalty)
    for e, dist in initial_evidence:
        if e.id not in seen_ids:
            seen_ids.add(e.id)
            all_candidates.append((e, dist, "Direct retrieval"))

    # 2. Query one hop relationships
    result = await session.execute(
        select(EvidenceRelationship)
        .options(joinedload(EvidenceRelationship.target_evidence))
        .where(EvidenceRelationship.source_evidence_id.in_(initial_ids))
    )
    relationships = result.scalars().all()

    initial_dict = {e.id: (e, dist) for e, dist in initial_evidence}

    # 3. Process expanded items with relationship strength weighting
    for rel in relationships:
        if not rel.target_evidence:
            continue
        if rel.target_evidence_id not in seen_ids:
            seen_ids.add(rel.target_evidence_id)
            source_e, orig_dist = initial_dict[rel.source_evidence_id]

            # Relationship strength bonus/penalty:
            # Temporally aligned in same time window is tighter (+0.06 penalty)
            # Same topic across entities is slightly broader (+0.10 penalty)
            rel_val = rel.relationship_type.value if hasattr(rel.relationship_type, "value") else str(rel.relationship_type)
            hop_penalty = 0.06 if rel_val == "temporally_aligned" else 0.10
            effective_dist = orig_dist + hop_penalty

            chain = f"Expanded via {rel_val} from {source_e.modality.value}"
            all_candidates.append((rel.target_evidence, effective_dist, chain))

    # 4. Modality-Balanced Diversity Reranking to select top 10-15
    all_candidates.sort(key=lambda x: x[1])

    modality_counts = {}
    selected = []
    deferred = []
    max_per_modality = max(4, max_results // 3 + 1)

    for item in all_candidates:
        mod = item[0].modality.value
        mod_count = modality_counts.get(mod, 0)
        if mod_count < max_per_modality and len(selected) < max_results:
            selected.append(item)
            modality_counts[mod] = mod_count + 1
        else:
            deferred.append(item)

    while len(selected) < max_results and deferred:
        selected.append(deferred.pop(0))

    selected.sort(key=lambda x: x[1])
    return selected
