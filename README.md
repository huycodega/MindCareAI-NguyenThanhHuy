# CBT AI — Mental Health Screening & Triage System

> **AI-Assisted Mental Health Screening & Triage System with CBT-Informed Response Generation**
>
> A student wellbeing platform combining safety-first clinical triage (L0–L3),
> risk-aware RAG retrieval, and an agentic ReAct loop — powered by a fine-tuned
> CBT model (`cbt-qwen2.5-7b-v2`) deployed on Modal A100-80GB.

---

## Architecture

See [`docs/architecture.md`](./docs/architecture.md) for full component diagrams and data flow.

**Quick overview:**

```
Browser → FastAPI backend → Safety Gate (Modal) → Agent ReAct Loop (Modal)
                         ↓                               ↓
                    Qdrant RAG                    LLM Responder (Modal)
                    (3-store)                     cbt-qwen2.5-7b-v2
                         ↓
              PostgreSQL · Redis · MinIO
```

---

## Features

- **Gmail self-registration + OTP** — 6-digit email verification, 10-min TTL
- **Multi-turn conversation threads** — persistent tasktab per user
- **Per-user durable memory** — recurring themes, techniques used, turn history
- **Risk-aware triage** — L0 (crisis) → L3 (routine), heuristic + model
- **3-store RAG** — `cbt_knowledge_base` + `response_template_base` + `safety_policy_base`
- **Agent orchestrator** — ReAct loop: retrieve → analyze → generate / clarify / escalate
- **Clinician review queue** — L2 responses held for approval before delivery
- **Admin dashboard** — SOAP export, audit log, clinician copilot

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, user app (:5173) + admin app (:5174) |
| Backend | FastAPI (Python 3.11), SQLAlchemy, Alembic |
| Database | PostgreSQL 16 (PHI AES-256-GCM encrypted) |
| Cache / Queue | Redis 7 (OTP, rate-limit, circuit-breaker) |
| Object Store | MinIO (SOAP PDFs, audit archive) |
| Vector Store | Qdrant (local file mode, bge-m3 1024-dim) |
| Embeddings | BAAI/bge-m3 + bge-reranker-v2-m3 (sigmoid) |
| LLM | Huysun29/cbt-qwen2.5-7b-v2 on Modal A100-80GB |
| Infra | Docker Compose (local) + Modal (cloud inference) |

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker Desktop
- Modal account + CLI (`pip install modal`)

### 1. Clone & install

```bash
git clone <repo-url>
cd cbt_v4

# Backend
cd backend && pip install -r requirements.txt && cd ..

# Frontend (user app)
cd user_app && npm install && cd ..

# Frontend (admin app)
cd admin_app && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example backend/.env
```

Edit `backend/.env` — required fields:

```env
# ── LLM (Modal endpoints — get from `modal deploy` output) ──
MOCK_LLM=false
MODAL_LLM_ENDPOINT=https://<workspace>--cbt-llm-generate.modal.run
MODAL_HEALTH_ENDPOINT=https://<workspace>--cbt-llm-health.modal.run
MODAL_SAFETY_ENDPOINT=https://<workspace>--cbt-safety-assess.modal.run
MODAL_SAFETY_HEALTH_ENDPOINT=https://<workspace>--cbt-safety-health.modal.run
MODAL_AGENT_ENDPOINT=https://<workspace>--cbt-agent-chat.modal.run
MODAL_AGENT_HEALTH_ENDPOINT=https://<workspace>--cbt-agent-health.modal.run
AGENT_ENABLED=true

# ── HuggingFace ──
HF_TOKEN=hf_...

# ── Security (generate once, keep stable) ──
PHI_AES_KEY_B64=<base64 of 32 random bytes>   # openssl rand -base64 32
JWT_SECRET=<hex string>                         # openssl rand -hex 32

# ── RAG data (path to built Qdrant collections) ──
QDRANT_LOCAL_PATH=/path/to/data/qdrant_local

# ── Email OTP (leave empty for DEV mode — OTP logged to console) ──
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
```

> **DEV mode** (`MOCK_LLM=true`): backend runs without Modal, returns mock responses.
> Perfect for frontend development.

### 3. Start infrastructure

```bash
docker-compose up -d postgres redis minio
```

### 4. Run database migration

```bash
cd backend && alembic upgrade head
```

### 5. Deploy Modal services (first time)

```bash
# Ensure logged in to the correct Modal account
modal token new

modal deploy modal/llm_service.py
modal deploy modal/safety_service.py
modal deploy modal/agent_service.py
```

Copy the printed URLs into `backend/.env`.

### 6. Start backend

```bash
cd backend && uvicorn app.main:app --reload
```

### 7. Start frontends

```bash
# Terminal 1
cd user_app && npm run dev      # http://localhost:5173

# Terminal 2
cd admin_app && npm run dev     # http://localhost:5174
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `MOCK_LLM` | ✅ | `true` | `false` = call Modal; `true` = mock response |
| `MODAL_LLM_ENDPOINT` | when `MOCK_LLM=false` | — | Modal generate endpoint URL |
| `MODAL_SAFETY_ENDPOINT` | when `MOCK_LLM=false` | — | Modal safety assess URL |
| `MODAL_AGENT_ENDPOINT` | when `AGENT_ENABLED=true` | — | Modal agent chat URL |
| `AGENT_ENABLED` | — | `false` | Enable ReAct agent loop for L2/L3 |
| `HF_TOKEN` | — | — | HuggingFace token (for private repos) |
| `DATABASE_URL` | ✅ | `postgresql+psycopg://cbt:cbt_dev_pw@localhost:5432/cbt` | Postgres connection string |
| `REDIS_URL` | ✅ | `redis://localhost:6379/0` | Redis connection string |
| `QDRANT_LOCAL_PATH` | ✅ | `/app/data/qdrant_local` | Path to pre-built RAG Qdrant DB |
| `PHI_AES_KEY_B64` | ✅ (prod) | auto-generated | 32-byte AES key for PHI encryption |
| `JWT_SECRET` | ✅ (prod) | `change-me-in-prod-please` | JWT signing secret |
| `SMTP_HOST` | — | `""` (DEV mode) | SMTP server for OTP emails |
| `OTP_DEV_ECHO` | — | `true` | Echo OTP in API response (DEV only) |
| `ALLOWED_EMAIL_DOMAINS` | — | `["gmail.com"]` | Allowed registration domains |
| `N_RESPONSES` | — | `3` | Number of LLM drafts per request |
| `TEMPERATURE` | — | `0.65` | LLM sampling temperature |
| `TRIAGE_CRISIS_THRESHOLD` | — | `0.85` | Safety gate crisis confidence threshold |

---

## Sample API Queries

### Register + OTP

```bash
# Step 1: Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "student@gmail.com", "password": "mypassword123"}'

# Response (DEV mode): {"message": "OTP sent", "dev_otp": "294810"}

# Step 2: Verify OTP
curl -X POST http://localhost:8000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "student@gmail.com", "otp": "294810"}'
```

### Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "student@gmail.com", "password": "mypassword123"}'

# Response: {"access_token": "eyJ...", "token_type": "bearer"}
```

### Send a chat message

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have been feeling overwhelmed and anxious about my exams",
    "conversation_id": null
  }'

# Response:
# {
#   "session_id": "...",
#   "conversation_id": "...",
#   "triage": {"level": "L3", "severity": "low", "confidence": 0.91},
#   "final": {
#     "technique": "Socratic questioning",
#     "response": "It sounds like exam pressure is building up..."
#   },
#   "outcome": "answered",
#   "mode": "modal"
# }
```

### List conversations

```bash
curl http://localhost:8000/api/conversations \
  -H "Authorization: Bearer eyJ..."
```

### Check user memory

```bash
curl http://localhost:8000/api/memory \
  -H "Authorization: Bearer eyJ..."

# Response:
# {
#   "turn_count": 6,
#   "recurring_themes": ["fear", "catastrophizing", "all-or-nothing"],
#   "techniques_used": ["socratic questioning", "decatastrophizing"],
#   "summary": "6 turns; recurring: fear, catastrophizing"
# }
```

### Health check

```bash
curl http://localhost:8000/api/health

# Response:
# {
#   "api": "ok",
#   "mock_llm": false,
#   "llm":    {"reachable": true, "status": "ok", "model": "Huysun29/cbt-qwen2.5-7b-v2"},
#   "safety": {"reachable": true, "status": "ok"},
#   "agent":  {"reachable": true, "status": "ok"}
# }
```

---

## Triage Levels

| Level | Meaning | Action |
|---|---|---|
| **L0** CRISIS | Active suicidal/homicidal ideation | Crisis resources shown, NO AI response |
| **L1** HIGH | Passive ideation / self-harm risk | No draft, pushed to clinician immediately |
| **L2** MODERATE | Clinical distress (depression/anxiety) | AI drafts, held for clinician review |
| **L3** ROUTINE | General mental health concern | AI responds automatically (CBT + RAG) |

---

## AI Logging

All Claude Code interactions are automatically logged to `.ai-log/session.jsonl`
and pushed to the course grading server in real-time.

```bash
# Manual submit (if needed)
cd C2-App-109
python scripts/submit_log.py
```

---

## Weekly Journal

See [JOURNAL.md](./JOURNAL.md) for weekly product journey and learnings.
See [WORKLOG.md](./WORKLOG.md) for technical decisions and brainstorming.

---

## Gate Resources

| Gate | Resource |
|---|---|
| Gate 1 | [Project Brief](https://www.notion.so/Project-Brief-378534a1531380ae93cad798fff87fdc) · [PRD](https://www.notion.so/PRD_EduVault-378534a15313807b8e4fc30feaf83043) · [Wireframe](https://drive.google.com/file/d/1O-7x5yfBniNPIQPw9KyfbYuHF5C76d81/view) |
| Gate 2 | Model eval (M3/M4) · Architecture diagram · 10 merged PRs |
