# Modal Deployment Guide

## Services

| App | File | GPU | Model |
|---|---|---|---|
| `cbt-llm` | `modal/llm_service.py` | A100-80GB | `Huysun29/cbt-qwen2.5-7b-v2` |
| `cbt-safety` | `modal/safety_service.py` | A100-80GB | `Huysun29/cbt-qwen2.5-7b-v2` |
| `cbt-agent` | `modal/agent_service.py` | A100-80GB | `Huysun29/cbt-qwen2.5-7b-v2` |

All three share `cbt-model-cache` volume — weights downloaded once and reused.

## Deploy Steps

```bash
# 1. Login to Modal account
modal token new

# 2. Create HuggingFace secret (one-time)
modal secret create huggingface HF_TOKEN=hf_...

# 3. Deploy all services
modal deploy modal/llm_service.py
modal deploy modal/safety_service.py
modal deploy modal/agent_service.py
```

## Post-Deploy

Copy URLs from deploy output into `backend/.env`:

```env
MODAL_LLM_ENDPOINT=https://<workspace>--cbt-llm-generate.modal.run
MODAL_HEALTH_ENDPOINT=https://<workspace>--cbt-llm-health.modal.run
MODAL_SAFETY_ENDPOINT=https://<workspace>--cbt-safety-assess.modal.run
MODAL_SAFETY_HEALTH_ENDPOINT=https://<workspace>--cbt-safety-health.modal.run
MODAL_AGENT_ENDPOINT=https://<workspace>--cbt-agent-chat.modal.run
MODAL_AGENT_HEALTH_ENDPOINT=https://<workspace>--cbt-agent-health.modal.run
MOCK_LLM=false
AGENT_ENABLED=true
```

## Cold Start

First request after deploy takes 2–5 minutes (model load into VRAM).
Subsequent requests within `scaledown_window=300s` are fast (~5–15s).
