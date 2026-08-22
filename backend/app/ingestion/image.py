"""Image ingestion pipeline."""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.models import Modality
from backend.app.knowledge.evidence import create_evidence
from backend.app.services.ai_provider import ai_provider


async def process_image(session: AsyncSession, source_id: uuid.UUID, file_path: str):
    """Extract description and OCR text from an image."""
    
    description = ai_provider.analyze_image(file_path)
    
    if description:
        await create_evidence(
            session=session,
            source_id=source_id,
            modality=Modality.IMAGE,
            content=description,
            # No specific provenance fields (time, page) needed for standalone images,
            # the source itself is the provenance.
        )
