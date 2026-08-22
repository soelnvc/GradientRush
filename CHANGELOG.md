# Version History

## Version 1.2.1 (Resilience: 5-Level Deep AI Model Fallback Architecture)
- **5-Tier Cloud Model Fallback**: Implemented automated cascading across `gemini-3.7-flash` → `gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite`.
- **Zero-Downtime Deterministic Fallback**: Automatic extractive fallback so queries never fail even if all cloud API quotas are exhausted.
- **Failover Across All AI Modalities**: Automated retry & fallback integrated for vision analysis, concept extraction, and RAG answer synthesis.

## Version 1.2.0 (Level 12: Final Boss & Demo Readiness)
- **All Levels (0–12) Complete**: 100% feature-complete implementation of the Multimodal Knowledge Engine.
- **Judge Pitch & Demo Playbook**: Created comprehensive `DEMO.md` containing the 60-second elevator pitch, live walkthrough steps, and Text-RAG vs Multimodal comparison matrices.
- **End-to-End Verification**: Confirmed cross-modal relationship expansion, timestamp seeking, PDF citations, and grounded answer synthesis.

## Version 1.1.1 (UI Polish: Apple Monochrome Redesign)
- **Apple Premium Aesthetics**: Pure black `#000000` monochrome theme with elevated translucent glass surfaces and subtle borders.
- **Navbar Redesign**: Center-aligned navigation with wide 48px spacing, thin typography (12px SF Pro), and frosted glass blur.
- **Spacious Layout**: Unboxed canvas layout removing claustrophobic containers.
- **Apple SF Pro Typography**: Integrated SF Pro / Inter font stack across all views with refined letter spacing and antialiasing.
- **UI Components**: Pill-shaped action buttons and clean status badges across Dashboard, Library, Search, and Benchmark views.

## Version 1.1.0 (Checkpoint 4: Levels 9-11)
- **Level 9 (Product UI)**: Interactive media viewer (PDF embedded iframe + HTML5 video player) with clickable timestamp-to-seek evidence timeline.
- **Level 10 (Ground Truth Evaluation)**: Automated benchmark suite (`evaluate_retrieval.py`) for multimodal cross-modal validation.
- **Level 11 (Baseline Comparison)**: Split-screen Compare UI (`/compare`) and backend `text_only_baseline` flag demonstrating Multimodal RAG vs Text-only RAG.
- **Performance & Reliability**: FastAPI `BackgroundTasks` non-blocking pipeline execution, Vite development proxy, and fast entity relationship indexing.

## Version 1.0.0 (Checkpoint 1-3: Levels 0-8)
- Infrastructure setup (Docker, PostgreSQL, pgvector)
- Multimodal Ingestion (Video, Audio, PDF, Image)
- Evidence Data Model with Provenance
- Temporal and Semantic Relationships
- Cross-Modal RAG with Relationship Expansion
- Clickable Provenance and Modality UI
