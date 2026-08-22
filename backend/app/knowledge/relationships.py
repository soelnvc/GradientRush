"""Relationship generation between evidence objects."""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.database.models import Evidence, EvidenceRelationship, RelationshipType, Modality
from backend.app.services.ai_provider import ai_provider


async def generate_temporal_relationships(session: AsyncSession, source_id: uuid.UUID):
    """Level 3: Detect and link temporally aligned evidence (e.g., Frame & Speech)."""
    
    # Fetch all evidence for this source with timestamps
    result = await session.execute(
        select(Evidence)
        .where(Evidence.source_id == source_id)
        .where(Evidence.start_time.isnot(None))
    )
    evidence_items = result.scalars().all()
    
    relationships = []
    
    # Simple O(n^2) for hackathon scale
    for i in range(len(evidence_items)):
        for j in range(i + 1, len(evidence_items)):
            e1 = evidence_items[i]
            e2 = evidence_items[j]
            
            # Skip if same modality (we care about cross-modal temporal links, e.g. speech to frame)
            if e1.modality == e2.modality:
                continue
                
            # Check overlap or proximity (e.g., within 15 seconds)
            time_threshold = 15.0
            
            # e1 time window
            e1_start = e1.start_time
            e1_end = e1.end_time if e1.end_time is not None else e1_start
            
            # e2 time window
            e2_start = e2.start_time
            e2_end = e2.end_time if e2.end_time is not None else e2_start
            
            # Check if intervals [e1_start, e1_end] and [e2_start, e2_end] overlap or are within threshold
            if (e1_start - time_threshold <= e2_end) and (e2_start - time_threshold <= e1_end):
                # Create bidirectional relationship
                rel1 = EvidenceRelationship(
                    source_evidence_id=e1.id,
                    target_evidence_id=e2.id,
                    relationship_type=RelationshipType.TEMPORALLY_ALIGNED,
                )
                rel2 = EvidenceRelationship(
                    source_evidence_id=e2.id,
                    target_evidence_id=e1.id,
                    relationship_type=RelationshipType.TEMPORALLY_ALIGNED,
                )
                relationships.extend([rel1, rel2])
                
    if relationships:
        session.add_all(relationships)
        await session.commit()


async def generate_semantic_relationships(session: AsyncSession, source_id: uuid.UUID):
    """Level 4: Extract entities and link SAME_TOPIC evidence."""
    
    result = await session.execute(
        select(Evidence).where(Evidence.source_id == source_id)
    )
    evidence_items = result.scalars().all()
    
    # Extract entities/key concepts for each evidence item quickly
    import re
    STOPWORDS = {"this", "that", "with", "from", "have", "what", "when", "where", "which", "there", "their", "about", "would", "could", "should", "using", "used", "into", "also", "some", "more"}
    
    evidence_entities = {}
    for e in evidence_items:
        words = re.findall(r"\b[A-Za-z]{4,}\b", e.content.lower())
        meaningful = {w for w in words if w not in STOPWORDS}
        if meaningful:
            evidence_entities[e.id] = meaningful
            e.metadata_ = e.metadata_ or {}
            e.metadata_["entities"] = list(meaningful)[:10]
    
    relationships = []
    
    # Link if they share at least one entity
    items = list(evidence_entities.items())
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            e1_id, e1_entities = items[i]
            e2_id, e2_entities = items[j]
            
            # Find intersection
            shared = e1_entities.intersection(e2_entities)
            if shared:
                rel1 = EvidenceRelationship(
                    source_evidence_id=e1_id,
                    target_evidence_id=e2_id,
                    relationship_type=RelationshipType.SAME_TOPIC,
                    metadata_={"shared_entities": list(shared)}
                )
                rel2 = EvidenceRelationship(
                    source_evidence_id=e2_id,
                    target_evidence_id=e1_id,
                    relationship_type=RelationshipType.SAME_TOPIC,
                    metadata_={"shared_entities": list(shared)}
                )
                relationships.extend([rel1, rel2])
                
    if relationships:
        session.add_all(relationships)
        await session.commit()
