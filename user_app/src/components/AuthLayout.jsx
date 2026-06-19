import Mascot from "./Mascot.jsx";

// Shared two-pane auth shell: a decorated brand panel (landing aesthetic)
// on the left and the form card on the right. `children` is the form card body.
export default function AuthLayout({ children }) {
  return (
    <div className="auth2">
      {/* ── Brand / hero panel ── */}
      <aside className="auth2-brand">
        <div className="auth2-brand-bg" aria-hidden="true">
          <span className="landing-orb landing-orb-1" />
          <span className="landing-orb landing-orb-2" />
          <span className="auth2-brand-grid" />
        </div>

        <div className="auth2-brand-top">
          <div className="auth2-brand-logo">
            <span className="auth2-brand-logo-icon">🌿</span>
            <span>MindCare AI</span>
          </div>
        </div>

        <div className="auth2-brand-inner">
          <div className="auth2-brand-badge">
            <span className="landing-hero-badge-dot" />
            AI-Powered Mental Health Support
          </div>
          <h2 className="auth2-brand-head">
            Your mental health journey,{" "}
            <span className="auth2-brand-accent">supported by AI</span>
          </h2>
          <p className="auth2-brand-sub">
            Evidence-based CBT techniques with compassionate AI — a safe,
            confidential space, with clinicians reviewing anything sensitive.
          </p>
          <ul className="auth2-brand-list">
            <li><span className="auth2-brand-check">✓</span> Private &amp; encrypted</li>
            <li><span className="auth2-brand-check">✓</span> Clinically informed (PHQ-9 &amp; GAD-7)</li>
            <li><span className="auth2-brand-check">✓</span> Available 24/7</li>
          </ul>
        </div>

        <div className="auth2-brand-mascot">
          <Mascot size={130} />
          <div className="auth2-brand-quote">
            <span className="auth2-brand-quote-emoji">💚</span>
            "I finally feel heard."
          </div>
        </div>
      </aside>

      {/* ── Form panel ── */}
      <main className="auth2-panel">
        <div className="auth2-panel-deco" aria-hidden="true">
          <span className="landing-deco-blob landing-deco-blob-teal" style={{ top: "-120px", right: "-120px" }} />
          <span className="landing-deco-dots" style={{ bottom: "40px", left: "30px" }} />
        </div>
        <div className="login-card auth2-card">{children}</div>
      </main>
    </div>
  );
}
