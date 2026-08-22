# 🏆 GradientRush — Multimodal Knowledge Engine
> **Hackathon Pitch, Demo Guide & Evaluation Benchmark**

---

## ⚡ 60-Second Judge Pitch

> *"Traditional RAG systems are blind. They reduce videos, PDFs, and architecture diagrams into plain text chunks, stripping away timestamps, visual diagrams, and the temporal relationships that connect them. When you ask a question like 'What architecture is shown when replication is discussed?', standard RAG completely fails because the speaker never spoke the visual labels shown on the slide."*
>
> *"**GradientRush** solves this with a **Provenance-First Multimodal Relationship Graph**. We ingest video, audio, PDFs, and diagrams, extracting granular evidence objects and automatically establishing bidirectional temporal and semantic links across modalities. When a query arrives, our engine traverses this knowledge graph to pull not just the text, but the exact video frame, the timestamped audio segment, and the companion PDF page—synthesizing an answer with exact, clickable citations."*

---

## ⚖️ The Kill-Shot: Text RAG vs Multimodal RAG

| Benchmark Metric / Capability | Standard Text-Only RAG | GradientRush (Multimodal RAG) |
|---|:---:|:---:|
| **Understands Spoken Speech** | 🟡 Text transcript only | ✅ Timestamped Audio Segments |
| **Visual Architecture Diagrams** | ❌ Lost / Ignored | ✅ OCR + Frame Vision Embeddings |
| **Temporal Context (Frame + Speech)** | ❌ Isolated | ✅ Bidirectional Temporal Expansion |
| **Cross-Modal Linking** | ❌ None | ✅ Graph Walk Across Modalities |
| **Exact Clickable Provenance** | ❌ None / Raw text | ✅ ⏱ Video Seeking + 📑 PDF Page Jumps |
| **Hallucination Prevention** | ❌ Prone to extrapolation | ✅ Strict Evidence-Grounded Synthesis |

---

## 🎬 3-Minute Live Demo Flow

### Step 1: Open the Apple-Style Dashboard (`http://localhost:5174/`)
* Show the clean, spacious monochrome UI.
* Highlight the multi-format catalog: **PDFs**, **MP4 Videos**, **Audio**, and **PNG Diagrams**.

### Step 2: Showcase Click-to-Seek Video Provenance (`/sources`)
1. Click on **`Database Replication Explained (in 5 Minutes)`**.
2. Point out the split-screen view: native embedded video player on the left, chronological **Evidence Timeline** on the right.
3. **The Magic Click:** Click on any transcript snippet in the timeline (e.g. at `01:23s`).
4. 👉 *The video instantly seeks and plays from that exact second!*

### Step 3: Run the Benchmark Comparison (`/compare`)
1. Navigate to **Benchmark** in the top navigation.
2. Paste the showcase question:
   ```text
   Why is database replication used?
   ```
3. Click **Compare**:
   * **Left (Text-Only RAG):** Shows generic text snippet missing visual diagrams and timestamps.
   * **Right (GradientRush):** Retrieves both the PDF architectural spec and expands across temporal links to pull the exact video speech segment and visual slide.

### Step 4: Ask Multi-Modal Search (`/query`)
Ask:
```text
What architecture is shown when replication is discussed?
```
* Highlight the synthesized response directly citing **Leader-Follower / Primary-Replica** and showing provenance links to **⏱️ 02:41s** and **📑 Page 1**.

---

## 🛠️ Architecture & System Design

```
Raw Sources (Video, Audio, PDF, Image)
                  │
                  ▼
       Multimodal Ingestion Pipeline
   ├── PyMuPDF (PDF text & page numbers)
   ├── Whisper (Timestamped speech segments)
   ├── FFmpeg (Video frames sampled @ 1/15s)
   └── Gemini Vision (OCR & visual descriptions)
                  │
                  ▼
       Evidence & Relationship Graph
   ├── sources table (immutable raw sources)
   ├── evidence table (384d pgvector embeddings)
   └── evidence_relationships table (TEMPORALLY_ALIGNED, SAME_TOPIC)
                  │
                  ▼
         Vector Search & Expansion
   ├── pgvector Cosine Similarity (Top-K Anchors)
   └── 1-Hop Graph Relational Expansion
                  │
                  ▼
     Grounded Synthesis + Clickable UI
   └── Gemini 3.7 / 3.1 Pro + React/Vite Frontend
```

---

## 📊 Verification & Automated Benchmarks

To run the automated validation test suite:

```bash
source venv/bin/activate
PYTHONPATH=. python backend/tests/evaluation/evaluate_retrieval.py
```
