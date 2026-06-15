"""
Dense embedder (bge-m3) + cross-encoder reranker (bge-reranker-v2-m3).

bge-m3 is 1024-dim, multilingual, max 8192 tokens. The user's existing
Qdrant collections (cbt_knowledge, cbt_examples) were built with bge-m3
so dim/space are guaranteed compatible at retrieval time.

Both models load lazily on first use to keep cold-start fast.
"""
import logging
from typing import List, Tuple, Optional

import torch
from sentence_transformers import SentenceTransformer, CrossEncoder

from app.core.config import settings


log = logging.getLogger(__name__)
_device = "cuda" if torch.cuda.is_available() else "cpu"
_embedder: Optional[SentenceTransformer] = None
_reranker: Optional[CrossEncoder] = None


def get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        log.info("Loading embedder %s on %s",
                 settings.embedding_model, _device)
        _embedder = SentenceTransformer(settings.embedding_model,
                                          device=_device)
    return _embedder


def get_reranker() -> CrossEncoder:
    global _reranker
    if _reranker is None:
        log.info("Loading reranker %s on %s",
                 settings.reranker_model, _device)
        _reranker = CrossEncoder(settings.reranker_model, device=_device,
                                   max_length=512)
    return _reranker


def embed(texts: List[str]) -> List[List[float]]:
    """Returns dense vectors (list of 1024-float lists)."""
    if not texts:
        return []
    vecs = get_embedder().encode(texts, normalize_embeddings=True,
                                   convert_to_numpy=True)
    return vecs.tolist()


def embed_one(text: str) -> List[float]:
    return embed([text])[0]


def _sigmoid(x: float) -> float:
    import math
    # clamp to avoid overflow on large-magnitude logits
    if x >= 0:
        return 1.0 / (1.0 + math.exp(-x))
    e = math.exp(x)
    return e / (1.0 + e)


def rerank(query: str, candidates: List[str],
           top_k: Optional[int] = None,
           apply_sigmoid: bool = True) -> List[Tuple[int, float]]:
    """Returns [(original_index, score), ...] sorted descending by score.

    bge-reranker-v2-m3 outputs a raw relevance logit; with apply_sigmoid
    (default) we map it to a 0–1 probability so scores are comparable to the
    M3/M4 eval gate (rag_min_score=0.65)."""
    if not candidates:
        return []
    pairs = [(query, c) for c in candidates]
    scores = get_reranker().predict(pairs)
    out = []
    for i, s in enumerate(scores):
        v = _sigmoid(float(s)) if apply_sigmoid else float(s)
        out.append((i, v))
    ranked = sorted(out, key=lambda x: -x[1])
    if top_k:
        ranked = ranked[:top_k]
    return ranked
