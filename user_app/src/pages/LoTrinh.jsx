import { useState, useEffect, useMemo } from "react";
import { api } from "../api.js";

/* Journey — time-bound wellness roadmaps.

   Flow: the user types a goal → the AI drafts a roadmap they REVIEW first
   (edit / add / delete steps, or ask the AI to redo it) → they confirm to
   start it. Journeys run as a QUEUE: one is active at a time, the rest wait
   locked and unlock automatically when the one ahead is completed. Each card
   charts its own progress. */

const TF_EN = /\b\d+\s*(day|days|week|weeks|month|months)\b/i;
const TF_VI = /\d+\s*(ngày|tuần|tháng)/i;
const DAY_PRESETS = [3, 5, 7, 14, 21, 30];

function hasTimeframe(t) { t = t || ""; return TF_EN.test(t) || TF_VI.test(t); }

function daysToLabel(d) {
  d = parseInt(d, 10);
  if (!d || d <= 0) return "2 weeks";
  if (d <= 7) return `${d} day${d !== 1 ? "s" : ""}`;
  const w = Math.floor(d / 7), r = d % 7;
  let s = `${w} week${w !== 1 ? "s" : ""}`;
  if (r) s += ` ${r} day${r !== 1 ? "s" : ""}`;
  return s;
}

function fmtDay(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/* ── Circular progress ring (SVG, gradient, animated fill) ─────────────────── */
function ProgressRing({ pct, size = 58 }) {
  const uid = useMemo(() => Math.random().toString(36).slice(2, 9), []);
  const r = (size - 9) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const gid = `rmg-${uid}`;
  return (
    <svg width={size} height={size} className="rm-ring" viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" className="rm-ring-g0" />
          <stop offset="100%" className="rm-ring-g1" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} className="rm-ring-track" fill="none" strokeWidth="6.5" />
      <circle cx={size / 2} cy={size / 2} r={r} className="rm-ring-fill" fill="none" strokeWidth="6.5"
        strokeLinecap="round" stroke={`url(#${gid})`}
        strokeDasharray={c} strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dy="0.35em" textAnchor="middle" className="rm-ring-label">{pct}%</text>
    </svg>
  );
}

/* ── Cumulative completion over time — animated area line built from step
      done_at timestamps. Falls back to an animated bar with <2 data points. ── */
function ProgressChart({ steps }) {
  const uid = useMemo(() => Math.random().toString(36).slice(2, 9), []);
  const doneSteps = steps.filter((s) => s.done);
  const total = steps.length || 1;
  const withTime = doneSteps.filter((s) => s.done_at)
    .map((s) => new Date(s.done_at)).filter((d) => !isNaN(d)).sort((a, b) => a - b);

  if (withTime.length < 2) {
    const pctDone = Math.round(doneSteps.length / total * 100);
    return (
      <div className="rm-chart">
        <div className="rm-bar"><div className="rm-bar-fill" style={{ width: `${pctDone}%` }} /></div>
        <div className="rm-chart-cap">{doneSteps.length} of {total} steps done</div>
      </div>
    );
  }

  const W = 280, H = 104, padX = 12, padTop = 14, padBot = 20;
  const t0 = withTime[0].getTime(), t1 = withTime[withTime.length - 1].getTime();
  const span = Math.max(t1 - t0, 1);
  const X = (d) => padX + ((d.getTime() - t0) / span) * (W - 2 * padX);
  const Y = (i) => H - padBot - ((i + 1) / total) * (H - padTop - padBot);
  const pts = withTime.map((d, i) => [X(d), Y(i)]);
  const line = `M ${pts.map((p) => p.join(",")).join(" L ")}`;
  const area = `M ${pts[0][0]},${H - padBot} L ${pts.map((p) => p.join(",")).join(" L ")} L ${pts[pts.length - 1][0]},${H - padBot} Z`;
  const gid = `rmc-${uid}`;
  return (
    <div className="rm-chart">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="rm-line">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="rm-area-g0" />
            <stop offset="100%" className="rm-area-g1" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={H - padBot} x2={W - padX} y2={H - padBot} className="rm-grid" />
        <path d={area} className="rm-area" fill={`url(#${gid})`} />
        <path d={line} className="rm-stroke" fill="none" pathLength="1" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3.4" className="rm-dot"
            style={{ animationDelay: `${0.5 + i * 0.12}s` }} />
        ))}
      </svg>
      <div className="rm-chart-cap">
        {fmtDay(withTime[0].toISOString())} → {fmtDay(withTime[withTime.length - 1].toISOString())} ·
        {" "}{withTime.length}/{total} steps
      </div>
    </div>
  );
}

/* ── Editable step rows (used in the draft review + active-card edit) ──────── */
function StepEditor({ steps, onText, onWhen, onDel, onAdd }) {
  return (
    <div className="rm-edit">
      {steps.map((s, i) => (
        <div className="rm-edit-row" key={i}>
          <span className="rm-edit-num">{i + 1}</span>
          <div className="rm-edit-fields">
            <input className="rm-edit-text" value={s.text} placeholder="A small, concrete step…"
              onChange={(e) => onText(i, e.target.value)} />
            <input className="rm-edit-when" value={s.when} placeholder="e.g. Week 1 · Day 1-2"
              onChange={(e) => onWhen(i, e.target.value)} />
          </div>
          <button className="rm-edit-del" title="Delete step" onClick={() => onDel(i)}>✕</button>
        </div>
      ))}
      <button className="rm-edit-add" onClick={onAdd}>+ Add a step</button>
    </div>
  );
}

/* ── Draft review panel — the user sees this BEFORE the journey is saved ───── */
function DraftPanel({ draft, busy, suggested, rationale, onTitle, onGoal, onStep,
                      onWhen, onDel, onAdd, onRegenerate, onConfirm, onCancel }) {
  const [note, setNote] = useState("");
  return (
    <div className={`rm-draft ${suggested ? "rm-suggested" : ""}`}>
      <div className="rm-draft-badge">
        {suggested ? "✨ Suggested for you" : "Draft · review before you start"}
      </div>
      {suggested && rationale && <div className="rm-rationale">{rationale}</div>}
      <input className="rm-draft-title" value={draft.title}
        onChange={(e) => onTitle(e.target.value)} placeholder="Journey title" />
      <div className="rm-draft-meta">
        <span className="rm-chip">{draft.timeframe}</span>
        <span className="rm-draft-goal">🎯
          <input className="rm-draft-goal-in" value={draft.goal}
            onChange={(e) => onGoal(e.target.value)} placeholder="What you're working toward" />
        </span>
      </div>

      <StepEditor steps={draft.steps} onText={onStep} onWhen={onWhen} onDel={onDel} onAdd={onAdd} />

      <div className="rm-redo">
        <input className="rm-redo-in" value={note} placeholder="Not quite right? Tell the AI what to change…"
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !busy && (onRegenerate(note), setNote(""))} />
        <button className="rm-redo-btn" disabled={busy} onClick={() => { onRegenerate(note); setNote(""); }}>
          {busy ? "…" : "↻ Redo"}
        </button>
      </div>

      <div className="rm-draft-actions">
        <button className="rm-start" disabled={busy || !draft.steps.some((s) => s.text.trim())}
          onClick={onConfirm}>
          {busy ? "Starting…" : suggested ? "Accept & start →" : "Start this journey →"}
        </button>
        <button className="rm-cancel" disabled={busy} onClick={onCancel}>
          {suggested ? "Create my own instead" : "Cancel"}
        </button>
      </div>
    </div>
  );
}

/* ── Days modal — shown when the goal text has no duration in it ───────────── */
function DaysModal({ goal, busy, onSubmit, onCancel }) {
  const [days, setDays] = useState(14);
  const d = Math.max(1, Math.min(120, parseInt(days, 10) || 0));
  return (
    <div className="rm-modal-wrap" onClick={onCancel}>
      <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rm-modal-title">How long do you want to give yourself?</div>
        <div className="rm-modal-goal">for “{goal}”</div>
        <div className="rm-presets">
          {DAY_PRESETS.map((p) => (
            <button key={p} className={`rm-preset ${d === p ? "on" : ""}`} onClick={() => setDays(p)}>
              {p}d
            </button>
          ))}
        </div>
        <div className="rm-stepper">
          <button onClick={() => setDays((v) => Math.max(1, (parseInt(v, 10) || 1) - 1))}>−</button>
          <input type="number" min="1" max="120" value={days}
            onChange={(e) => setDays(e.target.value)} />
          <span className="rm-stepper-unit">days</span>
          <button onClick={() => setDays((v) => Math.min(120, (parseInt(v, 10) || 0) + 1))}>+</button>
        </div>
        <div className="rm-modal-hint">
          {d > 7 ? <>Split into <strong>{daysToLabel(d)}</strong> across the plan</>
                 : <>A short <strong>{daysToLabel(d)}</strong> sprint</>}
        </div>
        <div className="rm-modal-actions">
          <button className="rm-start" disabled={busy} onClick={() => onSubmit(d)}>
            {busy ? "Building…" : "Build draft →"}
          </button>
          <button className="rm-cancel" disabled={busy} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── A saved journey card (active = interactive; locked = greyed & waiting) ── */
function RoadmapCard({ rm, locked, blockerTitle, onToggle, onStatus, onDelete, onSaveEdit }) {
  const [open, setOpen] = useState(rm.status === "active");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const pct = rm.progress?.pct ?? 0;

  function startEdit() {
    setDraft({ title: rm.title, steps: (rm.steps || []).map((s) => ({ ...s })) });
    setEditing(true); setOpen(true);
  }
  function saveEdit() {
    onSaveEdit(rm.id, {
      title: draft.title,
      steps: draft.steps.filter((s) => (s.text || "").trim())
        .map((s) => ({ text: s.text, when: s.when, done: !!s.done, done_at: s.done_at || null })),
    });
    setEditing(false);
  }

  if (locked) {
    return (
      <div className="rm-card rm-locked">
        <div className="rm-lock-head">
          <span className="rm-lock-ico">🔒</span>
          <div className="rm-card-meta">
            <div className="rm-card-title">{rm.title}</div>
            <div className="rm-lock-note">
              Unlocks when {blockerTitle ? <em>“{blockerTitle}”</em> : "your current journey"} is done
            </div>
          </div>
          <span className="rm-chip">{rm.timeframe}</span>
        </div>
        <ul className="rm-steps rm-steps-preview">
          {(rm.steps || []).slice(0, 3).map((s, i) => (
            <li className="rm-step" key={i}><span className="rm-check" /> <span className="rm-step-text"><span>{s.text}</span></span></li>
          ))}
          {(rm.steps || []).length > 3 && <li className="rm-more">+{rm.steps.length - 3} more steps</li>}
        </ul>
        <div className="rm-actions"><button className="rm-act rm-act-del" onClick={() => onDelete(rm.id)}>Remove from queue</button></div>
      </div>
    );
  }

  return (
    <div className={`rm-card rm-${rm.status}`}>
      <button className="rm-card-head" onClick={() => setOpen((o) => !o)}>
        <ProgressRing pct={pct} />
        <div className="rm-card-meta">
          <div className="rm-card-title">{rm.title}</div>
          <div className="rm-card-sub">
            <span className="rm-chip">{rm.timeframe}</span>
            {rm.status === "completed" && <span className="rm-chip rm-chip-done">✓ Completed</span>}
            {rm.status === "archived" && <span className="rm-chip rm-chip-arch">Archived</span>}
          </div>
        </div>
        <span className={`rm-caret ${open ? "open" : ""}`}>›</span>
      </button>

      {open && (
        <div className="rm-card-body">
          {editing ? (
            <>
              <input className="rm-draft-title" value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
              <StepEditor steps={draft.steps}
                onText={(i, v) => setDraft((d) => ({ ...d, steps: d.steps.map((s, j) => j === i ? { ...s, text: v } : s) }))}
                onWhen={(i, v) => setDraft((d) => ({ ...d, steps: d.steps.map((s, j) => j === i ? { ...s, when: v } : s) }))}
                onDel={(i) => setDraft((d) => ({ ...d, steps: d.steps.filter((_, j) => j !== i) }))}
                onAdd={() => setDraft((d) => ({ ...d, steps: [...d.steps, { text: "", when: "" }] }))} />
              <div className="rm-draft-actions">
                <button className="rm-start" onClick={saveEdit}>Save changes</button>
                <button className="rm-cancel" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              {rm.goal && <div className="rm-goal">🎯 {rm.goal}</div>}
              <ProgressChart steps={rm.steps || []} />
              <ul className="rm-steps">
                {(rm.steps || []).map((s, i) => (
                  <li key={i} className={s.done ? "rm-step done" : "rm-step"}>
                    <button className="rm-check" onClick={() => onToggle(rm.id, i)}
                      aria-label={s.done ? "Mark not done" : "Mark done"}>{s.done ? "✓" : ""}</button>
                    <div className="rm-step-text">
                      <span>{s.text}</span>
                      {s.when && <span className="rm-when">{s.when}</span>}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="rm-actions">
                {rm.status === "active" && <button className="rm-act" onClick={startEdit}>✎ Edit steps</button>}
                {rm.status !== "completed" && (
                  <button className="rm-act" onClick={() => onStatus(rm.id, "completed")}>Mark complete</button>
                )}
                {rm.status !== "archived" ? (
                  <button className="rm-act" onClick={() => onStatus(rm.id, "archived")}>Archive</button>
                ) : (
                  <button className="rm-act" onClick={() => onStatus(rm.id, "active")}>Reactivate</button>
                )}
                <button className="rm-act rm-act-del" onClick={() => onDelete(rm.id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function LoTrinh() {
  const [roadmaps, setRoadmaps] = useState(null);
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);
  const [crisis, setCrisis] = useState(null);
  const [draft, setDraft] = useState(null);        // pending review
  const [draftReq, setDraftReq] = useState(null);  // {goal, timeframe} for redo
  const [daysFor, setDaysFor] = useState(null);    // goal awaiting a duration
  const [suggested, setSuggested] = useState(false); // draft came from AI suggest
  const [rationale, setRationale] = useState("");  // why this was suggested
  const [suggestMsg, setSuggestMsg] = useState(null); // "not enough yet" note

  const load = () =>
    api.listRoadmaps().then((r) => setRoadmaps(r.roadmaps || [])).catch(() => setRoadmaps([]));
  useEffect(() => { load(); }, []);

  function mkDraft(d) {
    return { title: d.title || "My journey", goal: d.goal || "", timeframe: d.timeframe || "2 weeks",
             steps: (d.steps || []).map((s) => ({ text: s.text || "", when: s.when || "" })) };
  }

  async function runDraft(g, opts) {
    setBusy(true); setCrisis(null); setSuggestMsg(null);
    try {
      const r = await api.draftRoadmap(g, opts);
      if (r && r.crisis) { setCrisis(r); setDraft(null); }
      else if (r && r.draft) {
        setDraft(mkDraft(r.draft)); setDraftReq({ goal: g, timeframe: r.draft.timeframe });
        setSuggested(false); setRationale("");
      }
    } catch { /* keep the input */ }
    setBusy(false);
  }

  async function askSuggest() {
    if (busy) return;
    setBusy(true); setCrisis(null); setSuggestMsg(null);
    try {
      const r = await api.suggestRoadmap();
      if (r && r.available && r.draft) {
        setDraft(mkDraft(r.draft));
        setDraftReq({ goal: r.draft.goal, timeframe: r.draft.timeframe });
        setSuggested(true); setRationale(r.rationale || "");
      } else {
        setSuggestMsg("Chat with me a little more and I'll be able to suggest a journey that fits you.");
      }
    } catch { setSuggestMsg("Couldn't build a suggestion just now — try again in a moment."); }
    setBusy(false);
  }

  function beginCreate() {
    const g = goal.trim();
    if (!g || busy) return;
    if (hasTimeframe(g)) runDraft(g, {});
    else setDaysFor(g);
  }

  function onDaysSubmit(days) {
    const g = daysFor;
    setDaysFor(null);
    runDraft(g, { days });
  }

  async function regenerate(note) {
    if (!draftReq || busy) return;
    setBusy(true); setCrisis(null);
    try {
      const r = await api.draftRoadmap(draftReq.goal, { timeframe: draftReq.timeframe, feedback: note });
      if (r && r.crisis) setCrisis(r);
      else if (r && r.draft) setDraft(mkDraft(r.draft));
    } catch { /* keep current draft */ }
    setBusy(false);
  }

  async function confirmDraft() {
    if (!draft || busy) return;
    setBusy(true);
    try {
      const r = await api.createRoadmap({
        title: draft.title, goal: draft.goal, timeframe: draft.timeframe,
        steps: draft.steps.filter((s) => (s.text || "").trim()).map((s) => ({ text: s.text, when: s.when })),
      });
      if (r && r.crisis) setCrisis(r);
      else { setDraft(null); setDraftReq(null); setSuggested(false); setRationale(""); setGoal(""); await load(); }
    } catch { /* keep draft for retry */ }
    setBusy(false);
  }

  function cancelDraft() { setDraft(null); setDraftReq(null); setSuggested(false); setRationale(""); }

  // draft field setters
  const dTitle = (v) => setDraft((d) => ({ ...d, title: v }));
  const dGoal = (v) => setDraft((d) => ({ ...d, goal: v }));
  const dStep = (i, v) => setDraft((d) => ({ ...d, steps: d.steps.map((s, j) => j === i ? { ...s, text: v } : s) }));
  const dWhen = (i, v) => setDraft((d) => ({ ...d, steps: d.steps.map((s, j) => j === i ? { ...s, when: v } : s) }));
  const dDel = (i) => setDraft((d) => ({ ...d, steps: d.steps.filter((_, j) => j !== i) }));
  const dAdd = () => setDraft((d) => ({ ...d, steps: [...d.steps, { text: "", when: "" }] }));

  async function toggle(rid, idx) {
    try { const u = await api.toggleRoadmapStep(rid, idx);
      setRoadmaps((rms) => rms.map((r) => r.id === rid ? u : r)); await load(); } catch {}
  }
  async function status(rid, s) {
    try { await api.setRoadmapStatus(rid, s); await load(); } catch {}
  }
  async function del(rid) {
    if (!window.confirm("Delete this journey? This can't be undone.")) return;
    try { await api.deleteRoadmap(rid); await load(); } catch {}
  }
  async function saveEdit(rid, patch) {
    try { await api.editRoadmap(rid, patch); await load(); } catch {}
  }

  const active = useMemo(() => (roadmaps || []).filter((r) => r.status === "active"), [roadmaps]);
  const locked = useMemo(() => (roadmaps || []).filter((r) => r.status === "locked")
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), [roadmaps]);
  const completed = useMemo(() => (roadmaps || []).filter((r) => r.status === "completed"), [roadmaps]);
  const archived = useMemo(() => (roadmaps || []).filter((r) => r.status === "archived"), [roadmaps]);
  const queue = useMemo(() => [...active, ...locked], [active, locked]);
  const nothing = roadmaps && !roadmaps.length;

  return (
    <div className="page rm-page">
      <div className="page-head">
        <h1>Your Journey</h1>
        <p className="page-sub">
          Turn a goal into a gentle, time-bound roadmap. Review the draft, tweak
          it, then tick off small steps and watch your progress build.
        </p>
      </div>

      {!draft && (
        <>
          <div className="rm-create">
            <input className="rm-input" placeholder="What would you like to work on? (e.g. sleep better in 2 weeks)"
              value={goal} onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && beginCreate()} disabled={busy} />
            <button className="rm-create-btn" onClick={beginCreate} disabled={busy || !goal.trim()}>
              {busy ? "Building…" : "Draft a roadmap"}
            </button>
          </div>
          <div className="rm-create-hint">
            Add a duration (“in 3 weeks”) and it drafts straight away — otherwise
            we’ll ask how long you want.
          </div>
          <button className="rm-suggest-btn" onClick={askSuggest} disabled={busy}>
            <span className="rm-suggest-spark">✨</span>
            <span>
              <span className="rm-suggest-t">Suggest a journey for me</span>
              <span className="rm-suggest-s">Built from our chats, your themes &amp; what you’ve shared</span>
            </span>
            <span className="rm-suggest-arr">→</span>
          </button>
          {suggestMsg && <div className="rm-suggest-note">{suggestMsg}</div>}
        </>
      )}

      {busy && !draft && !daysFor && (
        <div className="rm-drafting"><span className="rm-spin" /> Crafting your roadmap…</div>
      )}

      {crisis && (
        <div className="rm-crisis">
          <div className="rm-crisis-msg">{crisis.message}</div>
          <ul>{(crisis.resources || []).map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}

      {draft && (
        <DraftPanel draft={draft} busy={busy} suggested={suggested} rationale={rationale}
          onTitle={dTitle} onGoal={dGoal} onStep={dStep} onWhen={dWhen} onDel={dDel} onAdd={dAdd}
          onRegenerate={regenerate} onConfirm={confirmDraft} onCancel={cancelDraft} />
      )}

      {daysFor && (
        <DaysModal goal={daysFor} busy={busy} onSubmit={onDaysSubmit} onCancel={() => setDaysFor(null)} />
      )}

      {roadmaps === null ? (
        <div className="rm-empty">Loading…</div>
      ) : nothing && !draft ? (
        <div className="rm-empty">
          No journeys yet. Create one above — or ask in chat, e.g.
          <em> "give me a 2-week plan to sleep better."</em>
        </div>
      ) : (
        <>
          {queue.map((r, i) => (
            <RoadmapCard key={r.id} rm={r} locked={r.status === "locked"}
              blockerTitle={i > 0 ? queue[i - 1].title : null}
              onToggle={toggle} onStatus={status} onDelete={del} onSaveEdit={saveEdit} />
          ))}
          {completed.length > 0 && <div className="rm-arch-head">Completed</div>}
          {completed.map((r) => (
            <RoadmapCard key={r.id} rm={r} onToggle={toggle} onStatus={status} onDelete={del} onSaveEdit={saveEdit} />
          ))}
          {archived.length > 0 && <div className="rm-arch-head">Archived</div>}
          {archived.map((r) => (
            <RoadmapCard key={r.id} rm={r} onToggle={toggle} onStatus={status} onDelete={del} onSaveEdit={saveEdit} />
          ))}
        </>
      )}
    </div>
  );
}
