# ⚡ GradientRush — Multimodal Knowledge Engine

<div align="center">

```
   ______               ___            __  ____             __  
  / ____/________ _____/ (_)__  ____  / /_/ __ \__  _______/ /_ 
 / / __/ ___/ __ `/ __  / / _ \/ __ \/ __/ /_/ / / / / ___/ __ \
/ /_/ / /  / /_/ / /_/ / /  __/ / / / /_/ _, _/ /_/ (__  ) / / /
\____/_/   \__,_/\__,_/_/\___/_/ /_/\__/_/ |_|\__,_/____/_/ /_/ 
```

**Next-Generation Cross-Modal Graph RAG for Technical Architecture & Distributed Systems**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL pgvector](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5-Flash-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Tests Passing](https://img.shields.io/badge/Pytest-18%2F18%20Passed-10b981?style=for-the-badge&logo=pytest&logoColor=white)](https://docs.pytest.org)

<p align="center">
  <b>Bridging Video Frames, Speech Transcripts, System Architecture Diagrams, and Technical PDFs into an Interconnected Knowledge Graph.</b>
</p>

---

</div>

## 📑 Table of Contents
- [🌟 Executive Summary](#-executive-summary)
- [🎯 The Problem: Modality Blindness in Traditional RAG](#-the-problem-modality-blindness-in-traditional-rag)
- [🏗 System Architecture & Workflow](#-system-architecture--workflow)
- [🔬 Core Concepts & Technical Deep Dive](#-core-concepts--technical-deep-dive)
  - [1. Multimodal Ingestion Pipeline](#1-multimodal-ingestion-pipeline)
  - [2. Dense Vector Space & Indexing](#2-dense-vector-space--indexing)
  - [3. Cross-Modal Temporal & Semantic Graph Linking](#3-cross-modal-temporal--semantic-graph-linking)
  - [4. Targeted 5-Stage Retrieval Pipeline](#4-targeted-5-stage-retrieval-pipeline)
  - [5. Calibrated 7-Tier Vector Grounding](#5-calibrated-7-tier-vector-grounding)
- [📊 Benchmark Engine & Baseline Comparison](#-benchmark-engine--baseline-comparison)
- [💻 Tech Stack](#-tech-stack)
- [🚀 Quickstart & Installation](#-quickstart--installation)
- [🧪 Automated Test Suite](#-automated-test-suite)
- [✨ Key Specialities & Innovations](#-key-specialities--innovations)
- [💌 Closing Message](#-closing-message)

---

## 🌟 Executive Summary

**GradientRush** is an enterprise-grade **Multimodal Knowledge Engine** engineered to ingest, cross-link, index, and retrieve insights from complex, heterogeneous technical media:
* **Recorded Video Presentations & System Architecture Walkthroughs**
* **Spoken Audio & Engineer Discussions** (Whisper ASR with word-level timestamps)
* **Architecture Diagrams, Flowcharts & Slide Visuals** (Vision OCR & Visual Semantics)
* **Technical Whitepapers, Documentation & System Specifications** (PyMuPDF layout extraction)

Rather than treating documents and videos as isolated silos, GradientRush maps every piece of evidence into an **interconnected cross-modal graph**. When an engineer queries the engine, it performs **balanced vector retrieval**, traverses **temporal and semantic relationships**, and synthesizes an authoritative answer with **exact provenance (second-level timestamps, page numbers, and high-resolution visual evidence previews)**.

---

## 🎯 The Problem: Modality Blindness in Traditional RAG

Standard Retrieval-Augmented Generation (RAG) systems suffer from critical failure modes when dealing with technical content:
1. **Modality Blindness:** Text-only RAG completely ignores visual diagrams (e.g. multi-leader network splits, write-ahead log flows, failover state machines).
2. **Temporal Disconnect:** Audio transcripts often say *"as shown in this diagram here"* without preserving the exact visual frame shown at that exact second.
3. **Context Dilution / Token Flooding:** Naive relationship expansion can balloon 5 retrieval results into 100+ candidates, diluting LLM prompts and exploding API costs.
4. **Misleading Confidence:** Systems displaying arbitrary *"100% Confidence"* labels without rigorous vector geometric backing.

**GradientRush solves all four challenges from first principles.**

---

## 🏗 System Architecture & Workflow

```
 ┌───────────────────────────────────────────────────────────────────────────┐
 │                            INGESTION LAYER                                │
 │  Video (FFmpeg)  │  Speech (Whisper)  │  Vision (OCR)  │  PDFs (PyMuPDF)  │
 └────────┬─────────────────┬───────────────────┬───────────────────┬────────┘
          │                 │                   │                   │
          ▼                 ▼                   ▼                   ▼
 ┌───────────────────────────────────────────────────────────────────────────┐
 │                   CROSS-MODAL GRAPH CONSTRUCTION                          │
 │      • Dense 384-d Embeddings (SentenceTransformers all-MiniLM-L6-v2)     │
 │      • Temporal Alignment (15s frame <-> speech co-occurrence window)     │
 │      • Semantic Entity Linking (shared architectural concepts)            │
 └──────────────────────────────────┬────────────────────────────────────────┘
                                    │
                                    ▼
 ┌───────────────────────────────────────────────────────────────────────────┐
 │                   POSTGRESQL + PGVECTOR DATABASE                          │
 │      • Evidence Table (Vector HNSW Index, Timestamp, Modality, Page)      │
 │      • EvidenceRelationship Table (TEMPORALLY_ALIGNED, SAME_TOPIC)        │
 └──────────────────────────────────┬────────────────────────────────────────┘
                                    │
                                    ▼
 ┌───────────────────────────────────────────────────────────────────────────┐
 │                      TARGETED RETRIEVAL PIPELINE                          │
 │  1. Balanced Multi-Source Vector Search (Top 5 Candidates)                │
 │  2. 1-Hop Graph Traversal (Expands ~61 Candidates)                        │
 │  3. Strict Evidence ID Deduplication                                      │
 │  4. Modality Diversity Reranking (Frame + Speech + PDF Quotas)            │
 │  5. Top 12-15 Candidate Pruning & Hop-Penalty Scoring                     │
 └──────────────────────────────────┬────────────────────────────────────────┘
                                    │
                                    ▼
 ┌───────────────────────────────────────────────────────────────────────────┐
 │                      MULTIMODAL SYNTHESIS & UI                            │
 │      • Multi-Tier Gemini 2.5 Flash / Flash Lite LLM Fallback Pool         │
 │      • Grounded Answer with Second-by-Second Video Timestamps             │
 │      • High-Resolution Frame Image Previews & Exact Page Deep-Links       │
 │      • Calibrated 7-Tier Confidence Badges (Full -> Zero)                 │
 └───────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Core Concepts & Technical Deep Dive

### 1. Multimodal Ingestion Pipeline
* **Video Ingestion ([`video.py`](file:///Users/nvc/Documents/GradientRush/backend/app/ingestion/video.py)):** Uses FFmpeg to perform scene-change and periodic keyframe sampling (every 10 seconds), generating high-resolution JPG frames stored in `/data/frames/`.
* **Audio Ingestion ([`audio.py`](file:///Users/nvc/Documents/GradientRush/backend/app/ingestion/audio.py)):** Extracts audio tracks and processes them through OpenAI Whisper to produce word-level timestamps and time-stamped speech segments.
* **Image OCR & Vision Ingestion ([`image.py`](file:///Users/nvc/Documents/GradientRush/backend/app/ingestion/image.py)):** Performs vision-language visual semantic parsing and layout OCR to convert visual diagrams into rich semantic text descriptions.
* **Document Ingestion ([`pdf.py`](file:///Users/nvc/Documents/GradientRush/backend/app/ingestion/pdf.py)):** Employs PyMuPDF to extract structured, page-tagged text blocks while preserving section hierarchy.

### 2. Dense Vector Space & Indexing
All ingested chunks are projected into a normalized 384-dimensional dense semantic vector space using `sentence-transformers/all-MiniLM-L6-v2`. Vectors are stored in PostgreSQL using the `pgvector` extension with an HNSW cosine distance index for millisecond search latency.

### 3. Cross-Modal Temporal & Semantic Graph Linking
GradientRush constructs two fundamental cross-modal edge types:
1. `TEMPORALLY_ALIGNED`: Bi-directional link between speech utterances and video frames captured within the same 15-second time window ($|t_{\text{frame}} - t_{\text{speech}}| \le 15s$).
2. `SAME_TOPIC`: Cross-modal semantic link established when entities extracted from a document section overlap with entities visually present in a frame or discussed in a transcript.

### 4. Targeted 5-Stage Retrieval Pipeline
To prevent prompt flooding and evidence dilution, GradientRush implements an optimized retrieval pipeline:
$$\text{Query} \xrightarrow{\text{Top 5 Candidates}} \text{Graph Expansion } (\sim 61) \xrightarrow{\text{Deduplication}} \text{Diversity Reranking} \xrightarrow{\text{Top 12--15}} \text{Gemini LLM}$$
* **Hop Penalties:** Direct Retrieval ($+0.0$), `TEMPORALLY_ALIGNED` ($+0.06$), `SAME_TOPIC` ($+0.10$).
* **Modality Quotas:** Guarantees balanced representation across Video Frames, Transcripts, and PDF Documentation.
* **Token Savings:** Reduces LLM prompt tokens by over 75% while boosting synthesis quality.

### 5. Calibrated 7-Tier Vector Grounding
Unlike systems that display misleading static "100% confidence" numbers, GradientRush maps true vector cosine distance ($d$) to 7 scientifically calibrated confidence categories:

| Confidence Tier | Cosine Distance ($d$) | Cosine Similarity ($1 - d$) | Grounding Semantic |
| :--- | :--- | :--- | :--- |
| **Full** | $d < 0.20$ | $\ge 0.80$ | Verbatim quote or identical semantic match |
| **Very High** | $0.20 \le d < 0.32$ | $0.68 - 0.80$ | Core architectural topic match & direct answer |
| **High** | $0.32 \le d < 0.44$ | $0.56 - 0.68$ | Highly relevant visual frame, diagram, or speech chunk |
| **Moderate** | $0.44 \le d < 0.58$ | $0.42 - 0.56$ | Supporting context / 1-hop graph relationship expansion |
| **Low** | $0.58 \le d < 0.70$ | $0.30 - 0.42$ | Broad contextual or peripheral mention |
| **Very Low** | $0.70 \le d < 0.85$ | $0.15 - 0.30$ | Distant semantic association |
| **Zero** | $d \ge 0.85$ | $< 0.15$ | Unrelated background noise |

---

## 📊 Benchmark Engine & Baseline Comparison

GradientRush includes a dedicated **Benchmark Engine** accessible at `/compare` that executes real-time side-by-side queries against a conventional **Text-Only RAG Baseline**:

```
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│       Multimodal Graph RAG (Ours)            │          Text-Only RAG Baseline              │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ ✅ Retrieves visual diagrams (split-brain    │ ❌ Fails on visual-specific questions        │
│    slashed-globe leader failure icon)        │    (contains no diagram understanding)       │
│ ✅ Preserves second-level video timestamps   │ ❌ Lacks temporal cross-modal alignment      │
│ ✅ Full 1-hop graph relationship context     │ ❌ Missing graph-expanded context            │
│ ✅ High accuracy cross-modal synthesis       │ ❌ Hallucinates or reports "insufficient"   │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

<div align="center">

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8.2, React Router v7, Lucide Icons, Pure Vanilla CSS |
| **Backend API** | FastAPI, Uvicorn, SQLAlchemy 2.0 (Async), Pydantic v2 |
| **Database** | PostgreSQL 16, `pgvector` (Dense Vector HNSW Indexing), SQLite fallback |
| **AI & Embeddings** | SentenceTransformers (`all-MiniLM-L6-v2`), PyTorch, Google Gemini 2.5 Flash |
| **Media Processing** | FFmpeg, OpenAI Whisper (ASR), PyMuPDF (PDF Parser), PIL |
| **Authentication** | Google Firebase Authentication, Scoped Multi-Tenant Workspace Contexts |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX AsyncClient (18/18 Unit & Integration Tests) |

</div>

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
* Python 3.10+
* Node.js 18+ and npm
* PostgreSQL with `pgvector` extension enabled (or Docker)
* FFmpeg installed (`brew install ffmpeg` on macOS or `apt install ffmpeg` on Linux)

### 2. Clone the Repository
```bash
git clone https://github.com/soelnvc/GradientRush.git
cd GradientRush
```

### 3. Backend Setup
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment variables
cp .env.example .env
# Fill in GEMINI_API_KEY and DATABASE_URL in .env

# Start FastAPI backend server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Setup
```bash
# In a new terminal window
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```

### 5. Access the Web Application
Open your browser and navigate to:
* **Dashboard & Ingestion:** [http://localhost:5174/](http://localhost:5174/)
* **Media Library & Source Detail:** [http://localhost:5174/sources](http://localhost:5174/sources)
* **Query Engine:** [http://localhost:5174/query](http://localhost:5174/query)
* **Benchmark & Comparison:** [http://localhost:5174/compare](http://localhost:5174/compare)
* **FastAPI Interactive Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Automated Test Suite

GradientRush includes an end-to-end automated test suite covering embedding generation, vector search precision, API contracts, negative grounding, and error handling.

Run all tests via pytest:
```bash
source venv/bin/activate
PYTHONPATH=. pytest backend/tests/ -v
```

```
============================= test session starts ==============================
backend/tests/test_embeddings.py::test_embedding_generation PASSED       [  5%]
backend/tests/test_embeddings.py::test_multiple_embeddings_distinct PASSED [ 11%]
backend/tests/test_embeddings.py::test_evidence_integrity_in_database PASSED [ 16%]
backend/tests/test_error_handling.py::test_empty_query_rejected PASSED   [ 22%]
backend/tests/test_error_handling.py::test_invalid_limit_rejected PASSED [ 27%]
backend/tests/test_error_handling.py::test_malformed_request_body PASSED [ 33%]
backend/tests/test_error_handling.py::test_very_long_query_handled_gracefully PASSED [ 38%]
backend/tests/test_health.py::test_health_endpoint PASSED                [ 44%]
backend/tests/test_health.py::test_database_connection PASSED            [ 50%]
backend/tests/test_health.py::test_pgvector_extension PASSED             [ 55%]
backend/tests/test_health.py::test_embedding_column_dimension PASSED     [ 61%]
backend/tests/test_query_api.py::test_query_api_contract_success PASSED  [ 66%]
backend/tests/test_query_api.py::test_query_api_speech_multimodal_evidence PASSED [ 72%]
backend/tests/test_query_api.py::test_unknown_questions_grounding PASSED [ 77%]
backend/tests/test_vector_search.py::test_vector_search_execution PASSED [ 83%]
backend/tests/test_vector_search.py::test_vector_search_top_k_respected PASSED [ 88%]
backend/tests/test_vector_search.py::test_vector_search_no_duplicates PASSED [ 94%]
backend/tests/test_vector_search.py::test_vector_search_empty_query PASSED [100%]
======================= 18 passed, 6 warnings in 38.27s ========================
```

---

## ✨ Key Specialities & Innovations

1. **True Cross-Modal Alignment:** Unlike standard chunking, video frames are indexed with their exact visual geometry and synchronized to speech timestamps within a 15-second multi-modal window.
2. **Auto-Growing Query Box & Responsive Pinning:** Seamless Apple-grade user interface with auto-resizing textareas and top-aligned submission controls.
3. **Click-to-Expand Provenance Cards:** Click any evidence card to reveal un-clamped text, cosine distance, vector similarity, confidence tier, and **high-resolution frame screenshots**.
4. **Multi-Tenant Workspace Contexts:** Create isolated project workspaces (or query globally) with scoped data privacy and Google OAuth integration.
5. **Multi-Tier LLM Fallback Pool:** Automatic 5-tier failover across Gemini 2.5 Flash, Flash-Lite, and 1.5 Pro to ensure uninterrupted query synthesis.
6. **Desaturated Apple Aesthetics:** Monochromatic, minimalist typography with clean translucent cards designed for maximum readability during long technical review sessions.

---

## 💌 Closing Message

> *"True understanding of complex distributed systems cannot happen in text alone. When an engineer draws a architecture diagram on a whiteboard or presents a slide showing replica failover, that visual evidence is the ground truth. GradientRush was built to ensure that no diagram is forgotten, no timestamp is lost, and every synthesis is backed by incontrovertible cross-modal proof."*

<div align="center">

**Built with ❤️ for the Hackathon by Team GradientRush**

⭐ **Star us on [GitHub](https://github.com/soelnvc/GradientRush)** ⭐

</div>
