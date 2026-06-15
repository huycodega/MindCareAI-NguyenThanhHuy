import Mascot from "../components/Mascot.jsx";

const FEATURES = [
  {
    icon: "🛡️",
    bg: "#E8F5E9",
    title: "Mental Health Screening",
    desc: "Clinically validated PHQ-9 and GAD-7 assessments to understand your current mental health status in minutes.",
  },
  {
    icon: "💬",
    bg: "#E3F2FD",
    title: "AI-Powered Support",
    desc: "Chat with an empathetic AI trained on CBT techniques — available 24/7 to help you process emotions and find clarity.",
  },
  {
    icon: "📖",
    bg: "#F3E5F5",
    title: "CBT Lessons & Exercises",
    desc: "Short, practical lessons based on Cognitive Behavioral Therapy to help you build lasting mental wellness habits.",
  },
  {
    icon: "🧘",
    bg: "#FFF3E0",
    title: "Breathing & Mindfulness",
    desc: "Guided breathing exercises and mindfulness tools to reduce stress and anxiety in just a few minutes.",
  },
  {
    icon: "📊",
    bg: "#E8EAF6",
    title: "Progress Tracking",
    desc: "Monitor your mental health journey over time with visual trends and personalized insights.",
  },
  {
    icon: "🗂️",
    bg: "#FCE4EC",
    title: "Curated Resources",
    desc: "Explore articles, audio, and videos handpicked by mental health professionals to support your well-being.",
  },
];

const STEPS = [
  { num: "1", icon: "🛡️", title: "Take a Screening", desc: "Answer a quick PHQ-9 & GAD-7 questionnaire to assess your mental health." },
  { num: "2", icon: "💬", title: "Chat with AI", desc: "Share what's on your mind. Our AI listens, understands, and guides you." },
  { num: "3", icon: "📖", title: "Learn & Practice", desc: "Complete bite-sized CBT lessons and mindfulness exercises." },
  { num: "4", icon: "📈", title: "Track Your Journey", desc: "Watch your progress and celebrate every step forward." },
];

const STATS = [
  { value: "10,000+", label: "Users supported" },
  { value: "95%",     label: "Feel less anxious" },
  { value: "24/7",    label: "AI availability" },
  { value: "Free",    label: "Always" },
];

export default function Landing({ onSignIn }) {
  return (
    <div className="landing-wrap">

      {/* ── NAVBAR ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon">🌿</div>
            <span className="landing-logo-text">MindCare AI</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how" className="landing-nav-link">How it works</a>
            <a href="#about" className="landing-nav-link">About</a>
          </div>
          <button className="landing-signin-btn" onClick={onSignIn}>
            Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-left">
            <div className="landing-hero-badge">
              <span className="landing-hero-badge-dot" />
              AI-Powered Mental Health Support
            </div>
            <h1 className="landing-hero-title">
              Your Mental Health<br />
              Journey,<br />
              <span className="landing-hero-accent">Supported by AI</span>
            </h1>
            <p className="landing-hero-sub">
              MindCare AI combines evidence-based CBT techniques with
              compassionate AI to help you manage stress, anxiety,
              and emotional well-being — anytime, anywhere.
            </p>
            <div className="landing-hero-actions">
              <button className="landing-btn-primary" onClick={onSignIn}>
                Get Started — It's Free
              </button>
              <a href="#how" className="landing-btn-ghost">
                See how it works →
              </a>
            </div>
            <div className="landing-hero-trust">
              <span>🔒 Private & confidential</span>
              <span>✓ Clinically informed</span>
              <span>⚡ Available 24/7</span>
            </div>
          </div>
          <div className="landing-hero-right">
            <div className="landing-hero-mascot-wrap">
              <div className="landing-hero-glow" />
              <Mascot size={260} />
              <div className="landing-hero-bubble landing-hero-bubble-1">
                "I feel much calmer now 💚"
              </div>
              <div className="landing-hero-bubble landing-hero-bubble-2">
                PHQ-9 score improved ↑
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="landing-stats">
        <div className="landing-stats-inner">
          {STATS.map((s) => (
            <div key={s.label} className="landing-stat">
              <div className="landing-stat-value">{s.value}</div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="landing-section" id="features">
        <div className="landing-section-inner">
          <div className="landing-section-eyebrow">Everything you need</div>
          <h2 className="landing-section-title">Features designed for your well-being</h2>
          <p className="landing-section-sub">
            From clinical screening to daily mindfulness — all in one thoughtfully designed app.
          </p>
          <div className="landing-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="landing-feature-card">
                <div className="landing-feature-icon" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <div className="landing-feature-title">{f.title}</div>
                <div className="landing-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-section landing-section-alt" id="how">
        <div className="landing-section-inner">
          <div className="landing-section-eyebrow">Simple process</div>
          <h2 className="landing-section-title">How MindCare AI works</h2>
          <p className="landing-section-sub">
            Get started in minutes. No appointment needed, no waiting room.
          </p>
          <div className="landing-steps">
            {STEPS.map((s, i) => (
              <div key={s.num} className="landing-step">
                <div className="landing-step-num">{s.num}</div>
                {i < STEPS.length - 1 && <div className="landing-step-line" />}
                <div className="landing-step-icon-circle">{s.icon}</div>
                <div className="landing-step-title">{s.title}</div>
                <div className="landing-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / TRUST ── */}
      <section className="landing-section" id="about">
        <div className="landing-section-inner landing-about">
          <div className="landing-about-left">
            <div className="landing-section-eyebrow">About MindCare AI</div>
            <h2 className="landing-section-title" style={{ textAlign: "left" }}>
              Mental health support that truly understands you
            </h2>
            <p className="landing-about-text">
              MindCare AI was built with one goal: to make evidence-based mental health support
              accessible to everyone. Our AI is trained on Cognitive Behavioral Therapy (CBT)
              principles and designed to provide empathetic, non-judgmental support.
            </p>
            <ul className="landing-about-list">
              <li>✓ Based on PHQ-9 & GAD-7 clinical standards</li>
              <li>✓ Responses informed by CBT techniques</li>
              <li>✓ Clinician review for high-risk cases</li>
              <li>✓ Your data stays private and encrypted</li>
            </ul>
            <button className="landing-btn-primary" style={{ marginTop: 24 }} onClick={onSignIn}>
              Start your journey
            </button>
          </div>
          <div className="landing-about-right">
            <div className="landing-about-mascot">
              <Mascot size={200} />
              <div className="landing-about-card">
                <div className="landing-about-card-icon">💚</div>
                <div className="landing-about-card-text">
                  <strong>You're not alone.</strong><br />
                  MindCare AI is here to listen and support you every step of the way.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <h2 className="landing-cta-title">Ready to take care of your mind?</h2>
          <p className="landing-cta-sub">
            Join thousands of people who use MindCare AI to feel better every day.
          </p>
          <button className="landing-cta-btn" onClick={onSignIn}>
            Get Started for Free
          </button>
          <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            No credit card required · 100% confidential
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-logo" style={{ marginBottom: 8 }}>
            <div className="landing-logo-icon">🌿</div>
            <span className="landing-logo-text">MindCare AI</span>
          </div>
          <p className="landing-footer-text">
            AI-powered mental health support, available 24/7.
          </p>
          <p className="landing-footer-text" style={{ marginTop: 8, fontSize: 12, color: "#94A3B8" }}>
            © 2026 MindCare AI · Not a substitute for professional medical advice.
            If you're in crisis, call <strong style={{ color: "#F87171" }}>1800 599 920</strong> (24/7)
          </p>
        </div>
      </footer>

    </div>
  );
}
