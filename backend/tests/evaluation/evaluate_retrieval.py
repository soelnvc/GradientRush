"""Level 10: Automated Ground Truth Evaluation for Multimodal RAG."""

import json
import asyncio
from pathlib import Path
import httpx

# Resolve directories
BASE_DIR = Path(__file__).parent.parent.parent.parent
QUESTIONS_FILE = BASE_DIR / "demo_data/groundtruth/questions.json"
API_BASE = "http://localhost:8000"

async def run_evaluation():
    with open(QUESTIONS_FILE, "r") as f:
        data = json.load(f)
        
    test_cases = data.get("test_cases", [])
    print(f"\n========================================================")
    print(f"LEVEL 10: MULTIMODAL RAG GROUND TRUTH EVALUATION")
    print(f"========================================================")
    print(f"Loaded {len(test_cases)} test cases.\n")
    
    passed_cases = 0
    total_cases = len(test_cases)
    
    async with httpx.AsyncClient() as client:
        for tc in test_cases:
            q_id = tc["id"]
            question = tc["question"]
            required_concepts = tc.get("evaluation_criteria", {}).get("required_concepts", [])
            
            print(f"[{q_id}] Query: '{question}'")
            try:
                res = await client.post(f"{API_BASE}/api/query", json={"question": question}, timeout=60.0)
                if res.status_code != 200:
                    print(f"  ❌ Failed with status {res.status_code}")
                    continue
                
                result = res.json()
                answer = result["answer"].lower()
                evidence_list = result["evidence"]
                
                # Check for multimodal evidence (cross-modal RAG success)
                modalities = {e["modality"] for e in evidence_list}
                
                # Check concepts
                concepts_found = []
                concepts_missing = []
                for concept in required_concepts:
                    # Loose matching for evaluation
                    tokens = [t.strip().lower() for t in concept.split("/")]
                    if any(t in answer for t in tokens):
                        concepts_found.append(concept)
                    else:
                        concepts_missing.append(concept)
                
                # Success criteria: 
                # 1. Answer has all concepts
                # 2. Evidence spans more than 1 modality (proving cross-modal expansion worked)
                if len(concepts_missing) == 0 and len(modalities) > 1:
                    print("  ✅ PASS: Answer covers all required concepts and uses multimodal evidence.")
                    passed_cases += 1
                else:
                    print(f"  ❌ FAIL:")
                    if len(concepts_missing) > 0:
                        print(f"      Missing concepts: {concepts_missing}")
                    if len(modalities) <= 1:
                        print(f"      Expected multimodal evidence, found only: {modalities}")
                        
            except Exception as e:
                print(f"  ❌ ERROR: {e}")
                
            print("-" * 56)
            
    print(f"\nEvaluation Complete: {passed_cases}/{total_cases} tests passed.")
    print(f"========================================================\n")
    
    # Assert for automated runners
    assert passed_cases == total_cases, f"Only {passed_cases}/{total_cases} passed."

if __name__ == "__main__":
    asyncio.run(run_evaluation())
