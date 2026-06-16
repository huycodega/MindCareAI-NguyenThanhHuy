# Risk-Aware 3-Store RAG Retrieval

## Collections (Qdrant, bge-m3 1024-dim, cosine)

| Collection | Used when | Content |
|---|---|---|
| `cbt_rag_bge_m3__cbt_knowledge_base` | normal, moderate | CBT techniques, psychoeducation, NHS guides |
| `cbt_rag_bge_m3__response_template_base` | all risks | OARS templates, safety plan structures |
| `cbt_rag_bge_m3__safety_policy_base` | crisis, out_of_scope | APA guidelines, 988 Lifeline, SPRC |

## Retrieval Pipeline

1. **Query rewrite** by risk level (crisis queries prepend safety keywords)
2. **Dense search** — bge-m3 embeddings, prefetch top-20 per store
3. **Rerank** — bge-reranker-v2-m3 with sigmoid scoring (0–1)
4. **Gate** — inject context only if top-1 score ≥ 0.65 (matches M4 eval)
5. **Dedup** — remove duplicate chunk IDs across stores
6. **Budget** — max 3500 chars total, 900 chars per chunk

## Gate Logic

```python
use_rag = top_score >= min_score (0.65)
# If gate fails → LLM generates from weights only (no hallucinated context)
```

M4 eval: gate triggered 19.4% of turns (most responses generated from model weights).
