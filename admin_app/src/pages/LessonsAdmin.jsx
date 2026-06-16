import { useState } from "react";
import Icon from "../admin/Icon.jsx";
import Sidebar from "../admin/Sidebar.jsx";
import TopBar from "../admin/TopBar.jsx";

/* ── Stat card ─────────────────────────────────────────────────── */
function StatCard({ icon, tone, label, value, sub, trend }) {
  return (
    <div className="la-stat">
      <div className={`la-stat-icon tone-${tone}`}><Icon name={icon} size={22} /></div>
      <div className="la-stat-body">
        <div className="la-stat-label">{label}</div>
        <div className="la-stat-value">{value}</div>
        <div className={`la-stat-sub ${trend ? "up" : ""}`}>
          {trend && <Icon name="arrowUp" size={12} />}{sub}
        </div>
      </div>
    </div>
  );
}

/* ── Badges ────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const published = status === "published";
  return (
    <span className={`la-badge ${published ? "la-badge-green" : "la-badge-amber"}`}>
      <span className="la-badge-dot" />{published ? "Published" : "Draft"}
    </span>
  );
}

const LEVEL_MAP = {
  basic:        ["Basic", "la-lvl-green"],
  intermediate: ["Intermediate", "la-lvl-amber"],
  advanced:     ["Advanced", "la-lvl-red"],
};
function LevelBadge({ level }) {
  const [label, cls] = LEVEL_MAP[level] || ["—", "la-lvl-green"];
  return <span className={`la-level ${cls}`}>{label}</span>;
}

/* ── Data ──────────────────────────────────────────────────────── */
const CAT_COLOR = {
  "Stress Management":      "indigo",
  "Positive Thinking":      "green",
  "Mindfulness":            "amber",
  "Breathing & Relaxation": "blue",
  "Habits":                 "purple",
  "Social Skills":          "pink",
  "Mental Wellness":        "teal",
};

const THUMBS = {
  1: ["🧘", "linear-gradient(135deg,#a7f3d0,#6ee7b7)"],
  2: ["🌅", "linear-gradient(135deg,#fde68a,#fca5a5)"],
  3: ["🪷", "linear-gradient(135deg,#ddd6fe,#c4b5fd)"],
  4: ["🫁", "linear-gradient(135deg,#bfdbfe,#93c5fd)"],
  5: ["🌱", "linear-gradient(135deg,#bbf7d0,#86efac)"],
  6: ["🌧️", "linear-gradient(135deg,#cbd5e1,#94a3b8)"],
  7: ["💬", "linear-gradient(135deg,#fbcfe8,#f9a8d4)"],
  8: ["🌙", "linear-gradient(135deg,#c7d2fe,#a5b4fc)"],
};

const LESSONS = [
  { id: 1, title: "Managing Stress Effectively", desc: "Understand and control stress in everyday life", category: "Stress Management", level: "basic", duration: "15 min", status: "published", date: "14/06/2024 09:15", by: "Admin" },
  { id: 2, title: "Positive Thinking Every Day", desc: "Train a positive mindset to improve your emotions", category: "Positive Thinking", level: "basic", duration: "12 min", status: "published", date: "13/06/2024 21:42", by: "Minh Anh" },
  { id: 3, title: "Mindfulness in the Present", desc: "Practice mindfulness to live fully in the moment", category: "Mindfulness", level: "intermediate", duration: "18 min", status: "published", date: "12/06/2024 18:53", by: "Trần Quang Huy" },
  { id: 4, title: "4-7-8 Relaxation Breathing", desc: "The 4-7-8 breathing technique to ease anxiety quickly", category: "Breathing & Relaxation", level: "basic", duration: "8 min", status: "published", date: "11/06/2024 16:05", by: "Lê Thanh Tâm" },
  { id: 5, title: "Building Healthy Habits", desc: "Step by step toward lasting positive habits", category: "Habits", level: "intermediate", duration: "20 min", status: "draft", date: "10/06/2024 14:30", by: "Phạm Gia Bảo" },
  { id: 6, title: "Facing Anxiety", desc: "Recognize and overcome anxiety sustainably", category: "Stress Management", level: "intermediate", duration: "16 min", status: "draft", date: "09/06/2024 11:22", by: "Vũ Thùy Linh" },
  { id: 7, title: "Positive Communication Skills", desc: "Communicate effectively and build healthy relationships", category: "Social Skills", level: "advanced", duration: "22 min", status: "published", date: "08/06/2024 10:45", by: "Hoàng Nam" },
  { id: 8, title: "Sleep Well, Live Well", desc: "Habits to improve sleep and restore energy", category: "Mental Wellness", level: "basic", duration: "14 min", status: "published", date: "07/06/2024 09:30", by: "Đặng Thu Trang" },
];

const POPULAR = [
  { rank: 1, title: "Positive Thinking Every Day", n: "1,842" },
  { rank: 2, title: "Managing Stress Effectively", n: "1,539" },
  { rank: 3, title: "Mindfulness in the Present", n: "1,203" },
];

/* ── Filter bar ────────────────────────────────────────────────── */
function FilterBar() {
  return (
    <div className="la-filterbar">
      <div className="la-filter-search">
        <Icon name="search" size={16} className="la-search-icon" />
        <input placeholder="Search lessons..." />
      </div>
      <div className="la-select-group">
        <label>Category</label>
        <select className="la-select"><option>All</option></select>
      </div>
      <div className="la-select-group">
        <label>Level</label>
        <select className="la-select"><option>All</option></select>
      </div>
      <div className="la-select-group">
        <label>Status</label>
        <select className="la-select"><option>All</option></select>
      </div>
      <button className="la-btn-ghost"><Icon name="sort" size={16} /> Sort: Newest</button>
      <button className="la-btn-primary"><Icon name="plus" size={16} /> Add Lesson</button>
    </div>
  );
}

/* ── Lesson row ────────────────────────────────────────────────── */
function LessonRow({ lesson, selected, onSelect }) {
  const [emoji, bg] = THUMBS[lesson.id];
  const [user, time] = [lesson.by, lesson.date];
  const isDraft = lesson.status === "draft";
  return (
    <tr className={selected ? "selected" : ""} onClick={() => onSelect(lesson.id)}>
      <td>
        <div className="la-title-cell">
          <span className="la-thumb" style={{ background: bg }}>{emoji}</span>
          <div className="la-title-text">
            <div className="la-title-main">{lesson.title}</div>
            <div className="la-title-desc">{lesson.desc}</div>
          </div>
        </div>
      </td>
      <td><span className={`la-cat la-cat-${CAT_COLOR[lesson.category] || "indigo"}`}>{lesson.category}</span></td>
      <td><LevelBadge level={lesson.level} /></td>
      <td className="la-muted">{lesson.duration}</td>
      <td><StatusBadge status={lesson.status} /></td>
      <td>
        <div className="la-updated"><span>{time}</span><small>{user}</small></div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="la-actions">
          <button className="la-act" title={isDraft ? "Edit" : "View"}><Icon name={isDraft ? "pencil" : "eye"} size={17} /></button>
          <button className="la-act" title="More"><Icon name="dots" size={17} /></button>
        </div>
      </td>
    </tr>
  );
}

/* ── Pagination ────────────────────────────────────────────────── */
function Pagination() {
  const pages = [1, 2, 3, "…", 6];
  const [active] = [1];
  return (
    <div className="la-pagination">
      <div className="la-page-info">Showing 1 to 8 of 48 lessons</div>
      <div className="la-page-controls">
        <button className="la-page-btn"><Icon name="chevronLeft" size={15} /></button>
        {pages.map((p, i) => (
          <button key={i} className={`la-page-btn ${p === active ? "active" : ""} ${p === "…" ? "ellipsis" : ""}`} disabled={p === "…"}>{p}</button>
        ))}
        <button className="la-page-btn"><Icon name="chevronRight" size={15} /></button>
      </div>
      <div className="la-select-group">
        <select className="la-select"><option>10 / page</option></select>
      </div>
    </div>
  );
}

/* ── Mini line chart ───────────────────────────────────────────── */
function MiniLineChart() {
  const data = [42, 38, 47, 44, 53, 58, 63];
  const W = 280, H = 96, pad = 6;
  const max = 100;
  const pts = data.map((v, i) => {
    const x = pad + (i * (W - 2 * pad)) / (data.length - 1);
    const y = H - pad - (v / max) * (H - 2 * pad);
    return [x, y];
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L ${W - pad} ${H} L ${pad} ${H} Z`;
  return (
    <div className="la-chart">
      <div className="la-chart-yaxis"><span>100%</span><span>50%</span><span>0%</span></div>
      <div className="la-chart-plot">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="la-chart-svg">
          <defs>
            <linearGradient id="laFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6366f1" stopOpacity="0.22" />
              <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#eef0f6" strokeWidth="1" />
          <path d={area} fill="url(#laFill)" />
          <path d={line} fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          {pts.length > 0 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill="#6366f1" stroke="#fff" strokeWidth="2" />}
        </svg>
        <div className="la-chart-xaxis"><span>13/05</span><span>27/05</span><span>10/06</span></div>
      </div>
    </div>
  );
}

/* ── Detail panel ──────────────────────────────────────────────── */
const OBJECTIVES = [
  "Understand the causes and signs of stress",
  "Apply simple relaxation techniques",
  "Build a personal stress management plan",
];
const TAGS = ["stress", "relaxation", "emotion control", "+2"];

function DetailPanel({ lesson }) {
  return (
    <aside className="la-detail">
      <div className="la-card">
        <div className="la-card-eyebrow">Selected Lesson</div>
        <div className="la-detail-hero" style={{ background: "linear-gradient(135deg,#bbf7d0,#7dd3c0)" }}>
          <span>🧘</span>
        </div>
        <div className="la-detail-titlerow">
          <h3>{lesson.title}</h3>
          <StatusBadge status={lesson.status} />
        </div>
        <p className="la-detail-desc">
          Understand the root causes of stress and apply simple techniques to manage emotions
          and stay calm in daily life.
        </p>

        <div className="la-detail-section">
          <div className="la-detail-h">Learning Objectives</div>
          {OBJECTIVES.map((o) => (
            <div key={o} className="la-objective"><span className="la-obj-tick"><Icon name="check" size={12} stroke={2.4} /></span>{o}</div>
          ))}
        </div>

        <div className="la-detail-section">
          <div className="la-detail-h">Category &amp; Tags</div>
          <span className="la-cat la-cat-indigo" style={{ marginBottom: 8, display: "inline-block" }}>{lesson.category}</span>
          <div className="la-tags">
            {TAGS.map((t) => <span key={t} className="la-tag">{t}</span>)}
          </div>
        </div>

        <div className="la-detail-actions">
          <button className="la-btn-primary la-btn-grow"><Icon name="pencil" size={15} /> Edit</button>
          <button className="la-btn-green la-btn-grow"><Icon name="publish" size={15} /> Publish</button>
        </div>
        <button className="la-btn-outline la-btn-full"><Icon name="eye" size={16} /> Preview</button>
      </div>

      <div className="la-card">
        <div className="la-card-title">Lesson Statistics</div>
        <div className="la-stat-rate">
          <div>
            <div className="la-rate-label">Completion Rate</div>
            <div className="la-rate-value">63%</div>
          </div>
          <div className="la-rate-trend"><Icon name="arrowUp" size="13" /> 8% vs last month</div>
        </div>

        <MiniLineChart />

        <div className="la-detail-h" style={{ marginTop: 18 }}>Popular Lessons</div>
        {POPULAR.map((p) => (
          <div key={p.rank} className="la-popular">
            <span className="la-pop-rank">{p.rank}</span>
            <div className="la-pop-text">
              <div className="la-pop-title">{p.title}</div>
              <div className="la-pop-sub">{p.n} completions</div>
            </div>
          </div>
        ))}
        <button className="la-link">View All</button>
      </div>
    </aside>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function LessonsAdmin({ onLogout, onNav }) {
  const [selected, setSelected] = useState(1);
  const selectedLesson = LESSONS.find((l) => l.id === selected) || LESSONS[0];

  return (
    <div className="la-shell">
      <Sidebar active="lessons" onNav={onNav} />

      <div className="la-main">
        <TopBar
          title="CBT Lessons Management"
          subtitle="Updated 14/06/2024 · 09:24"
          searchPlaceholder="Search lessons, categories, tags..."
          onLogout={onLogout}
        />

        <div className="la-content">
          <div className="la-content-left">
            {/* Stat cards */}
            <div className="la-stats">
              <StatCard icon="book" tone="indigo" label="Total Lessons" value="48" sub="12% vs last month" trend />
              <StatCard icon="checkCircle" tone="green" label="Active" value="36" sub="75% of all lessons" />
              <StatCard icon="file" tone="orange" label="Drafts" value="8" sub="17% of all lessons" />
              <StatCard icon="clock" tone="red" label="Avg. Completion Rate" value="63%" sub="8% vs last month" trend />
            </div>

            {/* Table card */}
            <div className="la-card la-table-card">
              <FilterBar />
              <div className="la-table-wrap">
                <table className="la-table">
                  <thead>
                    <tr>
                      <th>Title</th><th>Category</th><th>Level</th><th>Duration</th>
                      <th>Status</th><th>Last Updated</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LESSONS.map((l) => (
                      <LessonRow key={l.id} lesson={l} selected={l.id === selected} onSelect={setSelected} />
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination />
            </div>
          </div>

          <DetailPanel lesson={selectedLesson} />
        </div>
      </div>
    </div>
  );
}
