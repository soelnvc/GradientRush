"""Ingestion pipeline orchestrator."""

import os
import uuid
import traceback
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.database.models import Source, SourceStatus, SourceType
from backend.app.ingestion.video import process_video
from backend.app.ingestion.audio import process_audio
from backend.app.ingestion.pdf import process_pdf
from backend.app.ingestion.image import process_image

DATA_DIR = Path(os.getenv("DATA_DIR", "./data"))


async def run_pipeline(session: AsyncSession, source_id: uuid.UUID):
    """Run the multimodal ingestion pipeline for a given source."""
    
    # 1. Fetch source and enforce idempotency
    result = await session.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    
    if not source:
        raise ValueError(f"Source {source_id} not found")
        
    if source.status == SourceStatus.COMPLETED:
        raise ValueError(f"Source {source_id} is already processed. Use explicit reprocess to bypass.")
        
    # 2. Mark as processing
    source.status = SourceStatus.PROCESSING
    source.error_message = None
    await session.commit()
    
    try:
        # 3. Route to specific processor
        file_path = source.file_path
        
        if source.source_type == SourceType.VIDEO:
            await process_video(session, source_id, file_path, DATA_DIR)
        elif source.source_type == SourceType.AUDIO:
            await process_audio(session, source_id, file_path)
        elif source.source_type == SourceType.PDF:
            await process_pdf(session, source_id, file_path)
        elif source.source_type == SourceType.IMAGE:
            await process_image(session, source_id, file_path)
        else:
            raise NotImplementedError(f"Processor for {source.source_type} not implemented yet")

        # Level 3 & 4: Generate relationships after evidence creation
        from backend.app.knowledge.relationships import generate_temporal_relationships, generate_semantic_relationships
        await generate_temporal_relationships(session, source_id)
        await generate_semantic_relationships(session, source_id)

        # 4. Mark as completed
        source.status = SourceStatus.COMPLETED
        await session.commit()
        
    except Exception as e:
        # 5. Handle failure
        await session.rollback()
        
        # We need a fresh session state to update the source since we rolled back
        result = await session.execute(select(Source).where(Source.id == source_id))
        failed_source = result.scalar_one()
        failed_source.status = SourceStatus.FAILED
        failed_source.error_message = traceback.format_exc()
        await session.commit()
        raise e
