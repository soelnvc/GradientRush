"""Video ingestion pipeline."""

import os
import uuid
import asyncio
import ffmpeg
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.models import Modality
from backend.app.knowledge.evidence import create_evidence
from backend.app.services.ai_provider import ai_provider
from backend.app.ingestion.audio import process_audio

async def process_video(session: AsyncSession, source_id: uuid.UUID, file_path: str, data_dir: Path):
    """Extract audio and frames from a video, then process them."""
    
    source_dir = data_dir / "processed" / str(source_id)
    frames_dir = data_dir / "frames" / str(source_id)
    source_dir.mkdir(parents=True, exist_ok=True)
    frames_dir.mkdir(parents=True, exist_ok=True)
    
    audio_path = source_dir / "audio.wav"
    
    # 1. Extract audio in thread
    def _extract_audio():
        (
            ffmpeg
            .input(file_path)
            .output(str(audio_path), acodec='pcm_s16le', ac=1, ar='16k')
            .overwrite_output()
            .run(quiet=True)
        )

    try:
        await asyncio.to_thread(_extract_audio)
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to extract audio: {e.stderr.decode() if e.stderr else str(e)}")

    # 2. Extract frames (1 frame every 10 seconds) in thread
    def _extract_frames():
        (
            ffmpeg
            .input(file_path)
            .filter('fps', fps=1/10)
            .output(str(frames_dir / "frame_%04d.jpg"), **{'qscale:v': 2})
            .overwrite_output()
            .run(quiet=True)
        )

    try:
        await asyncio.to_thread(_extract_frames)
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to extract frames: {e.stderr.decode() if e.stderr else str(e)}")

    # 3. Process extracted frames
    frame_files = sorted(list(frames_dir.glob("frame_*.jpg")))
    for i, frame_file in enumerate(frame_files):
        timestamp = float(i * 10)
        description = await asyncio.to_thread(ai_provider.analyze_image, str(frame_file))
        
        await create_evidence(
            session=session,
            source_id=source_id,
            modality=Modality.FRAME,
            content=description,
            start_time=timestamp,
            frame_path=str(frame_file),
        )

    # 4. Process the extracted audio
    await process_audio(session, source_id, str(audio_path))

