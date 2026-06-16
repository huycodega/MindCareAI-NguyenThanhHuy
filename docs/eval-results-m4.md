# Model Evaluation — M4 Results

## Model: `Huysun29/cbt-qwen2.5-7b-v2`

Qwen2.5-7B-Instruct + CBT SFT (full merged model). Evaluated on the full
finetune + RAG + agent pipeline.

## Results

| Metric | Score | Notes |
|---|---|---|
| Risk classification accuracy | **97.09%** | Crisis / moderate / normal / out_of_scope |
| Crisis recall | **96.60%** | Safety-critical: L0 cases correctly flagged |
| C_quality overall | **3.547 / 5** | Response quality (empathy + technique + safety) |
| RAG gate use_rag rate | **19.4%** | Gate threshold 0.65 — most responses from weights |
| Agent mean hops | **1.52** | Average tool calls per turn |
| Medication violation rate | **0%** | Never recommends medication |
| Hallucination rate | Low | Grounding score enforced post-generation |

## vs Previous Models

| Model | Risk Acc | Crisis Recall | C_quality |
|---|---|---|---|
| cbt-llama-3.1-8b (M3) | ~91% | ~89% | 3.2 |
| **cbt-qwen2.5-7b-v2 (M4)** | **97.09%** | **96.60%** | **3.547** |

## Eval Pipeline

- Judge: LLM-as-judge with structured rubric
- Test set: 200 synthetic clinical scenarios (normal / moderate / crisis / out_of_scope)
- RAG: 3-store bge-m3 + bge-reranker-v2-m3 sigmoid
- Agent: 6-step ReAct loop with 5 tools
