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

/* ── Filter tabs ───────────────────────────────────────────────── */
const TABS = [
  { id: "all",      label: "All" },
  { id: "articles", label: "Articles" },
  { id: "audio",    label: "Audio" },
  { id: "video",    label: "Video" },
  { id: "tools",    label: "CBT Tools" },
];

function FilterTabs({ active, onTab }) {
  return (
    <div className="la-tabs">
      {TABS.map((t) => (
        <button key={t.id} className={`la-tab ${active === t.id ? "active" : ""}`} onClick={() => onTab(t.id)}>
          {t.label}
        </button>
      ))}
      <button className={`la-tab la-tab-urgent ${active === "urgent" ? "active" : ""}`} onClick={() => onTab("urgent")}>
        <Icon name="alert" size={14} /> Urgent
      </button>
    </div>
  );
}

/* ── Type icon ─────────────────────────────────────────────────── */
const TYPE_META = {
  Audio:     { icon: "headphones", tone: "green",  label: "Audio" },
  Article:   { icon: "article",    tone: "blue",   label: "Article" },
  Video:     { icon: "play",       tone: "pink",   label: "Video" },
  "CBT Tool":{ icon: "tool",       tone: "purple", label: "CBT Tool" },
};
function TypeCell({ type }) {
  const m = TYPE_META[type] || TYPE_META.Article;
  return (
    <span className="la-type">
      <span className={`la-type-icon tone-${m.tone}`}><Icon name={m.icon} size={15} /></span>
      {m.label}
    </span>
  );
}

/* ── Status badge ──────────────────────────────────────────────── */
const STATUS_META = {
  published: ["Published", "la-badge-green"],
  urgent:    ["Urgent", "la-badge-red"],
  update:    ["Needs Update", "la-badge-amber"],
};
function StatusBadge({ status }) {
  const [label, cls] = STATUS_META[status] || STATUS_META.published;
  return <span className={`la-badge ${cls}`}><span className="la-badge-dot" />{label}</span>;
}

/* ── Owner cell ────────────────────────────────────────────────── */
function initials(name) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || "") + (p[p.length - 1]?.[0] || "")).toUpperCase();
}
const AVATAR_TONES = ["#6366f1", "#0ea5e9", "#8b5cf6", "#ef4444", "#14b8a6", "#f59e0b", "#ec4899"];
function Owner({ name, idx }) {
  return (
    <span className="la-owner">
      <span className="la-owner-avatar" style={{ background: AVATAR_TONES[idx % AVATAR_TONES.length] }}>{initials(name)}</span>
      {name}
    </span>
  );
}

/* ── Data ──────────────────────────────────────────────────────── */
const CAT_COLOR = {
  "Stress Relief":        "green",
  "Psychology Knowledge": "blue",
  "Mindfulness":          "purple",
  "Emergency Support":    "pink",
  "CBT":                  "indigo",
  "Mental Wellness":      "teal",
  "Personal Development": "amber",
};
const THUMBS = {
  1: ["🌅", "linear-gradient(135deg,#fde68a,#fca5a5)"],
  2: ["📘", "linear-gradient(135deg,#bfdbfe,#a5b4fc)"],
  3: ["🪷", "linear-gradient(135deg,#ddd6fe,#c4b5fd)"],
  4: ["📞", "linear-gradient(135deg,#fecaca,#fca5a5)"],
  5: ["📓", "linear-gradient(135deg,#c7d2fe,#a5b4fc)"],
  6: ["🌙", "linear-gradient(135deg,#c7d2fe,#93c5fd)"],
  7: ["💪", "linear-gradient(135deg,#fed7aa,#fdba74)"],
};
const RESOURCES = [
  { id: 1, type: "Audio",    title: "5 Minutes of Deep Breathing Daily", desc: "A guided deep-breathing practice to relieve stress quickly.", category: "Stress Relief", duration: "05:23", status: "published", owner: "Trần Quang Huy" },
  { id: 2, type: "Article",  title: "Understanding Anxiety and How to Manage It", desc: "An article covering the basics of anxiety and how to control it.", category: "Psychology Knowledge", duration: "", status: "published", owner: "Lê Thanh Tâm" },
  { id: 3, type: "Video",    title: "Mindfulness Meditation for Beginners", desc: "A 10-minute mindfulness meditation guide for beginners.", category: "Mindfulness", duration: "10:12", status: "published", owner: "Vũ Thùy Linh" },
  { id: 4, type: "Article",  title: "Emergency Support Hotline", desc: "24/7 contact information for emergency situations.", category: "Emergency Support", duration: "", status: "urgent", owner: "Phạm Gia Bảo", urgent: true },
  { id: 5, type: "CBT Tool", title: "Thought Journal (CBT)", desc: "A tool to record and analyze thoughts using the CBT method.", category: "CBT", duration: "", status: "published", owner: "Hoàng Nam" },
  { id: 6, type: "Article",  title: "Managing Sleep Effectively", desc: "Tips and habits to improve sleep quality every day.", category: "Mental Wellness", duration: "", status: "update", owner: "Đặng Thu Trang" },
  { id: 7, type: "Video",    title: "Building Self-Confidence", desc: "A video guide on building and maintaining self-confidence.", category: "Personal Development", duration: "08:45", status: "published", owner: "Nguyễn Hoài An" },
];
const TYPE_TO_TAB = { Audio: "audio", Article: "articles", Video: "video", "CBT Tool": "tools" };

/* ── Resource row ──────────────────────────────────────────────── */
function ResourceRow({ r, idx, selected, onSelect }) {
  const [emoji, bg] = THUMBS[r.id];
  return (
    <tr className={selected ? (r.urgent ? "row-urgent-selected" : "selected") : ""} onClick={() => onSelect(r.id)}>
      <td onClick={(e) => e.stopPropagation()} className="la-check-cell">
        <input type="checkbox" className="la-check" />
      </td>
      <td>
        <div className="la-title-cell">
          <span className="la-thumb" style={{ background: bg }}>
            {emoji}
            {r.urgent && <span className="la-thumb-badge">URGENT</span>}
          </span>
          <div className="la-title-text">
            <div className="la-title-main">{r.title}</div>
            <div className="la-title-desc">{r.desc}</div>
          </div>
        </div>
      </td>
      <td><TypeCell type={r.type} /></td>
      <td><span className={`la-cat la-cat-${CAT_COLOR[r.category] || "indigo"}`}>{r.category}</span></td>
      <td className="la-muted">{r.duration || "—"}</td>
      <td><StatusBadge status={r.status} /></td>
      <td><Owner name={r.owner} idx={idx} /></td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="la-actions"><button className="la-act" title="More"><Icon name="dots" size={17} /></button></div>
      </td>
    </tr>
  );
}

/* ── Pagination ────────────────────────────────────────────────── */
function Pagination() {
  const pages = [1, 2, 3, 4, "…", 14];
  return (
    <div className="la-pagination">
      <div className="la-page-info">Showing 1–10 / 326 resources</div>
      <div className="la-page-controls">
        <button className="la-page-btn"><Icon name="chevronsLeft" size={14} /></button>
        <button className="la-page-btn"><Icon name="chevronLeft" size={15} /></button>
        {pages.map((p, i) => (
          <button key={i} className={`la-page-btn ${p === 1 ? "active" : ""} ${p === "…" ? "ellipsis" : ""}`} disabled={p === "…"}>{p}</button>
        ))}
        <button className="la-page-btn"><Icon name="chevronRight" size={15} /></button>
        <button className="la-page-btn"><Icon name="chevronsRight" size={14} /></button>
      </div>
      <div className="la-select-group">
        <select className="la-select"><option>10 / page</option></select>
      </div>
    </div>
  );
}

/* ── Detail panel ──────────────────────────────────────────────── */
const TAGS = ["urgent", "hotline", "support", "24/7"];
const INFO = [
  ["Resource ID", "RSRC-2024-0123"],
  ["Created", "12/06/2024 14:22"],
  ["Last Updated", "13/06/2024 09:18"],
];

function DetailPanel({ resource, onClose }) {
  return (
    <aside className="la-detail la-detail-single">
      <div className="la-card la-detail-card">
        <button className="la-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>

        <div className="la-hotline-banner">
          <span className="la-hotline-circle"><Icon name="phone" size={22} /></span>
          <div>
            <div className="la-hotline-label">24/7 SUPPORT HOTLINE</div>
            <div className="la-hotline-num">0169 234 5678</div>
          </div>
        </div>

        <div className="la-detail-titlerow">
          <h3>{resource.title}</h3>
          <span className="la-badge la-badge-red"><span className="la-badge-dot" />Urgent</span>
        </div>
        <div className="la-detail-meta">Article • Emergency Support</div>
        <p className="la-detail-desc">
          24/7 contact information for emergency situations related to mental and emotional health.
        </p>

        <div className="la-info">
          {INFO.map(([k, v]) => (
            <div key={k} className="la-info-row"><span className="la-info-label">{k}</span><span className="la-info-value">{v}</span></div>
          ))}
          <div className="la-info-row">
            <span className="la-info-label">Owner</span>
            <span className="la-info-value la-info-owner">
              <span className="la-owner-avatar" style={{ background: "#ef4444" }}>PB</span>Phạm Gia Bảo
            </span>
          </div>
        </div>

        <div className="la-detail-section">
          <div className="la-detail-h">Tags</div>
          <div className="la-tags">{TAGS.map((t) => <span key={t} className="la-tag">{t}</span>)}</div>
        </div>

        <div className="la-detail-section">
          <div className="la-detail-h">Usage Count</div>
          <div className="la-usage">
            <span className="la-usage-icon"><Icon name="users" size={20} /></span>
            <div>
              <div className="la-usage-num">1,248</div>
              <div className="la-usage-trend"><Icon name="arrowUp" size={12} /> 15% vs last month</div>
            </div>
          </div>
        </div>

        <div className="la-detail-foot">
          <button className="la-btn-outline la-btn-grow"><Icon name="pencil" size={15} /> Edit</button>
          <button className="la-icon-btn-sm"><Icon name="link" size={16} /></button>
          <button className="la-btn-green la-btn-grow"><Icon name="publish" size={15} /> Publish</button>
        </div>
      </div>
    </aside>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function ResourcesAdmin({ onLogout, onNav }) {
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(4);

  const filtered = RESOURCES.filter((r) => {
    if (tab === "all") return true;
    if (tab === "urgent") return r.status === "urgent";
    return TYPE_TO_TAB[r.type] === tab;
  });
  const selectedResource = RESOURCES.find((r) => r.id === selected);
  const panelOpen = !!selectedResource;

  return (
    <div className="la-shell">
      <Sidebar active="resources" onNav={onNav} />

      <div className="la-main">
        <TopBar
          title="Resource Management"
          subtitle="Updated 14/06/2024 · 09:24"
          searchPlaceholder="Search resources, categories, owners..."
          onLogout={onLogout}
        />

        <div className={`la-content ${panelOpen ? "" : "la-content-nopanel"}`}>
          <div className="la-content-left">
            {/* Stat cards */}
            <div className="la-stats">
              <StatCard icon="book" tone="indigo" label="Total Resources" value="326" sub="18 new resources" trend />
              <StatCard icon="alert" tone="red" label="Urgent" value="12" sub="3 resources" trend />
              <StatCard icon="checkCircle" tone="green" label="Published" value="286" sub="87.7% of all resources" />
              <StatCard icon="clock" tone="orange" label="Needs Update" value="28" sub="8.6% of all resources" />
            </div>

            {/* Table card */}
            <div className="la-card la-table-card">
              <div className="la-res-toolbar">
                <FilterTabs active={tab} onTab={setTab} />
                <div className="la-filter-search la-res-search">
                  <Icon name="search" size={16} className="la-search-icon" />
                  <input placeholder="Search within list..." />
                </div>
                <div className="la-select-group">
                  <label>Category</label>
                  <select className="la-select"><option>All</option></select>
                </div>
                <button className="la-btn-primary"><Icon name="plus" size={16} /> Add Resource</button>
              </div>

              <div className="la-table-wrap">
                <table className="la-table">
                  <thead>
                    <tr>
                      <th className="la-check-cell"><input type="checkbox" className="la-check" /></th>
                      <th>Resource Name</th><th>Type</th><th>Category</th>
                      <th>Duration</th><th>Status</th><th>Owner</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <ResourceRow key={r.id} r={r} idx={i} selected={r.id === selected} onSelect={setSelected} />
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination />
            </div>
          </div>

          {panelOpen && <DetailPanel resource={selectedResource} onClose={() => setSelected(null)} />}
        </div>
      </div>
    </div>
  );
}
