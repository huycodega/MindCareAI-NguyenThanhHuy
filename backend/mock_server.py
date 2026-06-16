"""
Standalone MOCK backend for local UI development.

Why this exists
---------------
The real backend (app/) needs Postgres (it uses postgresql-only column types:
JSONB / UUID / INET / ARRAY), Redis, MinIO and Qdrant — normally brought up via
docker-compose. When Docker isn't running, the Vite dev proxy can't reach
:8000 and every request fails with "Error 500".

This server has ZERO infrastructure dependencies (no DB, in-memory only) and
implements just enough of the API surface for BOTH the user app (:5173) and the
admin app (:5174) to work against canned data.

Run:
    python -m uvicorn mock_server:app --port 8000 --reload
(run from the backend/ directory)

Seed accounts (same as the real backend):
    user      / user123    → role "user"   (user app)
    clinician / clinic123   → role "admin"  (admin app)
"""
import base64
import json
import time
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="CBT Assistant — MOCK API", version="mock-1.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


# The dev proxy forwards "/api/login" unchanged → strip the prefix so routes
# can be declared as "/login", "/health", etc.
@app.middleware("http")
async def strip_api_prefix(request: Request, call_next):
    if request.scope["path"].startswith("/api/"):
        request.scope["path"] = request.scope["path"][4:]
    elif request.scope["path"] == "/api":
        request.scope["path"] = "/"
    return await call_next(request)


# ── In-memory state ───────────────────────────────────────────────
SEED_USERS = {
    "user":      {"password": "user123",  "role": "user",  "email": "user@example.com"},
    "clinician": {"password": "clinic123", "role": "admin", "email": "clinician@example.com"},
}
CONVERSATIONS: dict[str, dict] = {}   # cid -> {id, title, messages:[]}


def make_token(username: str, role: str) -> str:
    raw = json.dumps({"u": username, "r": role, "t": time.time()}).encode()
    return "mock." + base64.urlsafe_b64encode(raw).decode().rstrip("=")


def parse_token(request: Request):
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer mock."):
        return None
    try:
        b = auth[len("Bearer mock."):]
        b += "=" * (-len(b) % 4)
        return json.loads(base64.urlsafe_b64decode(b))
    except Exception:
        return None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Health ────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "mock_llm": True,
        "primary_responder": "cbt-qwen2.5-7b-v2 (mock)",
        "model_repo": "Huysun29/cbt-qwen2.5-7b-v2",
        "safety_gate": "heuristic (mock)",
        "calibration": {"loaded": False, "global_temperature": 1.0},
    }


# ── Auth ──────────────────────────────────────────────────────────
@app.post("/login")
async def login(request: Request):
    body = await request.json()
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    expected_role = body.get("expected_role")

    # accept username or email
    rec = SEED_USERS.get(username)
    if not rec:
        rec = next((v | {"_u": k} for k, v in SEED_USERS.items()
                    if v["email"] == username.lower()), None)
        username = rec["_u"] if rec else username
    if not rec or rec["password"] != password:
        return JSONResponse({"detail": "Invalid username or password"}, status_code=401)
    if expected_role and expected_role != rec["role"]:
        return JSONResponse(
            {"detail": f"Account role '{rec['role']}' is not allowed on this app "
                       f"(expects '{expected_role}')"}, status_code=403)

    return {
        "token": make_token(username, rec["role"]),
        "username": username,
        "role": rec["role"],
        "consent_required": False,
        "intake_required": False,
    }


@app.post("/register")
async def register(request: Request):
    body = await request.json()
    return {"ok": True, "email": body.get("email"), "message": "OTP sent (mock: any code works)"}


@app.post("/verify-otp")
async def verify_otp(request: Request):
    body = await request.json()
    email = (body.get("email") or "user@example.com")
    return {
        "token": make_token(email, "user"),
        "username": email, "role": "user",
        "consent_required": True, "intake_required": True,
    }


@app.post("/resend-otp")
async def resend_otp():
    return {"ok": True}


@app.get("/me")
def me(request: Request):
    tok = parse_token(request)
    if not tok:
        return JSONResponse({"detail": "Not authenticated"}, status_code=401)
    return {
        "username": tok["u"], "role": tok["r"],
        "consent_required": False, "intake_required": False,
    }


@app.post("/consent")
def consent():
    return {"ok": True, "consent_at": now_iso()}


@app.post("/intake")
async def intake(request: Request):
    return {"ok": True, "intake_id": str(uuid.uuid4())}


@app.get("/my/intake")
def my_intake():
    return {"intake": None}


# ── Chat (user app) ───────────────────────────────────────────────
MOCK_REPLIES = [
    ("Cognitive reframing",
     "Thank you for sharing that with me. What you're feeling is valid. Let's try to look "
     "at the situation from a slightly different angle — what's one small piece of evidence "
     "that things could go okay?"),
    ("Grounding (5-4-3-2-1)",
     "Let's slow things down together. Name 5 things you can see, 4 you can hear, 3 you can "
     "touch, 2 you can smell, and 1 you can taste. Grounding helps bring you back to the present."),
    ("Behavioral activation",
     "That sounds heavy. Sometimes a tiny, doable step helps more than a big plan. What is one "
     "small thing you could do today that usually gives you a little energy?"),
]


@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    msg = body.get("message", "")
    cid = body.get("conversation_id") or str(uuid.uuid4())
    convo = CONVERSATIONS.setdefault(cid, {"id": cid, "title": (msg[:40] or "New chat"), "messages": []})
    convo["messages"].append({"role": "user", "content": msg})

    idx = int(time.time()) % len(MOCK_REPLIES)
    technique, response = MOCK_REPLIES[idx]
    convo["messages"].append({"role": "assistant", "content": response, "technique": technique})

    return {
        "outcome": "answered",
        "conversation_id": cid,
        "triage": {"triage_level": "L3"},
        "final": {"response": response, "technique": technique},
        "drafts": [{"technique": technique, "response": response}],
    }


@app.get("/my/sessions")
def my_sessions():
    return {"sessions": []}


@app.get("/my/session/{sid}")
def my_session(sid: str):
    return {"status": "answered", "final_reply": "Reviewed and approved.", "final_technique": "Cognitive reframing"}


@app.get("/conversations")
def list_conversations():
    return {"conversations": [{"id": c["id"], "title": c["title"]} for c in CONVERSATIONS.values()]}


@app.post("/conversations")
def create_conversation():
    cid = str(uuid.uuid4())
    CONVERSATIONS[cid] = {"id": cid, "title": "New chat", "messages": []}
    return {"conversation_id": cid, "id": cid, "title": "New chat"}


@app.get("/conversations/{cid}")
def get_conversation(cid: str):
    return CONVERSATIONS.get(cid, {"id": cid, "title": "New chat", "messages": []})


@app.patch("/conversations/{cid}")
async def patch_conversation(cid: str, request: Request):
    body = await request.json()
    if cid in CONVERSATIONS:
        CONVERSATIONS[cid]["title"] = body.get("title", CONVERSATIONS[cid]["title"])
    return {"ok": True}


@app.delete("/conversations/{cid}")
def delete_conversation(cid: str):
    CONVERSATIONS.pop(cid, None)
    return {"ok": True}


@app.get("/memory")
def memory():
    return {"turn_count": 0, "summary": None}


# ── Screening ─────────────────────────────────────────────────────
@app.post("/screening")
async def screening(request: Request):
    return {"ok": True, "score": 6, "severity": "mild", "recommendation": "Keep tracking how you feel."}


@app.get("/screening/history")
def screening_history():
    return {"history": []}


@app.get("/screening/latest")
def screening_latest():
    return {"latest": None}


# ── Admin ─────────────────────────────────────────────────────────
@app.get("/admin/queue")
def admin_queue():
    return {"queue": []}


@app.get("/admin/session/{sid}")
def admin_session(sid: str):
    return {"session_id": sid, "status": "pending", "drafts": []}


@app.post("/admin/review/{sid}")
async def admin_review(sid: str, request: Request):
    return {"ok": True, "session_id": sid}


@app.get("/admin/stats")
def admin_stats():
    return {
        "total_lessons": 48, "active": 36, "drafts": 8,
        "avg_completion_rate": 63, "pending_review": 0, "resolved_today": 0,
    }


@app.get("/admin/audit")
def admin_audit():
    return {"audit": []}


@app.post("/admin/dpo-export")
def dpo_export():
    return {"ok": True, "url": None}


@app.get("/")
def root():
    return {"service": "CBT mock backend", "docs": "/docs"}
