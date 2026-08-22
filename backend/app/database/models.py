"""Database ORM models — 3 tables only.

sources          — uploaded files
evidence         — unified evidence objects (with provenance fields from day 1)
evidence_relationships — normalized relationship graph
"""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    String, Text, Float, Integer, DateTime, Enum, ForeignKey, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector

from backend.app.database.connection import Base


# ── Enums ──────────────────────────────────────────────────────────────────


class SourceType(str, enum.Enum):
    VIDEO = "video"
    AUDIO = "audio"
    PDF = "pdf"
    IMAGE = "image"


class SourceStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Modality(str, enum.Enum):
    SPEECH = "speech"
    FRAME = "frame"
    PDF_TEXT = "pdf_text"
    IMAGE = "image"
    OCR = "ocr"


class RelationshipType(str, enum.Enum):
    TEMPORALLY_ALIGNED = "temporally_aligned"
    MENTIONS = "mentions"
    VISUAL_SUPPORT = "visual_support"
    DOCUMENT_SUPPORT = "document_support"
    SAME_TOPIC = "same_topic"


# ── Table 1: Sources ───────────────────────────────────────────────────────


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    source_type: Mapped[SourceType] = mapped_column(
        Enum(SourceType), nullable=False
    )
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    status: Mapped[SourceStatus] = mapped_column(
        Enum(SourceStatus), default=SourceStatus.UPLOADED, nullable=False
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    evidence_items: Mapped[list["Evidence"]] = relationship(
        back_populates="source", cascade="all, delete-orphan"
    )


# ── Table 2: Evidence ─────────────────────────────────────────────────────


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False
    )
    modality: Mapped[Modality] = mapped_column(
        Enum(Modality), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # ── Provenance fields (populated from creation, not added later) ──
    start_time: Mapped[float | None] = mapped_column(Float, nullable=True)
    end_time: Mapped[float | None] = mapped_column(Float, nullable=True)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    frame_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    # pgvector embedding (384-dim for all-MiniLM-L6-v2)
    embedding: Mapped[list | None] = mapped_column(Vector(384), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    source: Mapped["Source"] = relationship(back_populates="evidence_items")

    __table_args__ = (
        Index("ix_evidence_source_id", "source_id"),
        Index("ix_evidence_modality", "modality"),
    )


# ── Table 3: Evidence Relationships ───────────────────────────────────────


class EvidenceRelationship(Base):
    __tablename__ = "evidence_relationships"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_evidence_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evidence.id", ondelete="CASCADE"),
        nullable=False,
    )
    target_evidence_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evidence.id", ondelete="CASCADE"),
        nullable=False,
    )
    relationship_type: Mapped[RelationshipType] = mapped_column(
        Enum(RelationshipType), nullable=False
    )
    confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    source_evidence: Mapped["Evidence"] = relationship(
        foreign_keys=[source_evidence_id]
    )
    target_evidence: Mapped["Evidence"] = relationship(
        foreign_keys=[target_evidence_id]
    )

    __table_args__ = (
        Index("ix_rel_source_evidence", "source_evidence_id"),
        Index("ix_rel_target_evidence", "target_evidence_id"),
        Index("ix_rel_type", "relationship_type"),
    )
