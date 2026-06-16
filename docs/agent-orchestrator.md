# Agent Orchestrator — ReAct Loop

## Overview

The agent runs a ReAct (Reason + Act) loop for L2/L3 messages only.
L0/L1 are handled deterministically — agent never runs for crisis cases.

## Tools

| Tool | Type | Description |
|---|---|---|
| `retrieve_cbt_knowledge` | retrieval | Risk-aware 3-store RAG search |
| `recall_session_memory` | retrieval | Semantic search over past sessions (Qdrant) |
| `analyze_cognition` | analysis | Detect distortions + emotions in text |
| `generate_cbt_response` | **terminal** | Build prompt + call LLM → drafts |
| `ask_clarification` | **terminal** | Return question to user (no draft) |
| `escalate_to_clinician` | **terminal** | Force pending_review even on L3 |

## Loop

```
orchestrator (cbt-qwen2.5-7b-v2) → tool_call
  → backend executes tool → result appended as role:tool
  → orchestrator decides next step
  → repeat (max 6 steps)
  → terminal tool called → outcome returned
```

## Outcomes

- `drafts` → post-process → L3 auto_sent / L2 pending_review
- `needs_clarification` → question returned to user immediately
- `escalate` → ReviewQueue created with priority=1

## Feature Flag

```env
AGENT_ENABLED=true
MODAL_AGENT_ENDPOINT=https://...
```

When `AGENT_ENABLED=false` or endpoint unset → system falls back to deterministic pipeline silently.

## M4 Eval Results

- Mean agent hops: **1.52** (most tasks resolved in 1-2 tool calls)
- Risk accuracy: **97.09%**
- Crisis recall: **96.60%**
