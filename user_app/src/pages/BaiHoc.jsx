import { useState } from "react";
import MascotCard from "../components/MascotCard.jsx";
import PageHero from "../components/PageHero.jsx";
import Mascot from "../components/Mascot.jsx";

const CATEGORIES = ["All", "Anxiety Management", "Positive Thinking", "Mindfulness", "Relaxation", "Relationships"];

const THUMB_GRADIENTS = {
  "Anxiety Management": "linear-gradient(135deg, #C2EDEB 0%, #7ED4C8 100%)",
  "Positive Thinking":  "linear-gradient(135deg, #E0D4FC 0%, #BBA3F5 100%)",
  "Mindfulness":        "linear-gradient(135deg, #C8DFFF 0%, #97BDF8 100%)",
  "Relaxation":         "linear-gradient(135deg, #C4ECC8 0%, #90CCA0 100%)",
  "Relationships":      "linear-gradient(135deg, #FFD4E4 0%, #F5A0C0 100%)",
};

// image: đặt file PNG vào user_app/public/lessons/ rồi điền đường dẫn "/lessons/tên-file.png"
const LESSONS = [
  {
    id: 1, image: null, icon: "🌊", category: "Anxiety Management",
    title: "Managing Anxiety Emotions",
    desc: "Learn about anxiety and how to regulate emotions through CBT",
    duration: "15 min", chapters: 5, progress: 80, difficulty: "easy",
  },
  {
    id: 2, image: null, icon: "💭", category: "Positive Thinking",
    title: "Positive Thinking & Optimism",
    desc: "Techniques for identifying and changing negative thought patterns",
    duration: "20 min", chapters: 6, progress: 40, difficulty: "medium",
  },
  {
    id: 3, image: null, icon: "🧘", category: "Mindfulness",
    title: "Basic Mindfulness Techniques",
    desc: "Practice mindfulness to reduce stress and increase present-moment awareness",
    duration: "12 min", chapters: 4, progress: 0, difficulty: "easy",
  },
  {
    id: 4, image: null, icon: "😴", category: "Relaxation",
    title: "5-4-3-2-1 Stress Reduction",
    desc: "5-sense grounding technique for immediate calm",
    duration: "8 min", chapters: 3, progress: 100, difficulty: "easy",
  },
  {
    id: 5, image: null, icon: "🎯", category: "Positive Thinking",
    title: "Identifying Cognitive Distortions",
    desc: "Learn to spot 10 common cognitive distortions and how to challenge them",
    duration: "25 min", chapters: 8, progress: 20, difficulty: "hard",
  },
  {
    id: 6, image: null, icon: "❤️", category: "Relationships",
    title: "Mental Health in Relationships",
    desc: "Healthy communication, personal boundaries, and mutual support",
    duration: "18 min", chapters: 5, progress: 0, difficulty: "medium",
  },
];

const STREAK_DAYS = [
  { label: "Mon", done: true },
  { label: "Tue", done: true },
  { label: "Wed", done: true },
  { label: "Thu", done: true },
  { label: "Fri", done: true },
  { label: "Sat", done: false, today: true },
  { label: "Sun", done: false },
];

const SUGGESTED = [
  { icon: "🌿", title: "4-7-8 Breathing to Relax",     time: "5 min" },
  { icon: "📓", title: "Daily Emotion Journal",         time: "10 min" },
  { icon: "🧩", title: "Thought Reframing Exercise",    time: "15 min" },
];

function DiffBadge({ level }) {
  const map = {
    easy:   ["Beginner",     "diff-easy"],
    medium: ["Intermediate", "diff-medium"],
    hard:   ["Advanced",     "diff-hard"],
  };
  const [label, cls] = map[level] || ["—", "diff-easy"];
  return <span className={`difficulty-badge ${cls}`}>{label}</span>;
}

export default function BaiHoc() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openLesson, setOpenLesson] = useState(null);

  const filtered = activeCategory === "All"
    ? LESSONS
    : LESSONS.filter((l) => l.category === activeCategory);

  if (openLesson) {
    const lesson = LESSONS.find((l) => l.id === openLesson);
    return (
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => setOpenLesson(null)}>
          ← Back to list
        </button>
        <div className="card card-lg">
          <div style={{ fontSize: 48, marginBottom: 16 }}>{lesson.icon}</div>
          <div className="eyebrow">{lesson.category}</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{lesson.title}</h1>
          <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>{lesson.desc}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <span className="badge badge-gray">⏱ {lesson.duration}</span>
            <span className="badge badge-gray">📚 {lesson.chapters} chapters</span>
            <DiffBadge level={lesson.difficulty} />
          </div>
          {lesson.progress > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-soft)", marginBottom: 6 }}>
                <span>Progress</span><span>{lesson.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${lesson.progress}%` }} />
              </div>
            </div>
          )}
          <div className="divider" />
          <div style={{ marginBottom: 20 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Lesson Content</div>
            {Array.from({ length: lesson.chapters }, (_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i * (100 / lesson.chapters) < lesson.progress ? "var(--primary)" : "var(--line)", color: i * (100 / lesson.chapters) < lesson.progress ? "#fff" : "var(--ink-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {i * (100 / lesson.chapters) < lesson.progress ? "✓" : i + 1}
                </div>
                <div style={{ fontSize: 14, color: "var(--ink)" }}>Chapter {i + 1}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg btn-full">
            {lesson.progress === 0 ? "Start lesson" : lesson.progress === 100 ? "Review again" : "Continue lesson"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        title="CBT Lessons & Exercises"
        subtitle="Learn practical cognitive behavioral therapy skills through short lessons and guided exercises you can apply every day."
        mascot="reading"
      />

      <div className="lessons-layout">
        {/* ── LEFT COLUMN ── */}
        <div className="lessons-left">

          {/* 1. Filter tabs — ABOVE featured card (matches mockup) */}
          <div className="filter-tabs" style={{ marginBottom: 16 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-tab ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 2. Featured journey card */}
          <div className="featured-lesson">
            <div className="featured-inner">
              <div className="featured-left">
                <div className="featured-badge">🌟 7-Day Journey</div>
                <div className="featured-title">Mindful Living</div>
                <div className="featured-stats-row">
                  <span className="featured-stat">📚 14 lessons</span>
                  <span className="featured-stat-sep">·</span>
                  <span className="featured-stat">⏱ 7 days</span>
                  <span className="featured-stat-sep">·</span>
                  <span className="featured-stat">⭐ Beginner</span>
                </div>
                <div className="featured-progress-wrap">
                  <div className="featured-progress">
                    <div className="featured-progress-fill" style={{ width: "71%" }} />
                  </div>
                  <div className="featured-progress-label">5/7 days completed</div>
                </div>
                <button className="featured-btn" onClick={() => setOpenLesson(1)}>
                  Continue →
                </button>
              </div>
              <div className="featured-right">
                <Mascot variant="reading" size={148} />
              </div>
            </div>
          </div>

          {/* 3. Section heading */}
          <div className="lessons-section-header">
            <div className="lessons-section-title">Lessons by Topic</div>
            <span className="lessons-section-count">{filtered.length} lessons</span>
          </div>

          {/* 4. Lesson cards grid */}
          <div className="lessons-grid">
            {filtered.map((lesson) => (
              <div
                key={lesson.id}
                className="lesson-card"
                onClick={() => setOpenLesson(lesson.id)}
              >
                {/* Colored thumbnail header */}
                <div
                  className="lesson-card-thumb"
                  style={{ background: THUMB_GRADIENTS[lesson.category] || "var(--primary-soft)" }}
                >
                  {lesson.image ? (
                    <img src={lesson.image} alt={lesson.title} className="lesson-card-img" />
                  ) : (
                    <span className="lesson-card-thumb-icon">{lesson.icon}</span>
                  )}
                  {lesson.progress === 100 && (
                    <span className="lesson-thumb-done">✓ Done</span>
                  )}
                </div>

                {/* Card body */}
                <div className="lesson-card-body">
                  <span className="lesson-cat-badge">{lesson.category}</span>
                  <div className="lesson-card-title">{lesson.title}</div>
                  <div className="lesson-card-meta">
                    <span>⏱ {lesson.duration}</span>
                    <span>📚 {lesson.chapters} ch.</span>
                    <DiffBadge level={lesson.difficulty} />
                  </div>

                  {lesson.progress > 0 && lesson.progress < 100 && (
                    <div className="lesson-progress">
                      <div className="lesson-progress-label">
                        <span>Progress</span>
                        <span>{lesson.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${lesson.progress}%` }} />
                      </div>
                    </div>
                  )}

                  <button className="lesson-card-btn">
                    {lesson.progress === 0
                      ? "Start"
                      : lesson.progress === 100
                      ? "Review again"
                      : "Continue →"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 5. View all link */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button className="btn btn-ghost" style={{ fontSize: 13 }}>
              View all lessons ↓
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lessons-right">
          <MascotCard
            variant="reading"
            title="Today's Suggestion 💡"
            text="Try the 'Identifying Negative Thoughts' lesson — just 15 minutes to start changing your mindset!"
            size={72}
          />

          <div className="card">
            <div className="streak-widget">
              <div className="streak-header">
                <div>
                  <div className="streak-number">5 🔥</div>
                  <div className="streak-label">Day learning streak</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10, fontWeight: 500 }}>This week</div>
              <div className="streak-days">
                {STREAK_DAYS.map((d, i) => (
                  <div key={i} className={`streak-day ${d.done ? "done" : d.today ? "today" : "empty"}`}>
                    {d.done ? "✓" : d.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>📊 Overall Progress</div>
            {[
              { label: "Completed",   value: 1, total: 6, color: "var(--success)" },
              { label: "In progress", value: 3, total: 6, color: "var(--primary)" },
              { label: "Not started", value: 2, total: 6, color: "var(--ink-soft)" },
            ].map((s) => (
              <div key={s.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-soft)", marginBottom: 5 }}>
                  <span>{s.label}</span><span style={{ fontWeight: 600, color: s.color }}>{s.value}/{s.total}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(s.value / s.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>✨ Suggested for You</div>
            {SUGGESTED.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < SUGGESTED.length - 1 ? "1px solid var(--line)" : "none", cursor: "pointer" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>⏱ {s.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
