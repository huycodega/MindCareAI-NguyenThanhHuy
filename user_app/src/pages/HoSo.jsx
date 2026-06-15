import { useState, useEffect } from "react";
import { api } from "../api.js";
import MascotCard from "../components/MascotCard.jsx";
import PageHero from "../components/PageHero.jsx";

const HISTORY_ITEMS = [
  { icon: "🔍", text: "Completed PHQ-9 Screening — Score: 6/27 (Mild)", date: "15/06/2026" },
  { icon: "💬", text: "Started using CBT AI Support",                    date: "14/06/2026" },
  { icon: "📋", text: "Completed Intake Form",                           date: "14/06/2026" },
  { icon: "✅", text: "Registered MindCare AI account",                  date: "14/06/2026" },
];

const SNAPSHOTS = [
  { emoji: "😊", label: "Today",     date: "15/06" },
  { emoji: "🙂", label: "Yesterday", date: "14/06" },
  { emoji: "😐", label: "Thu",       date: "13/06" },
  { emoji: "😊", label: "Wed",       date: "12/06" },
  { emoji: "😔", label: "Tue",       date: "11/06" },
  { emoji: "🙂", label: "Mon",       date: "10/06" },
];

export default function HoSo({ user }) {
  const [memory, setMemory] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [intake, setIntake] = useState(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.username || "");

  useEffect(() => {
    Promise.all([
      api.myMemory().catch(() => null),
      api.listConversations().catch(() => ({ conversations: [] })),
      api.getIntake().catch(() => null),
    ]).then(([m, c, i]) => {
      setMemory(m);
      setConversations(c.conversations || []);
      setIntake(i);
    });
  }, []);

  const initials = (user?.username || "U").slice(0, 2).toUpperCase();
  const themes = memory?.recurring_themes || [];
  const techniques = memory?.techniques_used || [];
  const turnCount = memory?.turn_count || 0;

  const greetName = (displayName || user?.username || "there").split("@")[0];

  return (
    <>
      <PageHero
        title={`Hi, ${greetName} 👋`}
        subtitle="Track your mental wellness journey, review your history, and see what you've accomplished so far."
        mascot="success"
      />
      <div className="profile-layout">
      <div className="profile-left">
        <div className="card">
          <div className="profile-header">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-avatar-edit" title="Change photo">✏️</div>
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <input
                    className="input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{ maxWidth: 200 }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => setEditing(false)}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setDisplayName(user?.username || ""); setEditing(false); }}>Cancel</button>
                </div>
              ) : (
                <div className="profile-name">{displayName || user?.username}</div>
              )}
              <div className="profile-email">{user?.email || "—"}</div>
              <div className="profile-tags" style={{ marginTop: 8 }}>
                <span className="badge badge-green">User</span>
                {themes.slice(0, 2).map((t) => (
                  <span key={t} className="badge badge-blue">{t}</span>
                ))}
              </div>
              {!editing && (
                <button className="btn btn-ghost btn-sm profile-edit-btn" onClick={() => setEditing(true)}>
                  ✏️ Edit
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="stats-row-mini">
          <div className="mini-stat">
            <div className="mini-stat-value">{conversations.length}</div>
            <div className="mini-stat-label">Sessions</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-value">{turnCount}</div>
            <div className="mini-stat-label">Exchanges</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-value">3</div>
            <div className="mini-stat-label">Lessons done</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-value">5🔥</div>
            <div className="mini-stat-label">Day streak</div>
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title">Personal Information</div>
            <button className="section-link">Edit</button>
          </div>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <div className="profile-info-label">Username</div>
              <div className="profile-info-value">{user?.username || "—"}</div>
            </div>
            <div className="profile-info-item">
              <div className="profile-info-label">Email</div>
              <div className="profile-info-value">{user?.email || "—"}</div>
            </div>
            <div className="profile-info-item">
              <div className="profile-info-label">Joined</div>
              <div className="profile-info-value">14/06/2026</div>
            </div>
            <div className="profile-info-item">
              <div className="profile-info-label">Role</div>
              <div className="profile-info-value">User</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title">Mental Health History</div>
          </div>
          <div className="history-list">
            {HISTORY_ITEMS.map((item, i) => (
              <div key={i} className="history-item">
                <div className="history-icon">{item.icon}</div>
                <div>
                  <div className="history-text">{item.text}</div>
                  <div className="history-date">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {intake && (
          <div className="card">
            <div className="section-header">
              <div className="section-title">Initial Intake Information</div>
            </div>
            <div style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.7, background: "var(--surface-2)", padding: 14, borderRadius: 10, border: "1px solid var(--line)" }}>
              {intake.summary || intake.raw_text || "No intake information available."}
            </div>
          </div>
        )}
      </div>

      <div className="profile-right">
        <MascotCard
          variant="success"
          title="You're doing great! 🌟"
          text="Every day you invest in your mental health is a small victory worth being proud of."
          size={72}
        />

        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Mood Snapshots</div>
          <div className="snapshot-grid">
            {SNAPSHOTS.map((s, i) => (
              <div key={i} className="snapshot-card">
                <div className="snapshot-emoji">{s.emoji}</div>
                <div className="snapshot-label">{s.label}</div>
                <div className="snapshot-date">{s.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>🧩 What AI Remembers About You</div>
          {themes.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Recurring Themes</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {themes.map((t) => (
                  <span key={t} className="badge badge-green">{t}</span>
                ))}
              </div>
            </div>
          )}
          {techniques.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Techniques Used</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {techniques.map((t) => (
                  <span key={t} className="badge badge-blue">{t}</span>
                ))}
              </div>
            </div>
          )}
          {themes.length === 0 && techniques.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 13, padding: "16px 0" }}>
              No data yet. Start chatting with AI! 💬
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>📊 Latest Screening Result</div>
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: "var(--success)" }}>6</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>/ 27 — PHQ-9</div>
            <div className="progress-bar" style={{ margin: "10px 0" }}>
              <div className="progress-fill" style={{ width: "22%" }} />
            </div>
            <div className="badge badge-green">Mild</div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 8 }}>Last: 15/06/2026</div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
