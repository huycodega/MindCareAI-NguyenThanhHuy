"""
Structured triage decision log — the foundation for a labeled eval set.

WHY THIS EXISTS
───────────────
We currently can only reason about triage quality from a handful of live
examples. To tune thresholds / context windows responsibly we need DATA:
every triage decision, with the raw model output and enough signal to label
it later. This module appends one JSONL line per decision.

SAFETY / PRIVACY
────────────────
The client message itself is NEVER written here — only its sha256 hash and a
short, scrubbed preview (first ~160 chars, PII-scrubbed by the caller). The
file is meant to live alongside the encrypted DB, queryable for building an
eval set, without becoming a second copy of plaintext PHI.

This module is best-effort: any failure is swallowed and logged at WARNING.
Triage must never break because logging broke.
"""
import json
import logging
import os
import threading
from datetime import datetime, timezone
from typing import Dict, Optional

from app.core.config import settings


log = logging.getLogger(__name__)

# Appends from multiple request threads (uvicorn workers share a process)
# are serialized so JSONL lines never interleave.
_LOCK = threading.Lock()


def _ensure_dir(path: str) -> None:
    d = os.path.dirname(path)
    if d and not os.path.isdir(d):
        os.makedirs(d, exist_ok=True)


def record(
    *,
    text_hash: str,
    preview: str,
    triage: Dict,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
    turn_index: Optional[int] = None,
    history_len: Optional[int] = None,
) -> None:
    """Append one triage decision to the JSONL log. Never raises.

    `triage` is the dict returned by safety_gate.assess(); we lift out the
    fields most useful for later labeling/tuning. The richer shadow fields
    (heuristic_level, model_level, raw_model, disagreement) are written when
    present so we can measure regex-vs-model false positives.
    """
    if not settings.triage_log_enabled:
        return
    try:
        row = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "text_hash": text_hash,
            "preview": (preview or "")[:160],
            # final decision actually used by the pipeline
            "level": triage.get("triage_level"),
            "severity": triage.get("severity"),
            "source": triage.get("source"),
            "reason": triage.get("reason"),
            "confidence": triage.get("confidence"),
            "confidence_raw": triage.get("confidence_raw"),
            "calibration_T": triage.get("calibration_T"),
            # shadow signal: what each path independently said
            "heuristic_level": triage.get("heuristic_level"),
            "model_level": triage.get("model_level"),
            "model_confidence": triage.get("model_confidence"),
            "raw_model": triage.get("raw_model"),
            "disagreement": triage.get("disagreement"),
            # context for the "does history help?" experiment
            "user_id": user_id,
            "session_id": session_id,
            "conversation_id": conversation_id,
            "turn_index": turn_index,
            "history_len": history_len,
            # left null now; filled by a human/judge later to build the eval set
            "label": None,
        }
        line = json.dumps(row, ensure_ascii=False)
        with _LOCK:
            _ensure_dir(settings.triage_log_path)
            with open(settings.triage_log_path, "a", encoding="utf-8") as f:
                f.write(line + "\n")
    except Exception as e:  # logging must never break triage
        log.warning("triage_log.record failed: %s", e)
