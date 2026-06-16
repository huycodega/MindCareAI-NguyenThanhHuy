import { useState, useEffect } from "react";
import { api } from "../api.js";
import Mascot from "../components/Mascot.jsx";

const FEATURES = [
  {
    id: "sangloc",
    icon: "shield",
    title: "Screening",
    desc: "Assess your stress, anxiety, and mood levels through private check-ins.",
    link: "Start",
  },
  {
    id: "chat",
    icon: "bot",
    title: "AI Support",
    desc: "Chat with AI for emotional support and personalized suggestions.",
    link: "Chat Now",
  },
  {
    id: "baihoc",
    icon: "book",
    title: "CBT Lessons",
    desc: "Learn simple CBT techniques through short and practical lessons.",
    link: "Learn",
  },
  {
    id: "tainguyen",
    icon: "folder",
    title: "Resources",
    desc: "Explore articles, audio guides, and wellness tools.",
    link: "Explore",
  },
  {
    id: "hoso",
    icon: "user",
    title: "Profile",
    desc: "Track your progress and manage your personal information.",
    link: "View Profile",
  },
  {
    id: "caidat",
    icon: "settings",
    title: "Settings",
    desc: "Customize your experience and privacy preferences.",
    link: "Settings",
  },
];

function FeatureSvgIcon({ name }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  if (name === "shield") {
    return <svg {...common}><path d="M12 3 19 6v5c0 4.4-2.8 8.4-7 10-4.2-1.6-7-5.6-7-10V6l7-3Z" /><path d="m9.5 12 1.7 1.7 3.6-4" /></svg>;
  }
  if (name === "bot") {
    return <svg {...common}><path d="M12 8V5" /><path d="M8 5h8" /><rect x="5" y="8" width="14" height="10" rx="5" /><path d="M9 13h.01" /><path d="M15 13h.01" /><path d="M9.5 17c1.6 1 3.4 1 5 0" /></svg>;
  }
  if (name === "book") {
    return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20" /><path d="M8 7h8" /></svg>;
  }
  if (name === "folder") {
    return <svg {...common}><path d="M3.5 6.5h6l2 2H20.5v10h-17v-12Z" /><path d="M3.5 8.5h17" /></svg>;
  }
  if (name === "audio") {
    return <svg {...common}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
  }
  if (name === "user") {
    return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>;
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05a2 2 0 0 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.56V21a2 2 0 0 1-4 0v-.04A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.05.05a2 2 0 0 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 0 1 0-4h.04A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.05-.05a2 2 0 0 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.56V3a2 2 0 0 1 4 0v.04A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.05-.05a2 2 0 0 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 0 1 0 4h-.04A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}
const HOW_STEPS = [
  {
    num: "1",
    icon: "📝",
    title: "Screening",
    desc: "Check your current mental wellness status.",
  },
  {
    num: "2",
    icon: "bot",
    title: "AI Support",
    desc: "Receive supportive conversations and helpful suggestions.",
  },
  {
    num: "3",
    icon: "📚",
    title: "Lessons & Resources",
    desc: "Learn coping skills and explore useful wellness content.",
  },
  {
    num: "4",
    icon: "📈",
    title: "Track Progress",
    desc: "Follow your journey and build positive habits.",
  },
];

const FEATURED_LESSONS = [
  { icon: "📄", iconBg: "#EAF4FF", title: "10 Ways to Reduce Anxiety", type: "Article", duration: "8 min read" },
  { icon: "🎧", iconBg: "#E9F8F2", title: "4-7-8 Breathing Exercise", type: "Audio", duration: "5 min" },
  { icon: "▶", iconBg: "#FFF0E6", title: "Meditation for Beginners", type: "Video", duration: "12 min" },
];

const ACTIVITY = [
  { icon: "shield", iconBg: "#E9F8F2", text: "Mental Health Screening", status: "Moderate", type: "warn" },
  { icon: "audio", iconBg: "#EEF4FF", text: "4-7-8 Breathing Exercise", status: "Completed", type: "ok" },
  { icon: "bot", iconBg: "#F3EEFF", text: "AI Support Conversation", status: "Completed", type: "ok" },
  { icon: "shield", iconBg: "#FFF4E5", text: "Mental Health Screening", status: "Moderate", type: "warn" },
];

const RISK_MAP = {
  normal: { bg: "#E6F8EE", color: "#1F9D55", label: "Low" },
  mild: { bg: "#E6F8EE", color: "#1F9D55", label: "Low" },
  moderate: { bg: "#FFF1DB", color: "#E8920C", label: "Moderate" },
  moderately_severe: { bg: "#FEECEC", color: "#E0524E", label: "High" },
  severe: { bg: "#FDE2E2", color: "#C0392B", label: "Very High" },
};

export default function Dashboard({ user, onNav }) {
  const [latest, setLatest] = useState(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    api.latestScreening().catch(() => null).then(setLatest);
  }, []);

  const risk = RISK_MAP[latest?.phq9_level] || RISK_MAP.moderate;
  const dateStr = latest?.created_at
    ? new Date(latest.created_at).toLocaleDateString("en-GB")
    : "14/06/2024";

  return (
    <div className="dash home-dashboard-v3">
      <main className="dash-main">
        <section className="hero home-hero-v3">
          <div className="hero-text">
            <div className="home-hero-kicker">MindCare AI Dashboard</div>
            <h1 className="hero-title">MindCare AI supports you on your mental wellness journey 🌱</h1>
            <p className="hero-sub">
              Listen, understand, and provide personalized support to help you feel better every day.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" type="button" onClick={() => onNav("sangloc")}>
                Start Screening
              </button>
              <button className="btn-hero-ghost" type="button" onClick={() => onNav("baihoc")}>
                Explore Features
              </button>
            </div>
          </div>
          <div className="hero-mascot home-hero-mascot-card">
            <Mascot variant="wave" size={250} />
          </div>
        </section>

        <section className="block home-section-card">
          <div className="block-head">
            <h2 className="block-title">Main Features</h2>
          </div>
          <div className="features home-feature-grid">
            {FEATURES.map((feature) => (
              <button key={feature.id} className="feature home-feature-card" type="button" onClick={() => onNav(feature.id)}>
                <div className="feature-icon"><FeatureSvgIcon name={feature.icon} /></div>
                <div className="feature-title">{feature.title}</div>
                <div className="feature-desc">{feature.desc}</div>
                <span className="feature-link">{feature.link}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="block home-section-card">
          <div className="block-head">
            <h2 className="block-title">How MindCare AI Works</h2>
          </div>
          <div className="steps home-steps-grid">
            {HOW_STEPS.map((step) => (
              <div key={step.num} className="step home-step-card">
                <div className="step-icon">
                  {step.icon === "bot" ? (
                    <FeatureSvgIcon name="bot" />
                  ) : (
                    step.icon
                  )}
                </div>  
                <div className="step-body">
                  <div className="step-title">{step.num}. {step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="dash-bottom home-bottom-grid">
          <section className="block chat-preview home-chat-card">
            <div className="block-head">
              <h2 className="block-title">Talk with AI</h2>
              <button className="block-link" type="button" onClick={() => onNav("chat")}>Open AI Support</button>
            </div>
            <div className="chat-preview-msg">
              <div className="chat-preview-avatar">
                <Mascot variant="chat" size={40} />
              </div>
              <div className="chat-preview-bubble">
                <div className="chat-preview-name">Mindy AI</div>
                I'm here to listen and support you. 💚
              </div>
            </div>
            <div className="chat-preview-input">
              <input
                placeholder="Type your message..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onNav("chat");
                }}
              />
              <button className="chat-preview-send" type="button" onClick={() => onNav("chat")}>➜</button>
            </div>
          </section>

          <section className="block home-lessons-card">
            <div className="block-head">
              <h2 className="block-title">Featured Lessons</h2>
              <button className="block-link" type="button" onClick={() => onNav("baihoc")}>View All</button>
            </div>
            <div className="featured-list">
              {FEATURED_LESSONS.map((lesson) => (
                <button key={lesson.title} className="featured-item" type="button" onClick={() => onNav("baihoc")}>
                  <div className="featured-icon" style={{ background: lesson.iconBg }}>{lesson.icon}</div>
                  <div className="featured-body">
                    <div className="featured-title">{lesson.title}</div>
                    <div className="featured-meta">{lesson.type} · {lesson.duration}</div>
                  </div>
                  <span className="featured-arrow">›</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <aside className="dash-side home-side-v3">
        <section className="side-card home-side-card latest-result-card">
          <div className="side-head">
            <h3 className="side-title">Latest Screening Result</h3>
          </div>
          <div className="result-row">
            <span>Date</span>
            <strong>{dateStr}</strong>
          </div>
          <div className="result-row">
            <span>Risk Level</span>
            <span className="risk-pill" style={{ background: risk.bg, color: risk.color }}>{risk.label}</span>
          </div>
          <p className="side-text">You may be experiencing some stress. Take time to care for yourself.</p>
          <button className="btn-outline-full" type="button" onClick={() => onNav("sangloc")}>View Details</button>
        </section>

        <section className="side-card home-side-card suggest-card">
          <div className="suggest-body">
            <h3 className="side-title">Today's Suggestion</h3>
            <p className="side-text">Take 5 deep breaths to reduce stress and improve your mood.</p>
            <button className="btn-primary-sm" type="button" onClick={() => onNav("tainguyen")}>Try Now</button>
          </div>
        </section>

        <section className="encourage-card home-motivation-card">
          <div className="encourage-body">
            <div className="encourage-title">You're doing great! 💚</div>
            <p className="encourage-text">Every small step today creates progress for tomorrow.</p>
          </div>
          <Mascot variant="success" size={92} />
        </section>

        <section className="side-card home-side-card">
          <div className="side-head">
            <h3 className="side-title">Activity History</h3>
            <button className="block-link" type="button" onClick={() => onNav("hoso")}>View All</button>
          </div>
          <div className="activity-list">
            {ACTIVITY.map((activity, index) => (
              <div key={`${activity.text}-${index}`} className="activity-row">
                <div className="activity-icon" style={{ background: activity.iconBg }}><FeatureSvgIcon name={activity.icon} /></div>
                <div className="activity-main">
                  <div className="activity-text">{activity.text}</div>
                  <div className={`activity-status ${activity.type}`}>
                    <span className="activity-dot" />
                    {activity.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}





