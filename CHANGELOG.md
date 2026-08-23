# Version History

## Version 1.5.1 (Docs: Comprehensive Technical & Aesthetic README)
- **High-Impact README**: Created a detailed, colorful, and beautifully structured `README.md` with custom ASCII banner, colorful shields.io badges, system architecture workflow diagrams, 5-stage retrieval pipeline deep dive, 7-tier vector grounding math, and quickstart guides.
- **Verification Suite Documentation**: Documented the 18/18 passing Pytest automated test suite and benchmark evaluation.

## Version 1.5.0 (Feature: Post-Expansion Deduplication, Modality Diversity Reranking & Top-15 Pruning)
- **Candidate Reranking & Pruning**: Implemented smart candidate reranking that compresses the ~61 expanded candidates down to the top 10–15 best evidence items before prompt synthesis.
- **Modality Diversity Preservation**: Balanced selection across PDF documents, speech transcripts, and video frames, preventing one modality from swamping the LLM context.
- **Relationship Strength & Hop Penalties**: Weighted `TEMPORALLY_ALIGNED` (tighter temporal window) and `SAME_TOPIC` (entity overlap) with hop penalties.
- **Token Efficiency & Latency**: Reduced LLM token payload by over 75%, accelerating answer synthesis and eliminating context dilution.

## Version 1.4.9 (UI: Minimalist Apple Footer & AI Disclaimer)
- **Minimalist Footer**: Added an ultra-clean, thin-typography grey footer (`#48484a`, 11px) with an AI verification and accuracy disclaimer.
- **Subtle Branding**: Displays system architecture notes (*Multimodal Graph RAG • Provenance-Preserving Knowledge Engine*) seamlessly blending into the canvas.

## Version 1.4.8 (Fix: Calibrated Confidence Thresholds for Dense Vector Space)
- **Vector Space Calibration**: Calibrated the 7-tier confidence thresholds to the natural distribution of 384-dimensional dense embeddings (`all-MiniLM-L6-v2`), ensuring evidence accurately distributes across `Full`, `Very High`, `High`, `Moderate`, and `Low`.
- **Eliminated Artificial Clustering**: Direct relevant matches now correctly show `Very High` / `High` instead of being artificially penalized as `Moderate`.

## Version 1.4.7 (UI: Monochromatic Desaturated Apple Confidence Badges)
- **Desaturated Confidence Tags**: Replaced saturated color badges with subtle, high-contrast monochrome confidence tags (`Full` through `Zero`) that maintain the Apple-minimalist aesthetic.
- **Badge Readability**: Optimized font weights and background opacity for improved scanning of metadata in high-density evidence lists.

## Version 1.4.6 (Feature: 7-Tier Standardized Confidence Bands & Problem Statement Audit)
- **7-Tier Confidence Classification**: Implemented standardized confidence categories (`Full`, `Very High`, `High`, `Moderate`, `Low`, `Very Low`, `Zero`) mapped directly from cosine vector distance.
- **Color-Coded Badges**: Added sleek color-coded confidence tags on all evidence cards in Search and Benchmark.
- **High-Res Frame Image Previews**: Mounted `/api/media` static route so expanding video frame evidence displays full graphical screenshots.
- **Full Problem Statement Compliance**: Verified all Core Scope (Multimodal Ingestion, Structured Graph Representation, Cross-Modal Temporal/Semantic Relationships, Multi-Source Retrieval) and Stretch Goals against `ProblemStatement.pdf`.

## Version 1.4.5 (Fix: Mathematically Rigorous Vector Metrics)
- **Vector Metrics Rigor**: Replaced misleading 100% confidence scores with exact mathematical vector metrics: `Cosine Distance: {distance}` and `Similarity: {1.0 - distance}` (e.g. Distance 0.3721 -> Similarity 0.6279).
- **Backend & UI Metric Alignment**: Updated FastAPI query API and frontend evidence cards to display verified vector metrics.

## Version 1.4.4 (UI: Top-Aligned Action Buttons)
- **Top-Aligned Buttons**: Form actions (`Compare` and `Search`) stay fixed at the top edge when typing multiline queries.

## Version 1.4.3 (UI: Auto-Expanding Input & Click-to-Expand Evidence Cards)
- **Auto-Growing Input Textarea**: In Search and Benchmark, input boxes smoothly expand in height to show full multiline prompts without horizontal truncation. Supports `Enter` to search and `Shift+Enter` for newlines.
- **Click-to-Expand Evidence Cards**: Users can click any evidence box to expand it, revealing full untruncated text, video frame previews, timestamps, and cosine distance metadata.

## Version 1.4.2 (Fix: Balanced Cross-Modal Retrieval & Multi-Source Synthesis)
- **Balanced Cross-Modal Retrieval**: Eliminates modality starvation in vector search by querying both visual/speech frames and PDF text documents in parallel.
- **Multimodal Benchmark Verification**: Fixed complex cross-modal question where Multimodal RAG accurately describes video diagrams & PDF architecture, while Text-Only baseline correctly fails.
- **Active Model Pool Optimization**: Prioritized high-capacity zero-quota-limit Gemini endpoints in cascading fallback.

## Version 1.4.1 (UI: Left-Aligned Workspace Switcher & Centered Navigation)
- **Left Brand & Workspace Group**: Moved workspace switcher button to the left next to the `GR` logo (`GR / [Workspace ▾]`).
- **Balanced Apple Navbar**: Clean visual separation across Left (Brand & Workspace), Center (Spacious Nav Links), and Right (Google Profile Avatar).

## Version 1.4.0 (Major: Firebase Google Auth & Multi-Tenant User Isolation)
- **Firebase Google Authentication**: 1-click Google Sign-In with popup OAuth flow.
- **Cryptographic Backend Verification**: FastAPI verifies Firebase ID tokens using `google-auth` on every API request.
- **Multi-Tenant User Isolation**: Added `user_id` database index to `projects` so user workspaces and documents are completely private.
- **Apple User Profile UI**: Minimalist user avatar, account details, and one-click Sign Out popover in top navbar.

## Version 1.3.6 (UI: Minimalist Hero Drop Box & Doubled 80px Nav Gap)
- **Minimalist Hero Drop Box**: Right-aligned dashed drop area for immediate drag & drop or click file ingestion.
- **Breathable 80px Nav Gap**: Doubled spacing between navigation items for an open, separated Apple look.

## Version 1.3.5 (UI: Ultra-Minimalist Workspace Switcher)
- **Zero-AI-Slop Minimalism**: Stripped out glowing dots, gradients, and heavy drop-shadows.
- **Clean Apple Typography**: Borderless text button (`#86868b` transitioning to `#ffffff` on hover with a subtle `▾`).
- **Crisp Popover**: Flat dark backdrop with thin hairline borders and clean checkmark selections.

## Version 1.3.4 (Fix: All Workspaces Global Default & Multi-Workspace Toggle)
- **Global View Default**: All historical files and evidence are visible by default under "All Workspaces".
- **Dynamic Mode Badge**: Top-right pill button highlights active workspace or global mode with direct toggle.

## Version 1.3.3 (Fix: All Workspaces Global View & Workspace Switching)
- **All Workspaces Global View**: Added a global viewing mode so all historical documents across all workspaces can be browsed together.
- **Seamless Workspace Switching**: Switch between "All Workspaces", "System Design Workspace", or "New" directly from the top-right button.

## Version 1.3.2 (UI: Seamless Blended Navbar & 63px Height)
- **Taller Navbar**: Increased navbar height to 63px (+15px) for spacious elegance.
- **Borderless Aesthetic**: Removed bottom hairline separator for a continuous flow.
- **Blended Transparent Header**: Navbar blends into the pure black background with frosted glass backdrop blur.

## Version 1.3.1 (UI: GR 360° Rotating Logo & Apple Workspace Popover)
- **GR 360° Rotating Logo**: Bold `GR` emblem on the top-left with smooth 360-degree rotation on hover.
- **Unified Workspace Button**: Single Apple-style pill button on the top-right opening an elevated frosted-glass menu.
- **Top Option '+ New Workspace'**: Prominent new project action placed at the top of the menu with quick modal creation.
- **Active Workspace Indicator**: Subtle checkmarks and source counters for each project.

## Version 1.3.0 (Major: Project-Based Context Isolation & Workspace Bifurcation)
- **Project Workspaces**: Added `projects` entity and relational foreign key scoping across `sources`, `evidence`, and `evidence_relationships`.
- **Scoped Ingestion & Retrieval**: Automatic isolation of file uploads, vector similarity searches, and graph relationship expansions per project.
- **Top Navigation Workspace Switcher**: Apple-style project selector dropdown and `+ New Workspace` modal.
- **100% Context Isolation**: Verified that searches in Workspace A never cross-contaminate or leak into Workspace B.

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
