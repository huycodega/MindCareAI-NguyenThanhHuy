"""
Faithfulness probe for the CBT responder.

Goal: verify the responder (cbt-qwen2.5-7b-v2, via prompt_builder + llm_client)
does NOT invent facts about the client — the "bedwetting" class of hallucination.

Method: feed DELIBERATELY SPARSE client messages (little detail, so the model is
tempted to fill gaps) through the real prompt + real Modal model, then print the
client's exact words next to the model's Response so fabricated specifics are
easy to spot. Each case lists the concrete nouns the model introduced that do
NOT appear in the client's input — a quick fabrication smell-test (not a proof).

Run (from backend/, MOCK_LLM=false, responder deployed):
    python scripts/responder_faithfulness_test.py
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

from app.services import prompt_builder, llm_client, post_process, preflight  # noqa: E402

# Sparse / ambiguous cases: minimal facts → maximal temptation to fabricate
# specifics and to invent a technique name.
CASES = [
    {
        "msg": "I've just been feeling really off all week and I can't explain "
               "why. I don't even know what to say.",
        "intake": {"presenting": "general low mood", "reason": "wants to feel better"},
    },
    {
        "msg": "Work has been a lot lately and I'm not coping great.",
        "intake": {"presenting": "stress", "reason": "stress at work"},
    },
    {
        "msg": "I don't know. Things are just hard right now.",
        "intake": {"presenting": "unspecified distress", "reason": "referred by friend"},
    },
    {
        "msg": "I keep thinking I'm going to mess up the presentation tomorrow.",
        "intake": {"presenting": "performance anxiety", "reason": "anxiety"},
    },
    {
        "msg": "I had an argument with my sister and now I feel terrible about "
               "myself, like I always ruin everything.",
        "intake": {"presenting": "low self-worth", "reason": "relationship stress"},
    },
    {
        "msg": "Honestly I'm fine, my mum just made me come here.",
        "intake": {"presenting": "reluctant attender", "reason": "parent-initiated"},
    },
]

_WORD = re.compile(r"\b[a-zA-Z][a-zA-Z\-']{3,}\b")
# common CBT/empathy vocabulary we don't want to flag as "fabricated facts"
_STOP = set("""that this with your feel feeling really been weekають know what
about would could there their thing things very your you're well like just
some have here when then take small step steps notice thought thoughts your
might want help slow together moment sounds make sense understand many people
often hard difficult valid okay sometimes lets let's because while where which
into from they them what's whats sit down""".split())


def fabricated_terms(client_text, intake, response):
    src = (client_text + " " + " ".join(str(v) for v in intake.values())).lower()
    src_tokens = set(_WORD.findall(src))
    out = []
    for w in _WORD.findall(response):
        lw = w.lower()
        if lw in _STOP or lw in src_tokens:
            continue
        out.append(w)
    # keep nouns/specifics that look like claims (dedupe, keep order)
    seen, uniq = set(), []
    for w in out:
        if w.lower() not in seen:
            seen.add(w.lower()); uniq.append(w)
    return uniq


def main():
    for i, c in enumerate(CASES, 1):
        msgs = prompt_builder.build_messages(
            user_input_scrubbed=c["msg"], intake=c["intake"],
            analysis={"severity": "low"}, session_ctx=None, retrieved=[])
        gen = llm_client.generate(msgs, n=1, temperature=0.5)
        draft = post_process.parse_all(gen.get("responses", []))[0]
        resp = draft["response"]

        canon = preflight.canonical_technique(draft["technique"])
        tech_ok = "OK" if canon else "NON-STANDARD (would fail preflight)"
        print("=" * 78)
        print(f"CASE {i}  (mode={gen.get('mode')})")
        print("CLIENT SAID:")
        print(f"  {c['msg']}")
        print(f"  intake: {c['intake']}")
        print("\nMODEL RESPONSE:")
        print(f"  technique: {draft['technique']!r}  ->  {tech_ok}"
              + (f"  (canonical: {canon})" if canon else ""))
        print(f"  {resp}")
        novel = fabricated_terms(c["msg"], c["intake"], resp)
        print("\nNON-CLIENT content words introduced (eyeball for invented "
              "FACTS about the client — generic CBT words are fine):")
        print("  " + (", ".join(novel) if novel else "(none)"))
        print()


if __name__ == "__main__":
    main()
