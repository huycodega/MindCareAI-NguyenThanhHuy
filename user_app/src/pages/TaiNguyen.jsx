import { useState } from "react";
import MascotCard from "../components/MascotCard.jsx";
import PageHero from "../components/PageHero.jsx";

const FILTER_TABS = ["All", "Articles", "Audio", "Video", "Journal", "CBT"];

const RESOURCES = [
  {
    id: 1, type: "article", typeLabel: "Articles", icon: "📄",
    thumb: "📰",
    title: "5-4-3-2-1 Technique for Instant Anxiety Relief",
    desc: "A detailed guide to the 5-sense grounding technique for beginners",
    duration: "5 min read", tags: ["Anxiety", "Grounding", "Quick technique"],
    views: "1.2k", saved: true,
  },
  {
    id: 2, type: "audio", typeLabel: "Audio", icon: "🎧",
    thumb: "🎵",
    title: "Guided Meditation — Morning Stress Relief",
    desc: "A 10-minute meditation to start your day with a calm mind",
    duration: "10 min", tags: ["Meditation", "Stress", "Morning"],
    views: "2.4k", saved: false,
  },
  {
    id: 3, type: "video", typeLabel: "Video", icon: "🎬",
    thumb: "🎥",
    title: "CBT Basics: How to Identify Negative Thoughts",
    desc: "Video explaining the cognitive–emotion–behavior triangle in CBT",
    duration: "8 min", tags: ["CBT", "Thinking", "Basics"],
    views: "3.1k", saved: false,
  },
  {
    id: 4, type: "exercise", typeLabel: "CBT", icon: "🧩",
    thumb: "✍️",
    title: "Thought Record Exercise",
    desc: "A worksheet to help analyze and reframe negative thoughts",
    duration: "15 min", tags: ["Thought Record", "CBT", "Practice"],
    views: "890", saved: true,
  },
  {
    id: 5, type: "journal", typeLabel: "Journal", icon: "📓",
    thumb: "📖",
    title: "Daily Emotion Journal Template",
    desc: "A guide to journaling emotions using the CBT method",
    duration: "10 min/day", tags: ["Journal", "Emotions", "Habit"],
    views: "1.5k", saved: false,
  },
  {
    id: 6, type: "article", typeLabel: "Articles", icon: "📄",
    thumb: "🌙",
    title: "Improve Sleep with CBT-I Techniques",
    desc: "A summary of CBT techniques designed specifically for insomnia",
    duration: "7 min read", tags: ["Sleep", "Insomnia", "CBT-I"],
    views: "2.0k", saved: false,
  },
];

const SUGGESTED_RESOURCES = [
  { icon: "🌿", title: "Box Breathing Exercise",             type: "Audio",   time: "5 min" },
  { icon: "📋", title: "Daily Self-Care Checklist",          type: "Journal", time: "5 min" },
  { icon: "🧘", title: "Gentle Yoga for Anxiety",            type: "Video",   time: "20 min" },
  { icon: "💡", title: "10 Mood Self-Check Questions",       type: "Article", time: "3 min" },
];

const TYPE_BADGE_CLASS = {
  article:  "rtype-article",
  audio:    "rtype-audio",
  video:    "rtype-video",
  exercise: "rtype-exercise",
  journal:  "rtype-journal",
};

export default function TaiNguyen() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [savedItems, setSavedItems] = useState(new Set(RESOURCES.filter((r) => r.saved).map((r) => r.id)));

  const filtered = RESOURCES.filter((r) => {
    const matchTab = activeTab === "All" || r.typeLabel === activeTab;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  function toggleSave(id) {
    setSavedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <PageHero
        title="Resources"
        subtitle="Explore curated articles, audio, videos, and exercises to support your mental wellness — anytime you need them."
        right={
          <div className="hero-emergency">
            <div className="hero-emergency-title">🆘 Need help now?</div>
            <div className="hero-emergency-text">
              If you're in crisis, you don't have to face it alone. Reach out for immediate support.
            </div>
            <a className="hero-emergency-btn" href="tel:1800599920">📞 Call 1800 599 920</a>
          </div>
        }
      />
      <div className="resources-layout">
      <div className="resources-left">
        <div className="search-bar-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-bar"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-soft)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div>No results found</div>
          </div>
        ) : (
          <div className="resources-grid">
            {filtered.map((r) => (
              <div key={r.id} className="resource-card">
                <div className="resource-thumb">{r.thumb}</div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span className={`resource-type-badge ${TYPE_BADGE_CLASS[r.type] || ""}`}>
                      {r.icon} {r.typeLabel}
                    </span>
                    <button
                      style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: savedItems.has(r.id) ? "var(--primary)" : "var(--ink-soft)" }}
                      onClick={() => toggleSave(r.id)}
                      title={savedItems.has(r.id) ? "Unsave" : "Save"}
                    >
                      {savedItems.has(r.id) ? "🔖" : "🏷️"}
                    </button>
                  </div>
                  <div className="resource-title">{r.title}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", margin: "4px 0 8px", lineHeight: 1.5 }}>{r.desc}</div>
                  <div className="resource-meta">
                    <span>⏱ {r.duration}</span>
                    <span>👁 {r.views} views</span>
                  </div>
                  <div className="resource-tags" style={{ marginTop: 8 }}>
                    {r.tags.map((t) => (
                      <span key={t} className="resource-tag">{t}</span>
                    ))}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm btn-full">
                  {r.type === "audio" ? "▶ Listen" : r.type === "video" ? "▶ Watch" : r.type === "exercise" ? "✍️ Start exercise" : r.type === "journal" ? "📝 Use template" : "📖 Read now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="resources-right">
        <MascotCard
          variant="resources"
          title="Need support right now? 🌿"
          text="Don't hesitate to share — AI Support is always ready to listen 24/7."
          size={72}
        />

        <div className="emergency-banner">
          <h3>🆘 Need help immediately?</h3>
          <p>Contact the mental health support line available 24/7</p>
          <div className="emergency-phone">📞 1800 599 920</div>
        </div>

        {savedItems.size > 0 && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 10 }}>🔖 Saved ({savedItems.size})</div>
            {RESOURCES.filter((r) => savedItems.has(r.id)).map((r) => (
              <div key={r.id} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
                <div style={{ fontSize: 20 }}>{r.thumb}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", lineHeight: 1.3 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.duration}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>✨ Recommended Resources</div>
          {SUGGESTED_RESOURCES.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < SUGGESTED_RESOURCES.length - 1 ? "1px solid var(--line)" : "none", cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{r.title}</div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.type} · {r.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 10 }}>📊 Your Activity</div>
          {[
            { label: "Articles read",     value: "4", icon: "📄" },
            { label: "Audio listened",    value: "2", icon: "🎧" },
            { label: "Exercises done",    value: "1", icon: "🧩" },
            { label: "Currently saved",   value: `${savedItems.size}`, icon: "🔖" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
              <span style={{ color: "var(--ink-soft)" }}>{s.icon} {s.label}</span>
              <span style={{ fontWeight: 700, color: "var(--ink)" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
