"""Evidence creation and management."""

import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.models import Evidence, Modality

async def create_evidence(
    session: AsyncSession,
    source_id: uuid.UUID,
    modality: Modality,
    content: str,
    start_time: Optional[float] = None,
    end_time: Optional[float] = None,
    page_number: Optional[int] = None,
    frame_path: Optional[str] = None,
    confidence: float = 1.0,
    metadata: Optional[dict] = None,
) -> Evidence:
    """Create a standardized Evidence object."""
    # Generate vector embedding for the content (Level 5)
    from backend.app.services.embeddings import generate_embedding
    embedding = generate_embedding(content)
    
    evidence = Evidence(
        source_id=source_id,
        modality=modality,
        content=content,
        start_time=start_time,
        end_time=end_time,
        page_number=page_number,
        frame_path=frame_path,
        confidence=confidence,
        metadata_=metadata,
        embedding=embedding,
    )
    session.add(evidence)
    return evidence
