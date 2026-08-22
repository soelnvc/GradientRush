"""Audio ingestion pipeline."""

import os
import uuid
import whisper
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.models import Modality
from backend.app.knowledge.evidence import create_evidence

# Lazy load model to avoid memory overhead on startup
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        model_size = os.getenv("WHISPER_MODEL", "base")
        _whisper_model = whisper.load_model(model_size)
    return _whisper_model

import asyncio

async def process_audio(session: AsyncSession, source_id: uuid.UUID, file_path: str):
    """Transcribe audio and create speech evidence segments."""
    
    model = get_whisper_model()
    result = await asyncio.to_thread(model.transcribe, file_path)
    
    segments = result.get("segments", [])
    for segment in segments:
        text = segment.get("text", "").strip()
        if not text:
            continue
            
        start_time = segment.get("start")
        end_time = segment.get("end")
        
        await create_evidence(
            session=session,
            source_id=source_id,
            modality=Modality.SPEECH,
            content=text,
            start_time=start_time,
            end_time=end_time,
        )
