# Modal services — deployment

Two services power the CBT pipeline in production:

| Service | File | Model | Role |
|---------|------|-------|------|
| Primary LLM | `llm_service.py` | `Huysun29/cbt-qwen2.5-7b-v2` | Primary CBT responder |
| Safety Gate | `safety_service.py` | `Huysun29/cbt-qwen2.5-7b-v2` | Crisis / triage router |

## 1. Install Modal CLI (one-time)

```bash
pip install modal
modal token new     # opens browser to link your Modal account
```

## 2. HuggingFace token secret

The model `Huysun29/cbt-qwen2.5-7b-v2` is hosted on HuggingFace. Make sure your HF_TOKEN has read access.

```bash
modal secret create hf-secret HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxx
```

## 3. Deploy both services

```bash
modal deploy modal/llm_service.py      # primary CBT LLM
modal deploy modal/safety_service.py   # safety gate
```

Each deploy prints two HTTPS URLs. Add all four to your `.env`:

```
MOCK_LLM=false

# Primary CBT LLM — cbt-qwen2.5-7b-v2
MODAL_LLM_ENDPOINT=https://<workspace>--cbt-llm-generate.modal.run
MODAL_HEALTH_ENDPOINT=https://<workspace>--cbt-llm-health.modal.run

# Safety gate — cbt-qwen2.5-7b-v2
MODAL_SAFETY_ENDPOINT=https://<workspace>--cbt-safety-assess.modal.run
MODAL_SAFETY_HEALTH_ENDPOINT=https://<workspace>--cbt-safety-health.modal.run
```

Then restart the backend:

```bash
docker compose restart backend
```

## 4. Verify

```bash
# Health checks
curl $MODAL_HEALTH_ENDPOINT
# → {"status":"ok","model":"Huysun29/cbt-qwen2.5-7b-v2","role":"primary_responder"}

curl $MODAL_SAFETY_HEALTH_ENDPOINT
# → {"status":"ok","model":"Huysun29/cbt-qwen2.5-7b-v2","role":"safety_crisis_gate"}

# Test safety triage
curl -X POST $MODAL_SAFETY_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"system","content":"You are a safety triage system..."},{"role":"user","content":"[CLIENT MESSAGE]\nI feel anxious about work"}]}'
# → {"level":"L3","severity":"low","reason":"...","confidence":0.85}

# Test primary LLM
curl -X POST $MODAL_LLM_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"system","content":"You are a CBT clinician..."},{"role":"user","content":"I feel anxious"}],"n_responses":1}'
```

## Cost notes

| Service | GPU | Cost/hr | Cold start | Request latency |
|---------|-----|---------|------------|-----------------|
| LLM (`cbt-qwen2.5-7b-v2`) | A10G | ~$1.10 | ~25-35 s | ~6-10 s (n=3) |
| Safety gate (`cbt-qwen2.5-7b-v2`) | T4 | ~$0.35 | ~15-20 s | ~1-2 s |

`container_idle_timeout=300` (5 min) — both containers scale to zero
between sessions so demo traffic costs cents.

## Architecture

```
Client message
      │
      ▼
[Safety Gate — cbt-qwen2.5-7b-v2]   ← fast, T4, classifies L0/L1/L2/L3
      │
  L0/L1 ──► No AI, crisis resources / clinician queue
      │
  L2/L3 ──► [Primary LLM — cbt-qwen2.5-7b-v2]  ← CBT response
                    │
                    ▼
              Hybrid RAG (cbt_rag_final, BM25 + dense + RRF)
```
