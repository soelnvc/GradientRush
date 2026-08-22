"""A5. Automated Retrieval Evaluation."""

import json
from pathlib import Path
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.retrieval.search import search_evidence


@pytest.mark.asyncio
async def test_retrieval_hit_rates(session: AsyncSession, seed_demo_corpus):
    """A5: Evaluate Top-1, Top-3, Top-5 hit rate and MRR against ground truth."""
    eval_file = Path(__file__).parent / "questions.json"
    with open(eval_file, "r") as f:
        questions = json.load(f)

    total_questions = len(questions)
    top1_hits = 0
    top3_hits = 0
    top5_hits = 0
    reciprocal_ranks = []

    print("\n" + "=" * 70)
    print("LEVEL 6 RETRIEVAL EVALUATION REPORT")
    print("=" * 70)
    print(f"{'ID':<5} | {'Question':<45} | {'Best Rank':<10} | {'Hit?':<5}")
    print("-" * 70)

    for item in questions:
        q_id = item["id"]
        q_text = item["question"]
        expected_ids = set(item["expected_evidence_ids"])

        results = await search_evidence(session, q_text, limit=5)
        retrieved_ids = [str(ev.id) for ev, _ in results]

        # Calculate rank
        rank = None
        for i, r_id in enumerate(retrieved_ids):
            if r_id in expected_ids:
                rank = i + 1
                break

        if rank is not None:
            reciprocal_ranks.append(1.0 / rank)
            if rank <= 1:
                top1_hits += 1
            if rank <= 3:
                top3_hits += 1
            if rank <= 5:
                top5_hits += 1
            status = "✅ PASS"
            rank_str = f"#{rank}"
        else:
            reciprocal_ranks.append(0.0)
            status = "❌ MISS"
            rank_str = "N/A"

        print(f"{q_id:<5} | {q_text[:45]:<45} | {rank_str:<10} | {status:<5}")

    top1_rate = (top1_hits / total_questions) * 100.0
    top3_rate = (top3_hits / total_questions) * 100.0
    top5_rate = (top5_hits / total_questions) * 100.0
    mrr = sum(reciprocal_ranks) / total_questions

    print("-" * 70)
    print(f"Top-1 Hit Rate: {top1_rate:.1f}% ({top1_hits}/{total_questions})")
    print(f"Top-3 Hit Rate: {top3_rate:.1f}% ({top3_hits}/{total_questions})")
    print(f"Top-5 Hit Rate: {top5_rate:.1f}% ({top5_hits}/{total_questions})")
    print(f"Mean Reciprocal Rank (MRR): {mrr:.3f}")
    print("=" * 70 + "\n")

    # Hackathon target from level6_val.md: Top-5 hit rate >= 80%
    assert top5_rate >= 80.0, f"Top-5 hit rate {top5_rate}% is below 80% target"
