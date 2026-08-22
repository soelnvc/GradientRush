# Version History

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
