import { api } from "../api.js";

/* Student Toolkit — the stresses that are specific to student life, each with a
   tiny evidence-based tip and a one-tap way to talk it through with the AI
   (which then runs the full CBT flow: reframing, behavioural activation,
   lesson recommendations, handoff if needed). */

const MODULES = [
  {
    emoji: "📚", title: "Academic pressure",
    tip: "Overwhelmed by deadlines? Pick ONE task, set a 10-minute timer, and just start — beginning is the goal, not finishing.",
    starter: "I'm overwhelmed by my deadlines and I keep procrastinating.",
    tone: "blue",
  },
  {
    emoji: "👪", title: "Talking to parents",
    tip: "Dreading a hard talk? Lead with a feeling, not a defence: \"I've been struggling and I wanted to be honest with you.\"",
    starter: "I'm scared to tell my parents something and I don't know how to start.",
    tone: "amber",
  },
  {
    emoji: "💼", title: "Internships & CV",
    tip: "Job-hunt panic? Break it into today-sized pieces — one CV line, or one listing saved. Progress beats perfection.",
    starter: "I'm panicking about internships and my CV and don't know where to start.",
    tone: "green",
  },
  {
    emoji: "🫂", title: "Loneliness",
    tip: "Far from home and feeling alone? Plan one small connection today — a text to one person, or sitting where others are.",
    starter: "I've been feeling really lonely since I moved away for school.",
    tone: "purple",
  },
  {
    emoji: "💔", title: "Relationships",
    tip: "Hurting over someone? Name it first — is this grief, dependence, or a boundary you need? Each asks for different care.",
    starter: "I'm going through a hard time with someone I care about.",
    tone: "pink",
  },
  {
    emoji: "🔋", title: "Low motivation",
    tip: "Can't get moving? Behavioural activation: do the smallest version of one thing for 5 minutes. Action first — motivation follows.",
    starter: "I've lost all my motivation and I can't get myself to do anything.",
    tone: "teal",
  },
];

export default function Toolkit({ onNav }) {
  function talk(starter) {
    try { localStorage.setItem("mc_chat_prefill", starter); } catch {}
    if (onNav) onNav("chat");
  }
  return (
    <div className="page tk-page">
      <div className="page-head">
        <h1>Student Toolkit</h1>
        <p className="page-sub">
          The stresses that come with being a student — each with a small,
          proven first step, and a one-tap way to talk it through.
        </p>
      </div>
      <div className="tk-grid">
        {MODULES.map((m) => (
          <div className={`tk-card tk-${m.tone}`} key={m.title}>
            <div className="tk-emoji">{m.emoji}</div>
            <div className="tk-title">{m.title}</div>
            <p className="tk-tip">{m.tip}</p>
            <button className="tk-btn" onClick={() => talk(m.starter)}>
              Talk it through →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
