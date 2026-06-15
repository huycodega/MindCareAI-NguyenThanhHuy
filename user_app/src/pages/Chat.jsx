import { useState, useEffect, useRef } from "react";
import { api } from "../api.js";
import Mascot from "../components/Mascot.jsx";
import PageHero from "../components/PageHero.jsx";

const TRIAGE_LABEL = {
  L0: "Emergency",
  L1: "High risk — Clinician notified",
  L2: "Pending review",
  L3: "Routine",
};

const PROMPT_CHIPS = [
  { label: "Anxiety",        text: "I've been feeling really anxious lately and I can't calm down." },
  { label: "Work stress",    text: "Work has been overwhelming and I feel burned out." },
  { label: "Can't sleep",    text: "I keep overthinking at night and can't fall asleep." },
  { label: "Feeling down",   text: "I've been feeling down and unmotivated for a while." },
  { label: "Relationships",  text: "I'm struggling with a relationship and don't know what to do." },
];

function CrisisResources({ res }) {
  if (!res) return null;
  return (
    <div className="crisis-box">
      <div className="crisis-title">🆘 Crisis Support Available Now</div>
      {Object.values(res).map((r) => (
        <div key={r.name} className="crisis-item">
          <strong>{r.name}</strong>
          <span>{r.phone}</span>
          <a href={r.url} target="_blank" rel="noreferrer">
            {r.url}
          </a>
        </div>
      ))}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="bubble bubble-ai">
      <div className="bubble-avatar"><Mascot variant="chat" size={34} /></div>
      <div className="bubble-body typing-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function TriageBadge({ level }) {
  if (!level) return null;
  return (
    <span className={`triage-badge triage-${level}`}>
      <span className="triage-dot" />
      {level} · {TRIAGE_LABEL[level]}
    </span>
  );
}

// Convert backend conversation messages → local render shape.
function hydrate(messages) {
  const out = [];
  for (const m of messages) {
    if (m.role === "user") {
      out.push({ role: "user", text: m.content });
    } else if (m.role === "assistant") {
      out.push({
        role: "ai",
        outcome: "answered",
        response: m.content,
        technique: m.technique,
      });
    } else if (m.role === "system") {
      const isCrisis = m.status === "crisis";
      out.push({
        role: "ai",
        outcome: isCrisis ? "crisis" : "pending",
        triage: { triage_level: m.triage_level },
        message: m.content,
      });
    }
  }
  return out;
}

const MOOD_WEEK = ["😊","🙂","😊","😐","😔"];

function RightPanel({ onUseTip, conversations, activeId, onOpenConvo }) {
  return (
    <div className="chat-right-panel">

      {/* Streak tracker */}
      <div className="rp-streak-card">
        <div className="rp-streak-left">
          <div className="rp-streak-num">5</div>
          <div className="rp-streak-label">Day streak 🔥</div>
        </div>
        <div className="rp-streak-moods">
          {MOOD_WEEK.map((e, i) => <span key={i} className="rp-mood-dot">{e}</span>)}
        </div>
      </div>

      {/* Today's tip — compact */}
      <div className="rp-tip-card">
        <div className="rp-tip-top">
          <span className="rp-tip-icon">💡</span>
          <span className="rp-tip-label">Today's Tip</span>
          <Mascot variant="success" size={44} style={{ marginLeft: "auto", flexShrink: 0 }} />
        </div>
        <div className="rp-tip-text">
          Name 3 things you can see, hear, and feel. Grounding pulls you back to the present.
        </div>
      </div>

      {/* Recent conversations */}
      {conversations.length > 0 && (
        <div className="rp-recent-card">
          <div className="rp-recent-title">Recent chats</div>
          {conversations.slice(0, 3).map((c) => (
            <button
              key={c.id}
              className={`rp-convo-item ${c.id === activeId ? "active" : ""}`}
              onClick={() => onOpenConvo(c.id)}
            >
              <span className="rp-convo-icon">💬</span>
              <span className="rp-convo-title">{c.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Breathing exercise */}
      <div className="breathing-card">
        <div className="breathing-icon">🌬️</div>
        <div className="breathing-title">4-7-8 Breathing</div>
        <div className="breathing-text">
          Inhale 4s · hold 7s · exhale 8s. Ease tension fast.
        </div>
        <button
          className="breathing-btn"
          onClick={() => onUseTip("Can you guide me through the 4-7-8 breathing exercise?")}
        >
          Start now
        </button>
      </div>

      {/* Emergency hotline */}
      <div className="emergency-card-chat">
        <div className="emergency-chat-title">🆘 Emergency Hotline</div>
        <div className="emergency-chat-text">
          In crisis? You're not alone — reach out now.
        </div>
        <a className="emergency-chat-phone" href="tel:1800599920">📞 1800 599 920</a>
        <div className="emergency-chat-sub">24/7 · Free & confidential</div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [memory, setMemory] = useState(null);
  const [histOpen, setHistOpen] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    refreshSidebar();
    return () => clearInterval(pollRef.current);
  }, []);

  async function refreshSidebar() {
    try {
      const [c, m] = await Promise.all([
        api.listConversations(),
        api.myMemory().catch(() => null),
      ]);
      setConversations(c.conversations || []);
      setMemory(m);
    } catch {}
  }

  async function openConversation(cid) {
    clearInterval(pollRef.current);
    setActiveId(cid);
    setHistOpen(false);
    try {
      const c = await api.getConversation(cid);
      setMessages(hydrate(c.messages || []));
    } catch {
      setMessages([]);
    }
  }

  function newConversation() {
    clearInterval(pollRef.current);
    setActiveId(null);
    setMessages([]);
    setInput("");
    setHistOpen(false);
    textareaRef.current?.focus();
  }

  async function deleteConversation(cid) {
    try {
      await api.deleteConversation(cid);
      if (cid === activeId) newConversation();
      refreshSidebar();
    } catch {}
  }

  function useChip(text) {
    setInput(text);
    textareaRef.current?.focus();
  }

  function startPolling(sid, msgIdx) {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const s = await api.mySession(sid);
        if (s.status === "answered" || s.status === "rejected") {
          clearInterval(pollRef.current);
          setMessages((prev) => {
            const next = [...prev];
            if (s.status === "answered") {
              next[msgIdx] = {
                ...next[msgIdx],
                outcome: "answered_reviewed",
                response: s.final_reply,
                technique: s.final_technique,
              };
            } else {
              next[msgIdx] = {
                ...next[msgIdx],
                outcome: "rejected",
                response:
                  "The clinician determined a different approach is needed. Please reach out directly.",
              };
            }
            return next;
          });
        }
      } catch {}
    }, 4000);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    const userMsg = { role: "user", text };
    const aiIdx = messages.length + 1;
    setMessages((prev) => [...prev, userMsg, { role: "ai", outcome: "loading" }]);
    setBusy(true);

    try {
      const r = await api.chat(text, activeId ? { conversation_id: activeId } : {});

      const newId = r.conversation_id || activeId;
      const wasNew = !activeId;
      if (newId && newId !== activeId) setActiveId(newId);

      if (r.outcome === "crisis") {
        setMessages((prev) => {
          const next = [...prev];
          next[aiIdx] = {
            role: "ai",
            outcome: "crisis",
            triage: r.triage,
            message: r.message,
            crisisResources: r.crisis_resources,
          };
          return next;
        });
      } else if (r.outcome === "pending_review") {
        setMessages((prev) => {
          const next = [...prev];
          next[aiIdx] = {
            role: "ai",
            outcome: "pending",
            triage: r.triage,
            message: r.message,
            crisisResources: r.crisis_resources,
            sessionId: r.session_id,
          };
          return next;
        });
        startPolling(r.session_id, aiIdx);
      } else if (r.outcome === "answered") {
        setMessages((prev) => {
          const next = [...prev];
          next[aiIdx] = {
            role: "ai",
            outcome: "answered",
            triage: r.triage,
            response: r.final?.response,
            technique: r.final?.technique,
            alternatives: r.drafts?.slice(1) || [],
          };
          return next;
        });
      }

      if (wasNew || r.outcome === "answered") refreshSidebar();
    } catch (e) {
      setMessages((prev) => {
        const next = [...prev];
        next[aiIdx] = { role: "ai", outcome: "error", message: e.message };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const activeTitle = conversations.find((c) => c.id === activeId)?.title;

  return (
    <div className="chat-page">
      <PageHero
        title="AI Support"
        subtitle="Chat with MindCare AI — your 24/7 mental wellness companion."
        mascot="chat"
        mascotSize={90}
      />
      <div className="chat-shell">
        <div className="chat-layout">
          {/* Header bar: current convo + history dropdown + new chat */}
          <div className="chat-header">
            <div className="chat-header-title">
              {activeTitle || "New conversation"}
            </div>
            <div className="chat-header-actions">
              <div className="chat-history-wrap">
                <button className="chat-header-btn" onClick={() => setHistOpen((o) => !o)}>
                  🕑 History {conversations.length > 0 && <span className="chat-hist-count">{conversations.length}</span>}
                </button>
                {histOpen && (
                  <>
                    <div className="chat-hist-overlay" onClick={() => setHistOpen(false)} />
                    <div className="chat-hist-menu">
                      {conversations.length === 0 && (
                        <div className="chat-hist-empty">No conversations yet</div>
                      )}
                      {conversations.map((c) => (
                        <div
                          key={c.id}
                          className={`chat-hist-item ${c.id === activeId ? "active" : ""}`}
                          onClick={() => openConversation(c.id)}
                        >
                          <span className="chat-hist-item-title">{c.title}</span>
                          <button
                            className="chat-hist-del"
                            title="Delete"
                            onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {memory && memory.turn_count > 0 && (
                        <div className="chat-hist-memory">
                          🧩 {memory.turn_count} prior turns remembered
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <button className="chat-new-btn" onClick={newConversation}>
                ＋ New chat
              </button>
            </div>
          </div>

          {/* Topic chips */}
          <div className="chat-chips">
            <span className="chat-chips-label">Try asking about:</span>
            {PROMPT_CHIPS.map((c) => (
              <button key={c.label} className="chat-chip" onClick={() => useChip(c.text)}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="chat-feed">
            {messages.length === 0 && (
              <div className="chat-empty">
                <Mascot variant="chat" size={96} />
                <div className="chat-empty-title">How are you feeling today?</div>
                <div className="chat-empty-sub">
                  Share what's on your mind. Your responses go through a safety
                  check first — a clinician reviews anything sensitive.
                </div>
                <div className="chat-empty-prompts">
                  {[
                    "I keep overthinking everything and can't sleep",
                    "I feel like nobody understands what I'm going through",
                    "I've been avoiding things that make me anxious",
                  ].map((p) => (
                    <button
                      key={p}
                      className="prompt-chip"
                      onClick={() => {
                        setInput(p);
                        textareaRef.current?.focus();
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.role === "user") {
                return (
                  <div key={i} className="bubble bubble-user">
                    <div className="bubble-body">{msg.text}</div>
                  </div>
                );
              }

              if (msg.outcome === "loading") return <TypingDots key={i} />;

              if (msg.outcome === "error") {
                return (
                  <div key={i} className="bubble bubble-ai">
                    <div className="bubble-avatar"><Mascot variant="chat" size={34} /></div>
                    <div className="bubble-body bubble-error">
                      Something went wrong: {msg.message}
                    </div>
                  </div>
                );
              }

              if (msg.outcome === "crisis") {
                return (
                  <div key={i} className="bubble bubble-ai">
                    <div className="bubble-avatar">🆘</div>
                    <div className="bubble-body bubble-crisis">
                      <TriageBadge level={msg.triage?.triage_level} />
                      <p style={{ marginTop: 10 }}>{msg.message}</p>
                      <CrisisResources res={msg.crisisResources} />
                    </div>
                  </div>
                );
              }

              if (msg.outcome === "pending") {
                return (
                  <div key={i} className="bubble bubble-ai">
                    <div className="bubble-avatar">👨‍⚕️</div>
                    <div className="bubble-body bubble-pending">
                      <TriageBadge level={msg.triage?.triage_level} />
                      <div className="pending-row">
                        <span className="spinner" />
                        <span>
                          {msg.message || "A clinician is reviewing your message…"}
                        </span>
                      </div>
                      {msg.crisisResources && (
                        <CrisisResources res={msg.crisisResources} />
                      )}
                    </div>
                  </div>
                );
              }

              if (msg.outcome === "answered_reviewed") {
                return (
                  <div key={i} className="bubble bubble-ai">
                    <div className="bubble-avatar">👨‍⚕️</div>
                    <div className="bubble-body">
                      <div className="reviewed-badge">✓ Clinician reviewed</div>
                      {msg.technique && (
                        <div className="technique-tag">{msg.technique}</div>
                      )}
                      <p className="response-text">{msg.response}</p>
                    </div>
                  </div>
                );
              }

              if (msg.outcome === "answered") {
                return (
                  <div key={i} className="bubble bubble-ai">
                    <div className="bubble-avatar"><Mascot variant="chat" size={34} /></div>
                    <div className="bubble-body">
                      <TriageBadge level={msg.triage?.triage_level} />
                      {msg.technique && (
                        <div className="technique-tag">{msg.technique}</div>
                      )}
                      <p className="response-text">{msg.response}</p>
                      {msg.alternatives?.length > 0 && (
                        <details className="alt-responses">
                          <summary>
                            {msg.alternatives.length} alternative approach
                            {msg.alternatives.length > 1 ? "es" : ""}
                          </summary>
                          {msg.alternatives.map((d, j) => (
                            <div key={j} className="alt-item">
                              <span className="technique-tag">{d.technique}</span>
                              <p>{d.response}</p>
                            </div>
                          ))}
                        </details>
                      )}
                    </div>
                  </div>
                );
              }

              if (msg.outcome === "rejected") {
                return (
                  <div key={i} className="bubble bubble-ai">
                    <div className="bubble-avatar">👨‍⚕️</div>
                    <div className="bubble-body bubble-pending">
                      <p>{msg.response}</p>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            <div ref={bottomRef} />
          </div>

          <div className="chat-input-wrap">
            <div className="chat-input-inner">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Share what's on your mind… (Enter to send)"
                disabled={busy}
              />
              <button
                className="send-btn"
                onClick={send}
                disabled={busy || !input.trim()}
              >
                {busy ? <span className="spinner" style={{ marginRight: 0 }} /> : "➤"}
              </button>
            </div>
            <div className="input-hint">
              Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>

        <RightPanel
          onUseTip={useChip}
          conversations={conversations}
          activeId={activeId}
          onOpenConvo={openConversation}
        />
      </div>
    </div>
  );
}
