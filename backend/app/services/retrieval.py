"""
Retrieval orchestrator v2 — risk-aware, role-routed, 3-store retriever.

This mirrors the retriever used in the M3/M4 evaluation (cbt_rag_eval_pipeline
CBTRetriever) so the deployed system behaves like the version that was
measured:

  bge-m3 (normalized) dense search per store, filtered by `risk_allowed`
  + `doc_role`  →  bge-reranker-v2-m3 (sigmoid)  →  top-k
  with role-aware routing (STORE_USAGE / ROLE_BY_RISK_AND_STORE /
  QUERY_REWRITE_BY_RISK / STORE_PRIORITY), safety store capped at k=3,
  dedupe by source_url+head, sort by rerank score.

Stores (prefix = settings.rag_collection_prefix):
  __cbt_knowledge_base      — CBT concepts / techniques / psychoeducation
  __response_template_base  — response structures / communication templates
  __safety_policy_base      — crisis / safety / boundary policy

`retrieve(query, risk_level, top_k)` returns chunks shaped for the rest of
the pipeline (prompt_builder, grounding_nli, sessions.retrieved_ids):
  {id, text, source_collection, doc_role, score_dense, score_rerank, payload}

`should_use_rag(risk_level, chunks)` is the same minimal gate as the eval:
only normal/moderate, and only if the top-1 rerank score ≥ rag_min_score.

Graceful degradation: any store/search/rerank failure is logged and skipped;
worst case retrieve() returns [] and chat.py proceeds without context.
"""
import logging
from typing import Dict, List, Tuple

from app.core.config import settings
from app.services import qdrant_client as qd
from app.services import embedder


log = logging.getLogger(__name__)

# ── Router (copied verbatim from cbt_rag_eval_pipeline to stay in lockstep) ──
STORE_USAGE = {
    "cbt_knowledge_base":     {"use_when": ["normal", "moderate"]},
    "response_template_base": {"use_when": ["normal", "moderate",
                                            "out_of_scope", "crisis"]},
    "safety_policy_base":     {"use_when": ["normal", "moderate", "crisis",
                                            "out_of_scope", "self_harm",
                                            "suicide",
                                            "diagnosis_or_medication_request"]},
}
ROLE_BY_RISK_AND_STORE = {
    "crisis": {
        "safety_policy_base": ["crisis_policy", "risk_detection_policy"],
        "response_template_base": ["crisis_response_template",
                                   "communication_template"],
    },
    "out_of_scope": {
        "safety_policy_base": ["ai_safety_boundary", "crisis_policy"],
        "response_template_base": ["communication_template"],
    },
    "normal": {
        "cbt_knowledge_base": ["cbt_knowledge", "cbt_technique_steps",
                               "psychoeducation", "cbt_workbook",
                               "cbt_worksheet"],
        "response_template_base": ["response_structure",
                                   "communication_template"],
    },
    "moderate": {
        "cbt_knowledge_base": ["cbt_knowledge", "cbt_technique_steps",
                               "psychoeducation", "cbt_workbook",
                               "cbt_worksheet"],
        "response_template_base": ["response_structure",
                                   "communication_template"],
    },
}
QUERY_REWRITE_BY_RISK = {
    "crisis": ("suicide crisis safety plan warning signs coping strategies "
               "emergency support 988 "),
    "out_of_scope": ("medical advice medication dosage diagnosis boundary "
                     "redirect to licensed healthcare professional "),
    "normal": "", "moderate": "",
}
STORE_PRIORITY = ["safety_policy_base", "cbt_knowledge_base",
                  "response_template_base"]


def _coll(store: str) -> str:
    return f"{settings.rag_collection_prefix}__{store}"


def _filter(risk_level: str, doc_roles):
    """Qdrant payload filter: risk_allowed MatchAny + doc_role MatchAny."""
    from qdrant_client.http import models as qm
    must = [qm.FieldCondition(key="risk_allowed",
                              match=qm.MatchAny(any=[risk_level]))]
    if doc_roles:
        must.append(qm.FieldCondition(key="doc_role",
                                      match=qm.MatchAny(any=list(doc_roles))))
    return qm.Filter(must=must)


def _store_search(store: str, query: str, top_k: int,
                  risk_level: str, doc_roles) -> List[Dict]:
    coll = _coll(store)
    q_vec = embedder.embed_one(query)
    try:
        hits = qd.search(coll, q_vec, limit=settings.rag_prefetch_k,
                         filter_dict=_filter(risk_level, doc_roles))
    except Exception as e:
        log.warning("Qdrant search failed on %s: %s", coll, e)
        return []
    if not hits:
        return []

    passages = [(h.payload or {}).get("content", "") for h in hits]
    try:
        ranked = embedder.rerank(query, passages)   # sigmoid, sorted desc
    except Exception as e:
        log.warning("Reranker failed on %s (%s) — dense order", coll, e)
        ranked = [(i, float(getattr(hits[i], "score", 0.0) or 0.0))
                  for i in range(len(hits))]

    out = []
    for orig_idx, rs in ranked[:top_k]:
        h = hits[orig_idx]
        pl = dict(h.payload or {})
        out.append({
            "id": str(h.id),
            "text": pl.get("content", ""),
            "source_collection": store,
            "doc_role": pl.get("doc_role"),
            "source_name": pl.get("source_name"),
            "source_url": pl.get("source_url"),
            "score_dense": float(getattr(h, "score", 0.0) or 0.0),
            "score_rerank": float(rs),
            "payload": pl,
        })
    return out


def retrieve(query: str, risk_level: str = "normal",
             top_k: int = None) -> List[Dict]:
    """Risk-routed multi-store retrieval. Returns reranked chunks (top_k)."""
    top_k = top_k or settings.rag_final_top_k
    rq = QUERY_REWRITE_BY_RISK.get(risk_level, "") + query

    rows: List[Dict] = []
    for store in STORE_PRIORITY:
        if risk_level not in STORE_USAGE.get(store, {}).get("use_when", []):
            continue
        roles = ROLE_BY_RISK_AND_STORE.get(risk_level, {}).get(store)
        if not roles:
            continue
        k = settings.rag_safety_top_k if store == "safety_policy_base" else top_k
        rows += _store_search(store, rq, k, risk_level, roles)

    # dedupe by source_url + first 200 chars, then sort by rerank score
    seen, dedup = set(), []
    for r in rows:
        key = f"{r.get('source_url')}::{(r.get('text') or '')[:200]}"
        if key in seen:
            continue
        seen.add(key)
        dedup.append(r)
    dedup.sort(key=lambda x: (x.get("score_rerank") or 0.0), reverse=True)
    return dedup[:top_k]


def should_use_rag(risk_level: str, chunks: List[Dict],
                   min_score: float = None) -> Tuple[bool, str]:
    """Minimal RAG gate (matches eval _should_use_rag): only normal/moderate
    and only when the top-1 rerank score clears rag_min_score."""
    min_score = settings.rag_min_score if min_score is None else min_score
    if risk_level == "crisis":
        return False, "crisis_no_rag"
    if risk_level == "out_of_scope":
        return False, "out_of_scope_no_rag"
    if risk_level not in ("normal", "moderate"):
        return False, "unsupported_risk_no_rag"
    if not chunks:
        return False, "no_context"
    if (chunks[0].get("score_rerank") or 0.0) < min_score:
        return False, "low_score"
    return True, "use_rag"
