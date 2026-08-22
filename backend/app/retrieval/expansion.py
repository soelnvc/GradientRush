"""Relationship expansion at retrieval."""

from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from backend.app.database.models import Evidence, EvidenceRelationship


async def expand_evidence(
    session: AsyncSession, 
    initial_evidence: List[Tuple[Evidence, float]]
) -> List[Tuple[Evidence, float, str]]:
    """
    Expand the initial evidence set by traversing one hop of relationships.
    Returns a list of tuples: (Evidence, distance, provenance_chain_string)
    """
    initial_ids = {e.id for e, _ in initial_evidence}
    expanded_results = []
    seen_ids = set(initial_ids)
    
    # 1. Add initial evidence to results (empty chain)
    for e, dist in initial_evidence:
        expanded_results.append((e, dist, "Direct retrieval"))
        
    if not initial_ids:
        return expanded_results

    # 2. Query one hop relationships
    result = await session.execute(
        select(EvidenceRelationship)
        .options(joinedload(EvidenceRelationship.target_evidence))
        .where(EvidenceRelationship.source_evidence_id.in_(initial_ids))
    )
    relationships = result.scalars().all()
    
    # 3. Process new evidence
    for rel in relationships:
        if rel.target_evidence_id not in seen_ids:
            seen_ids.add(rel.target_evidence_id)
            
            # Find the original evidence that linked to this
            source_e = next(e for e, _ in initial_evidence if e.id == rel.source_evidence_id)
            
            chain = f"Expanded via {rel.relationship_type.value} from {source_e.modality.value}"
            
            # Use inherited distance + small penalty
            original_dist = next(dist for e, dist in initial_evidence if e.id == rel.source_evidence_id)
            new_dist = original_dist + 0.1 
            
            expanded_results.append((rel.target_evidence, new_dist, chain))
            
    # Optional: sort by distance again
    expanded_results.sort(key=lambda x: x[1])
    
    return expanded_results
