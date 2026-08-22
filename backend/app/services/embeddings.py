"""Embedding service using sentence-transformers."""

import os
from sentence_transformers import SentenceTransformer

# Lazy load model to avoid memory overhead on startup
_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        _embedding_model = SentenceTransformer(model_name)
    return _embedding_model

def generate_embedding(text: str) -> list[float]:
    """Generate a 384-dimensional embedding for a piece of text."""
    model = get_embedding_model()
    # model.encode returns a numpy array, we convert to list of floats for pgvector
    embedding = model.encode(text)
    return embedding.tolist()
