"""PDF ingestion pipeline."""

import uuid
import fitz  # PyMuPDF
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.models import Modality
from backend.app.knowledge.evidence import create_evidence


async def process_pdf(session: AsyncSession, source_id: uuid.UUID, file_path: str):
    """Extract text from a PDF, chunked by page."""
    
    doc = fitz.open(file_path)
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text("text").strip()
        
        if not text:
            continue
            
        # We can split large pages into chunks if needed, but for the hackathon,
        # storing one evidence object per page is a good starting point.
        await create_evidence(
            session=session,
            source_id=source_id,
            modality=Modality.PDF_TEXT,
            content=text,
            page_number=page_num + 1,  # 1-indexed for users
        )
    
    doc.close()
