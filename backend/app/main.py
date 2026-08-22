"""FastAPI application — Multimodal Knowledge Engine."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.app.database.connection import init_db
from backend.app.api.sources import router as sources_router
from backend.app.api.query import router as query_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield


app = FastAPI(
    title="Multimodal Knowledge Engine",
    description="Evidence retrieval system preserving cross-modal relationships",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server across all ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

# Routes
app.include_router(sources_router)
app.include_router(query_router)

# Static files for media viewing
DATA_DIR = Path(os.getenv("DATA_DIR", "./data"))
app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "multimodal-knowledge-engine"}
