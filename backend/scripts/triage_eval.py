"""
Triage log analyzer — turns the raw triage decision log into the numbers you
actually need to tune the safety gate, and into a labeling template that
becomes the eval set.

Usage (from backend/):
    python scripts/triage_eval.py                 # summary on the configured log
    python scripts/triage_eval.py --path FILE     # analyze a specific JSONL
    python scripts/triage_eval.py --suspects      # list candidate false positives
    python scripts/triage_eval.py --export OUT     # write a labeling template

WHAT IT TELLS YOU
─────────────────
1. Distribution of final triage levels.
2. How often the heuristic regex HARD-OVERRODE to L0/L1 while the model would
   have said L2/L3 — these are the prime false-positive suspects.
3. Overall heuristic-vs-model disagreement rate.

Nothing here changes behavior; it only reads the log written by triage_log.py.
"""
import argparse
import json
import os
import sys
from collections import Counter

# Windows consoles default to cp1252 and choke on the bar/emoji glyphs below.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# allow running from backend/ without installing the package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings  # noqa: E402


def _load(path):
    rows = []
    if not os.path.isfile(path):
        print(f"[!] No log file at {path}")
        print("    Send a few chats first, or pass --path to a real file.")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


_SEVERITY = {"L0": 3, "L1": 2, "L2": 1, "L3": 0}


def _suspects(rows):
    """Over-triage candidates: the FINAL level was L0/L1 (no-AI / escalate),
    but the OTHER signal — whichever path didn't make the call — independently
    said L2/L3. Catches BOTH directions:
      • regex hard-overrode to L0/L1, model would have said L2/L3
      • model escalated to L1, the regex saw only L2/L3 markers   (← msg #1/#3)
    Both are worth a human look before we trust the escalation."""
    out = []
    for r in rows:
        final = r.get("level")
        hl, ml = r.get("heuristic_level"), r.get("model_level")
        if final not in ("L0", "L1"):
            continue
        others = [lv for lv in (hl, ml)
                  if lv and lv != final and _SEVERITY.get(lv, 9) < _SEVERITY[final]]
        if others:
            r["_other_said"] = "/".join(others)
            out.append(r)
    return out


def summary(rows):
    n = len(rows)
    print(f"\n=== Triage log summary — {n} decisions ===\n")

    levels = Counter(r.get("level") for r in rows)
    print("Final level distribution:")
    for lv in ("L0", "L1", "L2", "L3"):
        c = levels.get(lv, 0)
        bar = "█" * round(40 * c / n) if n else ""
        print(f"  {lv}: {c:4d}  {bar}")

    src = Counter(r.get("source") for r in rows)
    print("\nDecision source:")
    for k, v in src.most_common():
        print(f"  {k}: {v}")

    # disagreement only counts rows where the model actually ran
    judged = [r for r in rows if r.get("model_level")]
    disagree = [r for r in judged if r.get("disagreement")]
    if judged:
        rate = 100 * len(disagree) / len(judged)
        print(f"\nHeuristic-vs-model disagreement: "
              f"{len(disagree)}/{len(judged)} ({rate:.0f}%)")
    else:
        print("\nNo rows where the model ran alongside the heuristic yet "
              "(mock mode, or shadow disabled).")

    susp = _suspects(rows)
    print(f"\n⚠ False-positive suspects (regex forced L0/L1, model said L2/L3): "
          f"{len(susp)}")
    if susp:
        print("  Run with --suspects to inspect, or --export to label them.\n")


def show_suspects(rows):
    susp = _suspects(rows)
    if not susp:
        print("No false-positive suspects. 🎉")
        return
    print(f"\n{len(susp)} over-triage suspect(s) — final L0/L1 but another "
          f"signal said L2/L3:\n")
    for r in susp:
        print(f"  [{r.get('ts','')[:19]}] FINAL={r['level']} "
              f"(regex={r.get('heuristic_level')}, model={r.get('model_level')}, "
              f"other_said={r.get('_other_said')}, conf {r.get('model_confidence')})")
        print(f"    preview: {r.get('preview','')}")
        print(f"    model raw: {r.get('raw_model','')}\n")


def export_template(rows, out_path):
    """Write a labeling template: every decision with a blank `label` for a
    human to fill (the true level). That labeled file is the eval set."""
    susp_hashes = {r.get("text_hash") for r in _suspects(rows)}
    with open(out_path, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps({
                "text_hash": r.get("text_hash"),
                "preview": r.get("preview"),
                "system_level": r.get("level"),
                "heuristic_level": r.get("heuristic_level"),
                "model_level": r.get("model_level"),
                "is_fp_suspect": r.get("text_hash") in susp_hashes,
                "label": "",   # <-- human fills the TRUE level here (L0/L1/L2/L3)
                "notes": "",
            }, ensure_ascii=False) + "\n")
    print(f"Wrote labeling template ({len(rows)} rows) → {out_path}")
    print("Fill the `label` field with the true level to build the eval set.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--path", default=settings.triage_log_path)
    ap.add_argument("--suspects", action="store_true")
    ap.add_argument("--export", metavar="OUT")
    args = ap.parse_args()

    rows = _load(args.path)
    if args.export:
        export_template(rows, args.export)
    elif args.suspects:
        show_suspects(rows)
    else:
        summary(rows)


if __name__ == "__main__":
    main()
