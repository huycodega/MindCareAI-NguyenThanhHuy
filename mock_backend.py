from datetime import datetime, timezone
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="CBT Assistant Mock API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

conversations = {}
queue = {}
audit = []
memory_summary = "Prefers short, practical CBT exercises and gentle check-ins."


class LoginBody(BaseModel):
    username: str
    password: str
    expected_role: str = "user"


class ChatBody(BaseModel):
    message: str
    conversation_id: str | None = None


class IntakeBody(BaseModel):
    raw_text: str


class ScreeningBody(BaseModel):
    phq9_score: int | None = None
    gad7_score: int | None = None
    risk_flags: list[str] | None = None


@app.get("/api/health")
def health():
    return {
        "api": "ok",
        "mock_llm": True,
        "primary_responder": "mock-local",
        "safety_gate": "heuristic-local",
        "calibration": {"loaded": False},
        "agent": {"enabled": False},
    }


@app.post("/api/login")
def login(body: LoginBody):
    if body.expected_role == "admin":
        if body.username not in ("clinician", "admin") or body.password != "clinic123":
            raise HTTPException(status_code=401, detail="Invalid admin demo account")
        return {"token": "mock-admin-token", "username": "clinician", "role": "admin"}

    if body.username not in ("user", "user@gmail.com") or body.password != "user123":
        raise HTTPException(status_code=401, detail="Invalid user demo account")
    return {"token": "mock-user-token", "username": "user", "role": "user"}


@app.get("/api/me")
def me():
    return {
        "username": "user",
        "role": "user",
        "consent_required": False,
        "intake_required": False,
    }


@app.post("/api/consent")
def consent():
    return {"ok": True}


@app.post("/api/intake")
def intake(body: IntakeBody):
    return {"ok": True, "parsed": {"reason": body.raw_text[:120]}}


@app.get("/api/my/intake")
def my_intake():
    return {
        "demographics": {"age": "demo"},
        "presenting": "Feeling stressed and overthinking.",
        "reason": "Local demo profile",
        "phq9_score": 5,
        "gad7_score": 7,
    }


@app.get("/api/memory")
def memory():
    return {"summary": memory_summary, "turn_count": sum(len(c["messages"]) for c in conversations.values())}


@app.get("/api/conversations")
def list_conversations():
    items = [
        {"id": cid, "title": c["title"], "updated_at": c["updated_at"]}
        for cid, c in conversations.items()
    ]
    items.sort(key=lambda x: x["updated_at"], reverse=True)
    return {"conversations": items}


@app.post("/api/conversations")
def create_conversation():
    cid = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    conversations[cid] = {"title": "New conversation", "messages": [], "updated_at": now}
    return {"id": cid, "title": "New conversation"}


@app.get("/api/conversations/{cid}")
def get_conversation(cid: str):
    c = conversations.get(cid)
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"id": cid, "title": c["title"], "messages": c["messages"]}


@app.patch("/api/conversations/{cid}")
def rename_conversation(cid: str, payload: dict):
    if cid in conversations:
        conversations[cid]["title"] = payload.get("title") or conversations[cid]["title"]
    return {"ok": True}


@app.delete("/api/conversations/{cid}")
def delete_conversation(cid: str):
    conversations.pop(cid, None)
    return {"ok": True}


@app.post("/api/chat")
def chat(body: ChatBody):
    text = body.message.strip()
    cid = body.conversation_id or str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    if cid not in conversations:
        title = text[:34] + ("..." if len(text) > 34 else "")
        conversations[cid] = {"title": title or "New conversation", "messages": [], "updated_at": now}

    lower = text.lower()
    crisis = any(word in lower for word in ["suicide", "kill myself", "end my life", "want to die"])
    anxious = any(word in lower for word in ["anxious", "anxiety", "panic", "stress", "overwhelmed"])
    level = "L0" if crisis else ("L2" if anxious else "L3")

    conversations[cid]["messages"].append({"role": "user", "content": text})
    conversations[cid]["updated_at"] = now

    if crisis:
        msg = "I am really sorry you are feeling this. Please contact emergency support or a trusted person now."
        conversations[cid]["messages"].append(
            {"role": "system", "content": msg, "status": "crisis", "triage_level": "L0"}
        )
        return {
            "conversation_id": cid,
            "outcome": "crisis",
            "triage": {"triage_level": "L0", "severity": "critical", "confidence": 0.95},
            "message": msg,
            "crisis_resources": {
                "vn": {"name": "Vietnam emergency", "phone": "115", "url": "tel:115"},
                "us": {"name": "988 Lifeline", "phone": "988", "url": "https://988lifeline.org"},
            },
        }

    response = (
        "Thanks for sharing that. A small CBT step: write down the thought, "
        "name the feeling, then ask: what is one kinder or more balanced way to view this?"
    )
    technique = "Thought record" if anxious else "Cognitive reframing"
    conversations[cid]["messages"].append(
        {"role": "assistant", "content": response, "technique": technique}
    )
    sid = str(uuid4())
    if level == "L2":
        queue[sid] = {
            "session_id": sid,
            "triage_level": "L2",
            "user_input": text,
            "username": "user",
        }
    audit.append({"ts": now, "action": "mock_chat", "detail": {"triage": level}})
    return {
        "conversation_id": cid,
        "session_id": sid,
        "outcome": "answered",
        "triage": {"triage_level": level, "severity": "moderate" if level == "L2" else "low", "confidence": 0.72},
        "final": {"response": response, "technique": technique},
        "drafts": [
            {"response": response, "technique": technique},
            {"response": "Try one minute of slow breathing, then write one next step.", "technique": "Grounding"},
        ],
    }


@app.get("/api/my/sessions")
def my_sessions():
    return {"sessions": []}


@app.get("/api/my/session/{sid}")
def my_session(sid: str):
    return {"id": sid, "status": "answered", "final_reply": "Mock reviewed reply.", "final_technique": "Reframing"}


@app.post("/api/screening")
def submit_screening(body: ScreeningBody):
    return {
        "ok": True,
        "phq9_score": body.phq9_score or 0,
        "gad7_score": body.gad7_score or 0,
        "risk_flags": body.risk_flags or [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/screening/history")
def screening_history(limit: int = 20):
    return {"items": []}


@app.get("/api/screening/latest")
def latest_screening():
    return {"phq9_score": 5, "gad7_score": 7, "created_at": datetime.now(timezone.utc).isoformat()}


@app.get("/api/admin/stats")
def admin_stats():
    return {
        "total_sessions": sum(len(c["messages"]) for c in conversations.values()),
        "pending_review": len(queue),
        "by_triage_level": {"L0": 0, "L1": 0, "L2": len(queue), "L3": 1},
        "technique_distribution": {"Thought record": 2, "Grounding": 1},
    }


@app.get("/api/admin/queue")
def admin_queue():
    return {"queue": list(queue.values())}


@app.get("/api/admin/session/{sid}")
def admin_session(sid: str):
    item = queue.get(sid)
    if not item:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        **item,
        "triage_reason": "Mock moderate distress marker",
        "confidence": 0.72,
        "analysis": {
            "emotion": "anxiety",
            "severity": "moderate",
            "cognitive_distortions": "catastrophizing",
            "technique_hint": "thought record",
        },
        "drafts": [
            {
                "response": "Let's slow this down and examine the thought together.",
                "technique": "Thought record",
                "rationale": "Helps separate facts from interpretations.",
                "plan": "Identify thought, evidence, balanced alternative.",
                "preflight_pass": True,
                "hallucination_score": 0.9,
            }
        ],
    }


@app.post("/api/admin/review/{sid}")
def admin_review(sid: str, payload: dict):
    queue.pop(sid, None)
    audit.append({"ts": datetime.now(timezone.utc).isoformat(), "action": "review", "detail": payload})
    return {"ok": True}


@app.get("/api/admin/audit")
def admin_audit():
    return {"audit": audit[-20:]}


@app.post("/api/admin/dpo-export")
def dpo_export():
    return {"ok": True, "count": 0}
