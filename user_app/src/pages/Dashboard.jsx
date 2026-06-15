import { useState, useEffect } from "react";
import { api } from "../api.js";
import Mascot from "../components/Mascot.jsx";

const FEATURES = [
  { id: "sangloc",   icon: "🛡️", title: "Screening",     desc: "Quickly and securely assess your stress, anxiety, and depression levels.", link: "Start" },
  { id: "chat",      icon: "💬", title: "AI Support",     desc: "Chat anonymously with AI to be heard and supported when you need it.",     link: "Chat now" },
  { id: "baihoc",    icon: "📖", title: "CBT Lessons",    desc: "Learn effective CBT techniques through short, easy-to-apply lessons.",     link: "Learn now" },
  { id: "tainguyen", icon: "🗂️", title: "Resources",      desc: "Explore helpful articles, audio, and videos for mental wellness.",         link: "Explore" },
  { id: "hoso",      icon: "👤", title: "Profile",        desc: "Track your progress and manage your personal information.",                link: "View profile" },
  { id: "caidat",    icon: "⚙️", title: "Settings",       desc: "Customize your experience and adjust your account preferences.",           link: "Settings" },
];

const HOW_STEPS = [
  { num: "1", icon: "📋", title: "Screening",           desc: "Assess your current mental state." },
  { num: "2", icon: "💬", title: "AI Support",          desc: "Receive guidance, empathy, and relevant suggestions." },
  { num: "3", icon: "📖", title: "Lessons & Resources", desc: "Learn skills and explore helpful content." },
  { num: "4", icon: "📈", title: "Track Progress",      desc: "Monitor growth and maintain positive habits." },
];

const FEATURED_LESSONS = [
  { icon: "📄", iconBg: "#E8F0FE", title: "10 Effective Ways to Reduce Anxiety", meta: "Article · 8 min read" },
  { icon: "🎧", iconBg: "#E4F6F1", title: "4-7-8 Breathing Exercise",             meta: "Audio · 5 min" },
  { icon: "▶️", iconBg: "#FFF1E6", title: "Meditation for Beginners",             meta: "Video · 12 min" },
];

const ACTIVITY = [
  { icon: "🛡️", iconBg: "#E4F6F1", text: "Mental Screening",  date: "14/06/2024 09:24", status: "Moderate",  type: "warn" },
  { icon: "🎵", iconBg: "#EAF0FE", text: "4-7-8 Breathing",   date: "12/06/2024 20:15", status: "Completed", type: "ok" },
  { icon: "💬", iconBg: "#F3EAFE", text: "AI Conversation",    date: "10/06/2024 21:30", status: "Completed", type: "ok" },
  { icon: "✅", iconBg: "#E4F6F1", text: "Mental Screening",   date: "08/06/2024 08:45", status: "Moderate",  type: "warn" },
];

const RISK_MAP = {
  normal:            { bg: "#E6F8EE", color: "#1F9D55", label: "Low" },
  mild:              { bg: "#E6F8EE", color: "#1F9D55", label: "Low" },
  moderate:          { bg: "#FFF1DB", color: "#E8920C", label: "Moderate" },
  moderately_severe: { bg: "#FEECEC", color: "#E0524E", label: "High" },
  severe:            { bg: "#FDE2E2", color: "#C0392B", label: "Very High" },
};

export default function Dashboard({ user, onNav }) {
  const [latest, setLatest] = useState(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    api.latestScreening().catch(() => null).then(setLatest);
  }, []);

  const risk = RISK_MAP[latest?.phq9_level] || RISK_MAP.moderate;
  const dateStr = latest?.created_at
    ? new Date(latest.created_at).toLocaleString("en-GB", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
      }).replace(",", " ·")
    : "14/06/2024 · 09:24";

  return (
    <div className="dash">
      {/* ── MAIN COLUMN ── */}
      <div className="dash-main">

        {/* HERO */}
        <section className="hero">
          <div className="hero-text">
            <h1 className="hero-title">
              MindCare AI walks with you on your mental wellness journey 🌱
            </h1>
            <p className="hero-sub">
              Listening, understanding, and providing the right support so every day is better than the last.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => onNav("sangloc")}>
                🛡️ Start Screening
              </button>
              <button className="btn-hero-ghost" onClick={() => onNav("baihoc")}>
                🧭 Explore Features
              </button>
            </div>
          </div>
          <div className="hero-mascot">
            <Mascot variant="wave" size={240} />
          </div>
        </section>

        {/* CORE FEATURES */}
        <section className="block">
          <h2 className="block-title">Core Features</h2>
          <div className="features">
            {FEATURES.map((f) => (
              <button key={f.id} className="feature" onClick={() => onNav(f.id)}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
                <span className="feature-link">{f.link} →</span>
              </button>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="block">
          <h2 className="block-title">How MindCare AI Works</h2>
          <div className="steps">
            {HOW_STEPS.map((s, i) => (
              <div key={s.num} className="step">
                <div className="step-icon">
                  {s.icon}
                  <span className="step-num">{s.num}</span>
                </div>
                <div className="step-body">
                  <div className="step-title">{s.num}. {s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
                {i < HOW_STEPS.length - 1 && <span className="step-arrow">→</span>}
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM: chat + featured lessons */}
        <div className="dash-bottom">
          <section className="block chat-preview">
            <div className="block-head">
              <h2 className="block-title">Chat with AI</h2>
              <button className="block-link" onClick={() => onNav("chat")}>Open AI Support →</button>
            </div>
            <div className="chat-preview-msg">
              <div className="chat-preview-avatar">
                <Mascot variant="chat" size={40} />
              </div>
              <div className="chat-preview-bubble">
                <div className="chat-preview-name">Mindy AI</div>
                I'm here to listen and support you. 💚<br />
                What would you like to share today?
              </div>
            </div>
            <div className="chat-preview-input">
              <input
                placeholder="Type your message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onNav("chat"); }}
              />
              <button className="chat-preview-send" onClick={() => onNav("chat")}>➤</button>
            </div>
          </section>

          <section className="block">
            <div className="block-head">
              <h2 className="block-title">Featured Lessons</h2>
              <button className="block-link" onClick={() => onNav("baihoc")}>View all →</button>
            </div>
            <div className="featured-list">
              {FEATURED_LESSONS.map((l) => (
                <button key={l.title} className="featured-item" onClick={() => onNav("baihoc")}>
                  <div className="featured-icon" style={{ background: l.iconBg }}>{l.icon}</div>
                  <div className="featured-body">
                    <div className="featured-title">{l.title}</div>
                    <div className="featured-meta">{l.meta}</div>
                  </div>
                  <span className="featured-arrow">›</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <aside className="dash-side">

        <section className="side-card">
          <div className="side-head">
            <h3 className="side-title">Latest Screening Result</h3>
            <span className="side-date">{dateStr}</span>
          </div>
          <div className="side-risk-label">Risk Level</div>
          <span className="risk-pill" style={{ background: risk.bg, color: risk.color }}>
            {risk.label}
          </span>
          <p className="side-text">
            You're experiencing some stress. Take time to care for yourself!
          </p>
          <button className="btn-outline-full" onClick={() => onNav("sangloc")}>
            View full results
          </button>
        </section>

        <section className="side-card suggest-card">
          <div className="suggest-body">
            <h3 className="side-title">💡 Today's Tip</h3>
            <p className="side-text">
              5 minutes of deep breathing can reduce stress and improve your mood.
            </p>
            <button className="btn-primary-sm" onClick={() => onNav("tainguyen")}>Try now</button>
          </div>
          <div className="suggest-illu">🧘‍♀️</div>
        </section>

        <section className="encourage-card">
          <div className="encourage-body">
            <div className="encourage-title">You're doing great! 💚</div>
            <p className="encourage-text">
              Every small step today is big progress for tomorrow.
            </p>
          </div>
          <Mascot variant="success" size={92} />
        </section>

        <section className="side-card">
          <div className="side-head">
            <h3 className="side-title">Activity History</h3>
            <button className="block-link" onClick={() => onNav("hoso")}>View all</button>
          </div>
          <div className="activity-list">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="activity-row">
                <div className="activity-icon" style={{ background: a.iconBg }}>{a.icon}</div>
                <div className="activity-main">
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-date">{a.date}</div>
                </div>
                <div className={`activity-status ${a.type}`}>
                  <span className="activity-dot" />
                  {a.status}
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
