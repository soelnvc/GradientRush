"""Sources API — upload, list, and inspect sources."""

import os
import uuid
import shutil
from pathlib import Path

from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Query, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.database.connection import get_session
from backend.app.database.models import Source, SourceType, SourceStatus, Evidence, Project
from backend.app.ingestion.pipeline import run_pipeline

router = APIRouter(prefix="/api/sources", tags=["sources"])

# Resolve DATA_DIR relative to project root
DATA_DIR = Path(os.getenv("DATA_DIR", "./data"))
RAW_DIR = DATA_DIR / "raw"
DEFAULT_PROJECT_ID = uuid.UUID("00000000-0000-0000-0000-000000000000")


def _detect_source_type(filename: str) -> SourceType:
    """Detect source type from file extension."""
    ext = Path(filename).suffix.lower()
    mapping = {
        ".mp4": SourceType.VIDEO,
        ".avi": SourceType.VIDEO,
        ".mkv": SourceType.VIDEO,
        ".mov": SourceType.VIDEO,
        ".webm": SourceType.VIDEO,
        ".mp3": SourceType.AUDIO,
        ".wav": SourceType.AUDIO,
        ".m4a": SourceType.AUDIO,
        ".flac": SourceType.AUDIO,
        ".pdf": SourceType.PDF,
        ".png": SourceType.IMAGE,
        ".jpg": SourceType.IMAGE,
        ".jpeg": SourceType.IMAGE,
        ".webp": SourceType.IMAGE,
        ".gif": SourceType.IMAGE,
        ".bmp": SourceType.IMAGE,
    }
    source_type = mapping.get(ext)
    if source_type is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Supported: {list(mapping.keys())}",
        )
    return source_type


@router.post("/upload")
async def upload_source(
    file: UploadFile = File(...),
    project_id: Optional[uuid.UUID] = Form(None),
    session: AsyncSession = Depends(get_session),
):
    """Upload a file and create a source record assigned to a project workspace."""
    source_type = _detect_source_type(file.filename)

    target_project_id = project_id or DEFAULT_PROJECT_ID

    # Ensure target project exists
    proj_res = await session.execute(select(Project).where(Project.id == target_project_id))
    if not proj_res.scalar_one_or_none():
        target_project_id = DEFAULT_PROJECT_ID

    # Save file to data/raw/{source_id}/{filename}
    source_id = uuid.uuid4()
    save_dir = RAW_DIR / str(source_id)
    save_dir.mkdir(parents=True, exist_ok=True)
    file_path = save_dir / file.filename
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Create DB record
    source = Source(
        id=source_id,
        project_id=target_project_id,
        filename=file.filename,
        source_type=source_type,
        file_path=str(file_path),
        status=SourceStatus.UPLOADED,
    )
    session.add(source)
    await session.commit()
    await session.refresh(source)

    return {
        "id": str(source.id),
        "project_id": str(source.project_id) if source.project_id else None,
        "filename": source.filename,
        "source_type": source.source_type.value,
        "status": source.status.value,
        "created_at": source.created_at.isoformat(),
    }


@router.get("")
async def list_sources(
    project_id: Optional[uuid.UUID] = Query(None),
    session: AsyncSession = Depends(get_session),
):
    """List all sources (optionally filtered by project_id) with their status."""
    stmt = select(Source)
    if project_id:
        stmt = stmt.where(Source.project_id == project_id)
    stmt = stmt.order_by(Source.created_at.desc())

    result = await session.execute(stmt)
    sources = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "project_id": str(s.project_id) if s.project_id else None,
            "filename": s.filename,
            "source_type": s.source_type.value,
            "status": s.status.value,
            "error_message": s.error_message,
            "created_at": s.created_at.isoformat(),
        }
        for s in sources
    ]


@router.get("/{source_id}")
async def get_source(
    source_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get source detail including evidence count."""
    result = await session.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    # Count evidence
    ev_result = await session.execute(
        select(Evidence).where(Evidence.source_id == source_id)
    )
    evidence_items = ev_result.scalars().all()

    return {
        "id": str(source.id),
        "filename": source.filename,
        "source_type": source.source_type.value,
        "file_path": source.file_path,
        "status": source.status.value,
        "error_message": source.error_message,
        "created_at": source.created_at.isoformat(),
        "evidence_count": len(evidence_items),
    }


from backend.app.database.connection import async_session

async def _bg_run_pipeline(source_id: uuid.UUID):
    async with async_session() as session:
        try:
            await run_pipeline(session, source_id)
        except Exception as e:
            print(f"Background pipeline error for source {source_id}: {e}")


@router.post("/{source_id}/process")
async def process_source(
    source_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    """Trigger asynchronous background processing for a source."""
    result = await session.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    if source.status == SourceStatus.COMPLETED:
        return {"status": "completed", "message": "Source is already processed"}

    source.status = SourceStatus.PROCESSING
    source.error_message = None
    await session.commit()

    background_tasks.add_task(_bg_run_pipeline, source_id)
    return {"status": "processing", "message": "Source processing started in background"}


@router.get("/{source_id}/evidence")
async def list_source_evidence(
    source_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """List all evidence objects created from a source."""
    result = await session.execute(
        select(Evidence)
        .where(Evidence.source_id == source_id)
        .order_by(Evidence.start_time.asc().nulls_last())
    )
    evidence_items = result.scalars().all()
    
    return [
        {
            "id": str(e.id),
            "modality": e.modality.value,
            "content": e.content,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "page_number": e.page_number,
            "frame_path": e.frame_path,
            "confidence": e.confidence,
            "created_at": e.created_at.isoformat(),
        }
        for e in evidence_items
    ]

