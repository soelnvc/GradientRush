"""Test fixtures and database configuration for Level 6 validation."""

import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from backend.app.main import app
from backend.app.database.connection import engine, async_session, init_db
from backend.app.database.models import Source, Evidence, SourceType, SourceStatus, Modality
from backend.app.services.embeddings import generate_embedding


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    """Ensure database schema is created."""
    await init_db()
    yield


@pytest_asyncio.fixture
async def session() -> AsyncSession:
    """Provide an isolated database session for tests."""
    async with async_session() as s:
        try:
            yield s
        finally:
            await s.close()


@pytest_asyncio.fixture
async def client() -> AsyncClient:
    """Async HTTP client for FastAPI testing."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def seed_demo_corpus(session: AsyncSession):
    """Seed a realistic multimodal corpus for Level 6 validation tests."""
    # Create test source records
    source_pdf = Source(
        id=uuid.UUID("11111111-1111-1111-1111-111111111111"),
        filename="database_architecture.pdf",
        source_type=SourceType.PDF,
        file_path="data/raw/database_architecture.pdf",
        status=SourceStatus.COMPLETED,
    )
    source_video = Source(
        id=uuid.UUID("22222222-2222-2222-2222-222222222222"),
        filename="system_design_meeting.mp4",
        source_type=SourceType.VIDEO,
        file_path="data/raw/system_design_meeting.mp4",
        status=SourceStatus.COMPLETED,
    )
    source_image = Source(
        id=uuid.UUID("33333333-3333-3333-3333-333333333333"),
        filename="replication_diagram.png",
        source_type=SourceType.IMAGE,
        file_path="data/raw/replication_diagram.png",
        status=SourceStatus.COMPLETED,
    )

    # Clean up any existing test records with these IDs
    for s in [source_pdf, source_video, source_image]:
        existing = await session.get(Source, s.id)
        if existing:
            await session.delete(existing)
    await session.commit()

    session.add_all([source_pdf, source_video, source_image])
    await session.commit()

    # Evidence items
    corpus = [
        # PDF evidence (Page-based)
        {
            "id": uuid.UUID("a0000000-0000-0000-0000-000000000001"),
            "source_id": source_pdf.id,
            "modality": Modality.PDF_TEXT,
            "content": "Database replication is used to improve read scalability and fault tolerance by maintaining multiple copies of data across replica nodes.",
            "page_number": 1,
            "start_time": None,
            "end_time": None,
            "frame_path": None,
        },
        {
            "id": uuid.UUID("a0000000-0000-0000-0000-000000000002"),
            "source_id": source_pdf.id,
            "modality": Modality.PDF_TEXT,
            "content": "Sharding distributes large datasets across multiple independent database partitions to overcome single-node storage and write bottlenecks.",
            "page_number": 2,
            "start_time": None,
            "end_time": None,
            "frame_path": None,
        },
        {
            "id": uuid.UUID("a0000000-0000-0000-0000-000000000003"),
            "source_id": source_pdf.id,
            "modality": Modality.PDF_TEXT,
            "content": "PostgreSQL with pgvector provides efficient approximate nearest neighbor vector indexing using HNSW and IVFFlat algorithms.",
            "page_number": 3,
            "start_time": None,
            "end_time": None,
            "frame_path": None,
        },
        # Video speech transcript evidence (Timestamped)
        {
            "id": uuid.UUID("b0000000-0000-0000-0000-000000000001"),
            "source_id": source_video.id,
            "modality": Modality.SPEECH,
            "content": "In our team discussion, Alice recommended using Redis as a write-through caching layer to reduce latency below 5 milliseconds.",
            "page_number": None,
            "start_time": 12.5,
            "end_time": 28.0,
            "frame_path": None,
        },
        {
            "id": uuid.UUID("b0000000-0000-0000-0000-000000000002"),
            "source_id": source_video.id,
            "modality": Modality.SPEECH,
            "content": "Bob pointed out that asynchronous replication might experience replication lag during network partitions.",
            "page_number": None,
            "start_time": 30.0,
            "end_time": 45.0,
            "frame_path": None,
        },
        # Video frame visual evidence
        {
            "id": uuid.UUID("c0000000-0000-0000-0000-000000000001"),
            "source_id": source_video.id,
            "modality": Modality.FRAME,
            "content": "Slide showing database architecture diagram with primary leader node directing read traffic to 3 read replicas.",
            "page_number": None,
            "start_time": 30.0,
            "end_time": 30.0,
            "frame_path": "data/frames/22222222-2222-2222-2222-222222222222/frame_0003.jpg",
        },
        # Standalone Image evidence
        {
            "id": uuid.UUID("d0000000-0000-0000-0000-000000000001"),
            "source_id": source_image.id,
            "modality": Modality.IMAGE,
            "content": "System architecture diagram illustrating the microservices topology with API gateway, auth service, and message queue.",
            "page_number": None,
            "start_time": None,
            "end_time": None,
            "frame_path": None,
        },
    ]

    for item in corpus:
        existing_ev = await session.get(Evidence, item["id"])
        if existing_ev:
            await session.delete(existing_ev)
    await session.commit()

    for item in corpus:
        emb = generate_embedding(item["content"])
        ev = Evidence(
            id=item["id"],
            source_id=item["source_id"],
            modality=item["modality"],
            content=item["content"],
            start_time=item["start_time"],
            end_time=item["end_time"],
            page_number=item["page_number"],
            frame_path=item["frame_path"],
            confidence=1.0,
            embedding=emb,
        )
        session.add(ev)

    await session.commit()
    return corpus
