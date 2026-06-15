"""
Modal Agent Orchestrator service — Huysun29/cbt-qwen2.5-7b-v2
(the SAME fine-tuned model that serves as the responder) used as the
function-calling "brain" of the CBT agentic loop.

Role: the orchestrator. It decides which tool the backend should run next
(retrieve / analyze / recall / generate / clarify / escalate). The very same
fine-tuned model also writes the final therapeutic copy when the loop calls
generate_cbt_response (via the cbt-llm service). Running ONE model for both
roles keeps the system on your fine-tuned weights end-to-end and matches the
M4 evaluation, where this model self-orchestrated (multi-hop + self-reflection).

Why this works: Qwen2.5-Instruct ships native tool-calling in its chat template
(`apply_chat_template(..., tools=...)`, tool results use role "tool"). The CBT
SFT may bias the model toward its structured-JSON output; the multi-tier parser
below + the backend's graceful fallback mean that if it doesn't emit clean tool
calls, the loop simply degrades to generating a response (≈ the M3 pipeline).

Endpoints used by backend/app/services/agent_client.py:
    POST /chat    { messages, tools, temperature, max_new_tokens }
                  → { content, tool_calls, raw }
    GET  /health  → { status, model, gpu }

Deploy:
    modal deploy modal/agent_service.py

After deploy, add to your .env:
    AGENT_ENABLED=true
    MODAL_AGENT_ENDPOINT=https://<workspace>--cbt-agent-chat.modal.run
    MODAL_AGENT_HEALTH_ENDPOINT=https://<workspace>--cbt-agent-health.modal.run

Notes
-----
- HF_TOKEN reused from the "huggingface" Modal secret (your repo is ungated).
- Shares the "cbt-model-cache" volume so weights download once and are reused
  across cbt-llm / cbt-agent.
- Tool calls are parsed multi-tier (JSON {"name","arguments"|"parameters"}),
  tolerant of prose, mirroring modal/safety_service.py.
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
        "accelerate==1.0.1",
        "huggingface-hub==0.25.2",
        "fastapi==0.115.0",
        "pydantic==2.9.2",
    )
)

app = modal.App("cbt-agent")

HF_REPO = os.environ.get("HF_AGENT_MODEL_REPO",
                         "Huysun29/cbt-qwen2.5-7b-v2")

hf_secret = modal.Secret.from_name("huggingface", required_keys=["HF_TOKEN"])

model_cache = modal.Volume.from_name("cbt-model-cache", create_if_missing=True)


# ─────────────────────────────────────────────────────────────────────────────
# Tool-call parsing
# ─────────────────────────────────────────────────────────────────────────────
def _parse_tool_calls(raw: str):
    """
    Extract tool calls from cbt-qwen2.5-7b-v2 output.

    Returns (content, tool_calls) where tool_calls is a list of
    {"name": str, "arguments": dict}. When no tool call is found, content
    carries the prose and tool_calls is empty.
    """
    text = raw.strip()
    # Strip python tag if present (Qwen2.5 may emit <|python_tag|>)
    text = text.replace("<|python_tag|>", "").strip()

    calls = []

    # Tier 1: one or more JSON objects with "name" + ("parameters"|"arguments")
    for m in re.finditer(r'\{[^{}]*"name"\s*:\s*"[^"]+"[^{}]*\}', text, re.S):
        try:
            obj = json.loads(m.group())
        except json.JSONDecodeError:
            continue
        name = obj.get("name")
        args = obj.get("parameters", obj.get("arguments", {}))
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError:
                args = {"_raw": args}
        if name:
            calls.append({"name": name, "arguments": args or {}})

    if calls:
        return "", calls

    # Tier 2: whole output is a JSON object/array
    try:
        obj = json.loads(text)
        items = obj if isinstance(obj, list) else [obj]
        for it in items:
            if isinstance(it, dict) and it.get("name"):
                args = it.get("parameters", it.get("arguments", {}))
                calls.append({"name": it["name"], "arguments": args or {}})
        if calls:
            return "", calls
    except json.JSONDecodeError:
        pass

    # Tier 3: prose answer, no tool call
    return text, []


# ─────────────────────────────────────────────────────────────────────────────
# Modal class
# ─────────────────────────────────────────────────────────────────────────────
@app.cls(
    gpu="A100-80GB",
    image=image,
    secrets=[hf_secret],
    scaledown_window=300,
    timeout=600,
    startup_timeout=1800,
    volumes={"/root/.cache/huggingface": model_cache},
)
class CBTAgentService:
    @modal.enter()
    def load(self):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from huggingface_hub import login

        login(os.environ["HF_TOKEN"])

        print(f"Loading orchestrator model: {HF_REPO}")
        self.tokenizer = AutoTokenizer.from_pretrained(HF_REPO)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        self.model = AutoModelForCausalLM.from_pretrained(
            HF_REPO,
            torch_dtype=torch.bfloat16,
            device_map="auto",
        )
        self.model.eval()
        print("CBT agent orchestrator ready.")

    @modal.method()
    def chat(self, messages: list, tools: list = None,
             temperature: float = 0.3, max_new_tokens: int = 512) -> dict:
        import torch
        t0 = time.time()

        # Qwen2.5's chat template consumes tool outputs via the native "tool"
        # role, so we pass messages through unchanged (dropping only our extra
        # "tool_calls" key, which the template doesn't need).
        norm = [{"role": m.get("role"), "content": m.get("content", "")}
                for m in messages]

        try:
            prompt = self.tokenizer.apply_chat_template(
                norm, tools=tools or None,
                tokenize=False, add_generation_prompt=True)
        except Exception as e:
            print(f"[AGENT] template with tools failed ({e}); retrying plain")
            prompt = self.tokenizer.apply_chat_template(
                norm, tokenize=False, add_generation_prompt=True)

        inputs = self.tokenizer(
            prompt, return_tensors="pt",
            truncation=True, max_length=6144,
        ).to(self.model.device)

        do_sample = temperature and temperature > 0
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=do_sample,
                temperature=temperature if do_sample else None,
                top_p=0.9 if do_sample else None,
                num_return_sequences=1,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        prompt_len = inputs["input_ids"].shape[1]
        raw = self.tokenizer.decode(
            outputs[0][prompt_len:], skip_special_tokens=True).strip()
        print(f"[AGENT RAW]: {repr(raw[:400])}")

        content, tool_calls = _parse_tool_calls(raw)
        return {
            "content": content,
            "tool_calls": tool_calls,
            "raw": raw,
            "latency_ms": round((time.time() - t0) * 1000),
            "model": HF_REPO,
        }


# ─────────────────────────────────────────────────────────────────────────────
# HTTP endpoints
# ─────────────────────────────────────────────────────────────────────────────
@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
def chat(body: dict):
    """POST /chat — one orchestrator step."""
    svc = CBTAgentService()
    return svc.chat.remote(
        messages=body.get("messages", []),
        tools=body.get("tools", []),
        temperature=float(body.get("temperature", 0.3)),
        max_new_tokens=int(body.get("max_new_tokens", 512)),
    )


@app.function(image=image)
@modal.fastapi_endpoint(method="GET")
def health():
    """GET /health"""
    return {"status": "ok", "model": HF_REPO, "role": "agent_orchestrator"}


# ─────────────────────────────────────────────────────────────────────────────
# Local debug: modal run modal/agent_service.py
# ─────────────────────────────────────────────────────────────────────────────
@app.local_entrypoint()
def debug():
    svc = CBTAgentService()
    tools = [{
        "type": "function",
        "function": {
            "name": "retrieve_cbt_knowledge",
            "description": "Search CBT knowledge base for relevant passages.",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    }]
    messages = [
        {"role": "system", "content": "You are a CBT orchestrator. Use tools "
         "to gather evidence before responding."},
        {"role": "user", "content": "Client says: 'I always fail at everything "
         "and nobody likes me.' Decide the next step."},
    ]
    out = svc.chat.remote(messages=messages, tools=tools)
    print("\n=== ORCHESTRATOR OUTPUT ===")
    print(json.dumps(out, indent=2))
