# System Architecture — CBT AI Mental Health Screening & Triage

## Overview

AI-Assisted Mental Health Screening & Triage System with CBT-Informed Response Generation.
A student wellbeing platform that combines safety-first clinical triage, risk-aware RAG retrieval,
and an agentic ReAct loop — all grounded in a fine-tuned CBT model.

---

## Component Diagram

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite)"]
        UA[user_app :5173<br/>Chat · Register · Intake · Consent]
        AA[admin_app :5174<br/>Review Queue · SOAP Export]
    end

    subgraph Backend["Backend (FastAPI :8000)"]
        API[REST API<br/>/chat /register /conversations /memory]
        SG[Safety Gate<br/>Heuristic + Modal]
        AG[Agent Layer<br/>ReAct Loop · 6 Tools]
        RAG[Risk-Aware Retrieval<br/>3-Store Router · bge-m3]
        PB[Prompt Builder<br/>intake + memory + history + chunks]
        UM[User Memory<br/>per-user durable facts]
    end

    subgraph Infra["Infrastructure (Docker)"]
        PG[(PostgreSQL<br/>users · sessions · conversations<br/>user_memory · review_queue)]
        RD[(Redis<br/>rate-limit · circuit-breaker · OTP)]
        MN[(MinIO<br/>SOAP PDFs · audit archive)]
        QD[(Qdrant Local<br/>bge-m3 1024-dim<br/>3 RAG collections + session_memory)]
    end

    subgraph Modal["Modal Cloud (A100-80GB)"]
        LLM[cbt-llm<br/>cbt-qwen2.5-7b-v2<br/>CBT response generator]
        SAF[cbt-safety<br/>cbt-qwen2.5-7b-v2<br/>Crisis · triage L0→L3]
        ORC[cbt-agent<br/>cbt-qwen2.5-7b-v2<br/>ReAct orchestrator]
    end

    subgraph HF["Hugging Face"]
        MODEL[Huysun29/cbt-qwen2.5-7b-v2<br/>Qwen2.5-7B + CBT SFT merged]
        EMB[BAAI/bge-m3<br/>1024-dim embedder]
        RNK[BAAI/bge-reranker-v2-m3<br/>sigmoid reranker]
    end

    UA -->|HTTP/JSON| API
    AA -->|HTTP/JSON| API
    API --> SG
    SG -->|L0/L1 → block| API
    SG -->|L2/L3 → continue| AG
    AG --> RAG
    AG --> UM
    RAG --> QD
    RAG --> EMB
    RAG --> RNK
    AG --> PB
    PB -->|messages| LLM
    SG -->|assess| SAF
    AG -->|orchestrate| ORC
    API --> PG
    API --> RD
    API --> MN
    LLM --> MODEL
    SAF --> MODEL
    ORC --> MODEL
    EMB --> HF
    RNK --> HF
```

---

## Data Flow — Chat Request (L3 Routine)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant B as Backend (FastAPI)
    participant S as Safety Gate (Modal)
    participant R as Qdrant RAG
    participant A as Agent (Modal)
    participant L as LLM Responder (Modal)
    participant DB as PostgreSQL

    U->>B: POST /api/chat {message, conversation_id}
    B->>B: Rate limit check (Redis)
    B->>S: POST /assess {messages}
    S-->>B: {level: "L3", severity: "low", confidence: 0.91}
    B->>B: analyzer.analyze(text) → distortions, emotions
    B->>R: retrieve(query, risk_level="normal", top_k=5)
    R-->>B: chunks from cbt_knowledge_base + response_template_base
    B->>B: should_use_rag() gate (min_score=0.65)
    B->>A: run_agent(user_scrubbed, intake, session_ctx, risk_level)
    A->>L: chat(messages + tools)
    L-->>A: tool_call: retrieve_cbt_knowledge
    A->>R: retrieve(query, risk_level="normal")
    R-->>A: CBT chunks
    A->>L: chat(messages + tool_result)
    L-->>A: tool_call: generate_cbt_response
    A-->>B: {outcome: "drafts", drafts: [...], trace: [...]}
    B->>B: preflight check + grounding score
    B->>DB: INSERT session (status="auto_sent")
    B->>DB: UPDATE user_memory (turn_count++, themes++)
    B-->>U: {final: {technique, response}, triage: {level: "L3"}}
```

---

## Data Flow — Crisis Screening (L0)

```mermaid
sequenceDiagram
    participant U as User
    participant B as Backend
    participant S as Safety Gate

    U->>B: POST /api/chat {message: "I want to end my life"}
    B->>B: Heuristic keyword scan → CRISIS detected
    B-->>U: {level: "L0", crisis_resources: [...], no_ai_response: true}
    Note over B: Agent NEVER runs for L0/L1.<br/>Deterministic safety is authoritative.
```

---

## Risk-Aware RAG — 3-Store Router

```mermaid
graph LR
    RL{Risk Level} -->|normal / moderate| KB[cbt_knowledge_base<br/>CBT techniques · psychoeducation]
    RL -->|all risks| RT[response_template_base<br/>OARS · safety plan templates]
    RL -->|crisis / out_of_scope| SP[safety_policy_base<br/>APA guidelines · 988 Lifeline · SPRC]

    KB --> RNK[bge-reranker-v2-m3<br/>sigmoid score]
    RT --> RNK
    SP --> RNK
    RNK -->|score ≥ 0.65| INJ[Inject into prompt]
    RNK -->|score < 0.65| NOC[No context — generate from weights]
```

---

## Agent ReAct Loop

```mermaid
graph TD
    IN[User message L2/L3] --> ORC[Orchestrator<br/>cbt-qwen2.5-7b-v2]
    ORC -->|tool_call| T1[retrieve_cbt_knowledge]
    ORC -->|tool_call| T2[recall_session_memory]
    ORC -->|tool_call| T3[analyze_cognition]
    T1 --> ORC
    T2 --> ORC
    T3 --> ORC
    ORC -->|terminal| GEN[generate_cbt_response → drafts]
    ORC -->|terminal| CLR[ask_clarification → question]
    ORC -->|terminal| ESC[escalate_to_clinician → pending_review]
    GEN --> POST[preflight + grounding score]
    POST -->|L3| AUTO[auto_sent]
    POST -->|L2| PEND[pending_review → clinician queue]
```

---

## Model — Evaluation Summary (M4)

| Metric | Score |
|---|---|
| Risk classification accuracy | **97.09%** |
| Crisis recall | **96.60%** |
| Response quality (C_quality) | **3.547 / 5** |
| RAG gate use_rag rate | 19.4% |
| Agent mean hops | 1.52 |
| Medication violation rate | **0%** |

Model: `Huysun29/cbt-qwen2.5-7b-v2` (Qwen2.5-7B-Instruct + CBT SFT, full merged)
