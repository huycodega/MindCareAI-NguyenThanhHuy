"""
Modal Safety Gate service — Huysun29/cbt-qwen2.5-7b-v2
(QWen2.5-7B Instruct + CBT safety LoRA adapter)

Role: safety/crisis gate — router and guard for the CBT pipeline.
      Classifies every client message before the main LLM responds.

Endpoints used by backend/app/services/safety_gate.py:
    POST /assess   { messages } → { level, severity, reason, confidence }
    GET  /health   → { status, model, gpu }

Deploy:
    modal deploy modal/safety_service.py

After deploy, add to your .env:
    MODAL_SAFETY_ENDPOINT=https://<workspace>--cbt-safety-assess.modal.run
    MODAL_SAFETY_HEALTH_ENDPOINT=https://<workspace>--cbt-safety-health.modal.run

Notes
-----
- QWen2.5-7B uses a standard chat template with a system role.
- T4 (16 GB) is sufficient for 7B bf16 inference.
- temperature=0.05 keeps triage nearly deterministic.
- The model outputs JSON in the format:
    {"level":"L0|L1|L2|L3","severity":"...","reason":"...","confidence":0.0}
"""
import os
import json
import re
import time

import modal

# ─────────────────────────────────────────────────────────────────────────────
# Container image
# ─────────────────────────────────────────────────────────────────────────────
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "torch==2.4.1",
        "transformers==4.45.2",
        "peft==0.13.2",
        "accelerate==1.0.1",
        "huggingface-hub==0.25.2",
        "fastapi==0.115.0",
        "pydantic==2.9.2",
    )
)

app = modal.App("cbt-safety")

HF_REPO = os.environ.get("HF_SAFETY_MODEL_REPO", "Huysun29/cbt-qwen2.5-7b-v2-v2")
HF_BASE = os.environ.get("HF_SAFETY_BASE_MODEL", "Qwen/Qwen2.5-7B-Instruct")
# v2 ships as a FULL MERGED model → load HF_REPO directly. Set "false" to use
# the legacy base + LoRA path (e.g. the old cbt-qwen2.5-7b-v2 adapter).
SAFETY_IS_MERGED = os.environ.get("SAFETY_IS_MERGED", "true").lower() != "false"

hf_secret = modal.Secret.from_name("huggingface", required_keys=["HF_TOKEN"])

SYSTEM_PROMPT = (
    "You are a mental health safety triage system trained as a clinical CBT "
    "specialist. Your ONLY task is to classify the client message into exactly "
    "one safety level and return structured JSON.\n\n"
    "Safety levels:\n"
    "  L0 CRISIS   — active suicidal or homicidal ideation, immediate danger\n"
    "  L1 HIGH     — passive ideation or significant self-harm risk\n"
    "  L2 MODERATE — clinical distress (depression/anxiety/ptsd) without "
    "imminent danger\n"
    "  L3 ROUTINE  — general mental-health concern, standard CBT response\n\n"
    "Respond ONLY with valid JSON (no markdown, no explanation):\n"
    '{"level":"<L0|L1|L2|L3>","severity":"<critical|high|moderate|low>",'
    '"reason":"<one sentence>","confidence":<0.0-1.0>}'
)


# ─────────────────────────────────────────────────────────────────────────────
# Modal class
# ─────────────────────────────────────────────────────────────────────────────
model_cache = modal.Volume.from_name("cbt-model-cache", create_if_missing=True)

@app.cls(
    gpu="A100-80GB",
    image=image,
    secrets=[hf_secret],
    scaledown_window=300,
    timeout=600,
    startup_timeout=1800,
    volumes={"/root/.cache/huggingface": model_cache},
)
class CBTSafetyService:
    @modal.enter()
    def load(self):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from huggingface_hub import login

        login(os.environ["HF_TOKEN"])

        tok_src = HF_REPO if SAFETY_IS_MERGED else HF_BASE
        print(f"Loading safety tokenizer: {tok_src}")
        self.tokenizer = AutoTokenizer.from_pretrained(tok_src)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        weights_src = HF_REPO if SAFETY_IS_MERGED else HF_BASE
        print(f"Loading safety model: {weights_src} (merged={SAFETY_IS_MERGED})")
        model = AutoModelForCausalLM.from_pretrained(
            weights_src,
            torch_dtype=torch.bfloat16,
            device_map="auto",
        )
        if not SAFETY_IS_MERGED:
            from peft import PeftModel
            print(f"Attaching safety LoRA: {HF_REPO}")
            model = PeftModel.from_pretrained(model, HF_REPO)
        self.model = model
        self.model.eval()
        print(f"CBT safety gate ready: {HF_REPO}")

    @modal.method()
    def assess(self, messages: list) -> dict:
        import torch
        t0 = time.time()

        prompt = self.tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True)

        inputs = self.tokenizer(
            prompt, return_tensors="pt",
            truncation=True, max_length=1024,
        ).to(self.model.device)

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=120,
                do_sample=True,
                temperature=0.05,
                top_p=0.9,
                num_return_sequences=1,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        prompt_len = inputs["input_ids"].shape[1]
        raw = self.tokenizer.decode(
            outputs[0][prompt_len:], skip_special_tokens=True).strip()

        print(f"[SAFETY RAW OUTPUT]: {repr(raw[:300])}")

        # ── Try original format: {"level":"L0-3", ...} ──────────────────────
        m = re.search(r'\{[^{}]*"level"\s*:\s*"L[0-3]"[^{}]*\}', raw, re.S)
        if m:
            try:
                result = json.loads(m.group())
                return {
                    "level": result.get("level", "L3"),
                    "severity": result.get("severity", "low"),
                    "reason": result.get("reason", ""),
                    "confidence": float(result.get("confidence", 0.7)),
                    "latency_ms": round((time.time() - t0) * 1000),
                    "mode": "modal", "model": HF_REPO,
                }
            except (json.JSONDecodeError, ValueError):
                pass

        # ── cbt-qwen2.5-7b-v2 schema: {"risk_level":"normal|moderate|crisis|
        #    out_of_scope", "rationale":..., ...}. Map risk_level → L0–L3. ─────
        m2 = re.search(r'"risk_level"\s*:\s*"([a-z_]+)"', raw)
        if m2:
            level = _risk_to_level(m2.group(1))
            reason = ""
            try:
                obj = json.loads(re.search(r'\{.*\}', raw, re.S).group())
                reason = str(obj.get("rationale") or obj.get("reason")
                             or obj.get("response") or "")[:150]
            except Exception:
                pass
            return {
                "level": level, "severity": _lv_to_sev(level),
                "reason": reason, "confidence": 0.8,
                "latency_ms": round((time.time() - t0) * 1000),
                "mode": "modal", "model": HF_REPO,
            }

        # ── Try model's actual output format ─────────────────────────────────
        # Model outputs: {"assessment":..., "next_steps":..., "recommendations":[...]}
        try:
            data = json.loads(raw)
            assessment = (data.get("assessment", "") + " " +
                          data.get("next_steps", "")).lower()
            level = _infer_level(assessment)
            return {
                "level": level,
                "severity": _lv_to_sev(level),
                "reason": data.get("assessment", "")[:150],
                "confidence": 0.72,
                "latency_ms": round((time.time() - t0) * 1000),
                "mode": "modal", "model": HF_REPO,
            }
        except (json.JSONDecodeError, ValueError):
            pass

        # ── Keyword scan fallback ─────────────────────────────────────────────
        low = raw.lower()
        level = _infer_level(low)
        return {"level": level, "severity": _lv_to_sev(level),
                "reason": "inferred from model text",
                "confidence": 0.5, "mode": "modal_text"}


def _infer_level(text: str) -> str:
    """Infer triage level from free-text model output."""
    if any(w in text for w in ("suicid", "end my life", "want to die",
                                "kill myself", "immediate danger", "crisis",
                                "emergency", "life-threatening")):
        return "L0"
    if any(w in text for w in ("self-harm", "harm", "hopeless", "passive ideation",
                                "high risk", "significant risk", "urgent")):
        return "L1"
    if any(w in text for w in ("depress", "anxi", "ptsd", "trauma", "distress",
                                "moderate", "specialist", "professional",
                                "further evaluation", "mental health")):
        return "L2"
    return "L3"


def _risk_to_level(rl: str) -> str:
    """Map the fine-tuned model's risk_level → triage level (safety-first).
    'crisis' → L0 (no AI, crisis resources). The backend heuristic still runs
    FIRST and splits L0 (active) vs L1 (passive) by keywords, so lumping crisis
    into L0 here is the cautious default, never a downgrade."""
    return {"crisis": "L0", "moderate": "L2",
            "out_of_scope": "L2", "normal": "L3"}.get(rl, "L3")


def _lv_to_sev(lv: str) -> str:
    return {"L0": "critical", "L1": "high", "L2": "moderate"}.get(lv, "low")


# ─────────────────────────────────────────────────────────────────────────────
# HTTP endpoints
# ─────────────────────────────────────────────────────────────────────────────
@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
def assess(body: dict):
    """POST /assess  — safety triage for a client message"""
    svc = CBTSafetyService()
    return svc.assess.remote(messages=body.get("messages", []))


@app.function(image=image)
@modal.fastapi_endpoint(method="GET")
def health():
    """GET /health"""
    return {
        "status": "ok",
        "model": HF_REPO,
        "base": HF_BASE,
        "role": "safety_crisis_gate",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Local debug entrypoint: modal run modal/safety_service.py
# ─────────────────────────────────────────────────────────────────────────────
@app.local_entrypoint()
def debug():
    svc = CBTSafetyService()
    test_messages = [
        "I feel anxious and avoid going to the shelter",
        "I want to end my life, I can't take it anymore",
        "I've been feeling very depressed lately",
    ]
    for text in test_messages:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"[CLIENT MESSAGE]\n{text}"},
        ]
        result = svc.assess.remote(messages=messages)
        print(f"\nInput: {text}")
        print(f"Output: {result}")
