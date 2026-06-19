import { useEffect, useRef, useState } from "react";
import Mascot from "../components/Mascot.jsx";
import FeatureIcon from "../components/FeatureIcon.jsx";

/* Counts a number up from 0 once it scrolls into view. Keeps any
   prefix/suffix (e.g. "10,000+", "95%") and falls back to the raw
   string for non-numeric values like "24/7" or "Free". */
function CountUpValue({ value }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const m = String(value).match(/^([^\d]*)([\d,]+)(.*)$/);
    if (!m || !ref.current || !("IntersectionObserver" in window)) return;
    const [, prefix, numStr, suffix] = m;
    const target = parseInt(numStr.replace(/,/g, ""), 10);
    if (Number.isNaN(target)) return;
    setDisplay(prefix + "0" + suffix);

    let raf;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const dur = 1400;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const n = Math.round(target * eased).toLocaleString("en-US");
          setDisplay(prefix + n + suffix);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

const FEATURES = [
  {
    icon: "shield",
    accent: "#10B981",
    bg: "linear-gradient(135deg, #E8F7F0 0%, #D6F2E6 100%)",
    title: "Mental Health Screening",
    desc: "Clinically validated PHQ-9 and GAD-7 assessments to understand your current mental health status in minutes.",
  },
  {
    icon: "chat",
    accent: "#3B82F6",
    bg: "linear-gradient(135deg, #E8F1FD 0%, #D8E8FC 100%)",
    title: "AI-Powered Support",
    desc: "Chat with an empathetic AI trained on CBT techniques — available 24/7 to help you process emotions and find clarity.",
  },
  {
    icon: "book",
    accent: "#8B5CF6",
    bg: "linear-gradient(135deg, #F1ECFC 0%, #E7DEFB 100%)",
    title: "CBT Lessons & Exercises",
    desc: "Short, practical lessons based on Cognitive Behavioral Therapy to help you build lasting mental wellness habits.",
  },
  {
    icon: "lotus",
    accent: "#F59E0B",
    bg: "linear-gradient(135deg, #FDF3E3 0%, #FBE9CE 100%)",
    title: "Breathing & Mindfulness",
    desc: "Guided breathing exercises and mindfulness tools to reduce stress and anxiety in just a few minutes.",
  },
  {
    icon: "chart",
    accent: "#6366F1",
    bg: "linear-gradient(135deg, #ECEDFC 0%, #DEE0FB 100%)",
    title: "Progress Tracking",
    desc: "Monitor your mental health journey over time with visual trends and personalized insights.",
  },
  {
    icon: "folder",
    accent: "#EC4899",
    bg: "linear-gradient(135deg, #FCEAF2 0%, #FBDCEA 100%)",
    title: "Curated Resources",
    desc: "Explore articles, audio, and videos handpicked by mental health professionals to support your well-being.",
  },
];

const STEPS = [
  { num: "1", icon: "shield", title: "Take a Screening", desc: "Answer a quick PHQ-9 & GAD-7 questionnaire to assess your mental health." },
  { num: "2", icon: "chat",   title: "Chat with AI", desc: "Share what's on your mind. Our AI listens, understands, and guides you." },
  { num: "3", icon: "book",   title: "Learn & Practice", desc: "Complete bite-sized CBT lessons and mindfulness exercises." },
  { num: "4", icon: "trend",  title: "Track Your Journey", desc: "Watch your progress and celebrate every step forward." },
];

const STATS = [
  { value: "10,000+", label: "Users supported" },
  { value: "95%",     label: "Feel less anxious" },
  { value: "24/7",    label: "AI availability" },
  { value: "Free",    label: "Always" },
];

export default function Landing({ onSignIn }) {
  // Reveal-on-scroll: fade/slide elements in as they enter the viewport.
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach((el) => el.classList.add("reveal-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Navbar gains a shadow / solid background once the page is scrolled.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Subtle 3D tilt that follows the cursor across a feature card.
  const handleTilt = (e) => {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${(px * 7).toFixed(2)}deg`);
    card.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
  };
  const resetTilt = (e) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="landing-wrap">

      {/* ── NAVBAR ── */}
      <nav className={`landing-nav${scrolled ? " scrolled" : ""}`}>
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
        <div className="landing-hero-bg" aria-hidden="true">
          <span className="landing-orb landing-orb-1" />
          <span className="landing-orb landing-orb-2" />
          <span className="landing-orb landing-orb-3" />
          <span className="landing-hero-grid" />
        </div>
        <div className="landing-hero-inner">
          <div className="landing-hero-left landing-hero-enter">
            <div className="landing-hero-badge" style={{ "--d": "0.05s" }}>
              <span className="landing-hero-badge-dot" />
              AI-Powered Mental Health Support
            </div>
            <h1 className="landing-hero-title" style={{ "--d": "0.15s" }}>
              Your Mental Health<br />
              Journey,{" "}
              <span className="landing-hero-accent">Supported&nbsp;by&nbsp;AI</span>
            </h1>
            <p className="landing-hero-sub" style={{ "--d": "0.25s" }}>
              MindCare AI combines evidence-based CBT techniques with
              compassionate AI to help you manage stress, anxiety,
              and emotional well-being — anytime, anywhere.
            </p>
            <div className="landing-hero-actions" style={{ "--d": "0.35s" }}>
              <button className="landing-btn-primary" onClick={onSignIn}>
                Get Started — It's Free
                <span className="landing-btn-arrow">→</span>
              </button>
              <a href="#how" className="landing-btn-ghost">
                <span className="landing-btn-play">▶</span>
                See how it works
              </a>
            </div>
            <div className="landing-hero-trust" style={{ "--d": "0.45s" }}>
              <span><b>🔒</b> Private &amp; confidential</span>
              <span><b>✓</b> Clinically informed</span>
              <span><b>⚡</b> Available 24/7</span>
            </div>
          </div>
          <div className="landing-hero-right landing-hero-enter-right">
            <div className="landing-hero-mascot-wrap">
              <div className="landing-hero-ring" />
              <div className="landing-hero-blob" />
              <div className="landing-hero-glow" />
              <Mascot size={280} />
              <div className="landing-hero-bubble landing-hero-bubble-1">
                <span className="landing-bubble-emoji">💚</span>
                "I feel much calmer now"
              </div>
              <div className="landing-hero-bubble landing-hero-bubble-2">
                <span className="landing-bubble-spark">↑</span>
                PHQ-9 score improved
              </div>
              <div className="landing-hero-chip landing-hero-chip-rating">
                <div className="landing-chip-stars">★★★★★</div>
                <div className="landing-chip-sub">Loved by 10k+ users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="landing-stats">
        <div className="landing-stats-inner">
          {STATS.map((s, i) => (
            <div key={s.label} className="landing-stat">
              {i > 0 && <span className="landing-stat-divider" aria-hidden="true" />}
              <div className="landing-stat-value"><CountUpValue value={s.value} /></div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="landing-section" id="features">
        <div className="landing-deco" aria-hidden="true">
          <span className="landing-deco-blob landing-deco-blob-teal" style={{ top: "-130px", left: "-120px" }} />
          <span className="landing-deco-blob landing-deco-blob-blue" style={{ bottom: "-140px", right: "-110px" }} />
          <span className="landing-deco-dots" style={{ top: "40px", right: "30px" }} />
          <span className="landing-deco-dots" style={{ bottom: "40px", left: "30px" }} />
        </div>
        <div className="landing-section-inner">
          <div className="landing-section-eyebrow">Everything you need</div>
          <h2 className="landing-section-title">Features designed for your well-being</h2>
          <p className="landing-section-sub">
            From clinical screening to daily mindfulness — all in one thoughtfully designed app.
          </p>
          <div className="landing-features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="landing-feature-card"
                data-reveal
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
                style={{ "--card-accent": f.accent, transitionDelay: `${i * 0.08}s` }}
              >
                <div className="landing-feature-tilt">
                  <span className="landing-feature-shine" aria-hidden="true" />
                  <div className="landing-feature-icon" style={{ background: f.bg }}>
                    <FeatureIcon name={f.icon} color={f.accent} />
                  </div>
                  <div className="landing-feature-title">{f.title}</div>
                  <div className="landing-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-section landing-section-alt" id="how">
        <div className="landing-deco" aria-hidden="true">
          <span className="landing-deco-dots" style={{ top: "50px", left: "40px" }} />
          <span className="landing-deco-dots" style={{ bottom: "50px", right: "40px" }} />
        </div>
        <div className="landing-section-inner">
          <div className="landing-section-eyebrow">Simple process</div>
          <h2 className="landing-section-title">How MindCare AI works</h2>
          <p className="landing-section-sub">
            Get started in minutes. No appointment needed, no waiting room.
          </p>
          <div className="landing-steps">
            <div className="landing-steps-track" aria-hidden="true" />
            {STEPS.map((s, i) => (
              <div key={s.num} className="landing-step" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="landing-step-icon-circle">
                  <FeatureIcon name={s.icon} size={32} color="var(--primary-dark)" />
                  <span className="landing-step-num">{s.num}</span>
                </div>
                <div className="landing-step-title">{s.title}</div>
                <div className="landing-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / TRUST ── */}
      <section className="landing-section" id="about">
        <div className="landing-deco" aria-hidden="true">
          <span className="landing-deco-blob landing-deco-blob-purple" style={{ top: "-120px", right: "-100px" }} />
          <span className="landing-deco-blob landing-deco-blob-teal" style={{ bottom: "-150px", left: "-120px" }} />
          <span className="landing-deco-dots" style={{ top: "60px", left: "40px" }} />
        </div>
        <div className="landing-section-inner landing-about">
          <div className="landing-about-left">
            <div className="landing-section-eyebrow" style={{ textAlign: "left" }}>About MindCare AI</div>
            <h2 className="landing-section-title" style={{ textAlign: "left" }}>
              Mental health support that truly understands you
            </h2>
            <p className="landing-about-text">
              MindCare AI was built with one goal: to make evidence-based mental health support
              accessible to everyone. Our AI is trained on Cognitive Behavioral Therapy (CBT)
              principles and designed to provide empathetic, non-judgmental support.
            </p>
            <ul className="landing-about-list">
              <li><span className="landing-about-check">✓</span> Based on PHQ-9 &amp; GAD-7 clinical standards</li>
              <li><span className="landing-about-check">✓</span> Responses informed by CBT techniques</li>
              <li><span className="landing-about-check">✓</span> Clinician review for high-risk cases</li>
              <li><span className="landing-about-check">✓</span> Your data stays private and encrypted</li>
            </ul>
            <button className="landing-btn-primary" style={{ marginTop: 28 }} onClick={onSignIn}>
              Start your journey
              <span className="landing-btn-arrow">→</span>
            </button>
          </div>
          <div className="landing-about-right">
            <div className="landing-about-mascot">
              <div className="landing-about-glow" />
              <Mascot size={220} />
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
        <div className="landing-cta-bg" aria-hidden="true">
          <span className="landing-cta-orb landing-cta-orb-1" />
          <span className="landing-cta-orb landing-cta-orb-2" />
        </div>
        <div className="landing-cta-inner">
          <h2 className="landing-cta-title">Ready to take care of your mind?</h2>
          <p className="landing-cta-sub">
            Join thousands of people who use MindCare AI to feel better every day.
          </p>
          <button className="landing-cta-btn" onClick={onSignIn}>
            Get Started for Free
            <span className="landing-btn-arrow">→</span>
          </button>
          <div className="landing-cta-note">
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
          <p className="landing-footer-text landing-footer-fine">
            © 2026 MindCare AI · Not a substitute for professional medical advice.
            If you're in crisis, call <strong className="landing-footer-hotline">988</strong> — Suicide &amp; Crisis Lifeline (24/7)
          </p>
        </div>
      </footer>

    </div>
  );
}
