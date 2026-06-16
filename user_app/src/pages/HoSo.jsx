import { useState, useEffect } from "react";
import { api } from "../api.js";
import Mascot from "../components/Mascot.jsx";

const RECENT_ACTIVITIES = [
  { icon: "✓", title: "Completed Screening", detail: "Reviewed your latest wellness check", time: "14/06/2026 · 09:24", tone: "green" },
  { icon: "📖", title: "Finished Lesson", detail: "Calm thinking practice", time: "13/06/2026 · 20:15", tone: "orange" },
  { icon: "💬", title: "AI Support Conversation", detail: "Talked about exam stress", time: "13/06/2026 · 19:02", tone: "purple" },
  { icon: "↓", title: "Downloaded Resource", detail: "Breathing guide 4-7-8", time: "12/06/2026 · 16:48", tone: "blue" },
  { icon: "★", title: "Earned Achievement", detail: "7-day learning streak", time: "12/06/2026 · 08:30", tone: "gold" },
];

const CONSENT_ITEMS = [
  "I agree to MindCare AI storing my data to personalize my experience.",
  "I agree to receive emails about lessons and wellness programs.",
  "I understand how my data is used for support purposes.",
];

function FieldItem({ icon, label, value }) {
  return (
    <div className="profile-field-item">
      <div className="profile-field-icon">{icon}</div>
      <div>
        <div className="profile-field-label">{label}</div>
        <div className="profile-field-value">{value || "—"}</div>
      </div>
    </div>
  );
}

function EditButton({ children = "Edit" }) {
  return (
    <button className="profile-edit-action" type="button">
      <span>✎</span>
      {children}
    </button>
  );
}

function ProgressCard({ icon, value, label, meta, accent = "green" }) {
  return (
    <div className={`progress-snapshot-card ${accent}`}>
      <div className="progress-snapshot-icon">{icon}</div>
      <div className="progress-snapshot-copy">
        <div className="progress-snapshot-value">{value}</div>
        <div className="progress-snapshot-label">{label}</div>
        <div className="progress-snapshot-meta">{meta}</div>
      </div>
    </div>
  );
}

function RecentActivityItem({ item }) {
  return (
    <div className="recent-activity-item">
      <div className={`recent-activity-icon ${item.tone}`}>{item.icon}</div>
      <div className="recent-activity-line" />
      <div className="recent-activity-copy">
        <div className="recent-activity-title">{item.title}</div>
        <div className="recent-activity-detail">{item.detail}</div>
        <div className="recent-activity-time">{item.time}</div>
      </div>
    </div>
  );
}

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

  const userName = (displayName || user?.username || "there").split("@")[0];
  const initials = userName.slice(0, 2).toUpperCase();
  const turnCount = memory?.turn_count || 0;
  const fullName = displayName || user?.username || "MindCare User";
  const email = user?.email || (user?.username?.includes("@") ? user.username : "user@example.com");
  const ageGroup = intake?.demographics?.age || intake?.age_group || "18-24";
  const gender = intake?.demographics?.gender || intake?.gender || "Prefer not to say";

  return (
    <div className="profile-page-v2">
      <header className="profile-page-header">
        <div>
          <h1>Your Profile</h1>
          <p>Manage your personal information and track your mental wellness journey.</p>
        </div>
      </header>

      <div className="profile-dashboard-grid">
        <main className="profile-main-column">
          <section className="profile-card profile-identity-card">
            <div className="profile-avatar-wrap large">
              <div className="profile-avatar">{initials}</div>
              <button className="profile-avatar-camera" type="button" aria-label="Change profile photo">⌕</button>
            </div>

            <div className="profile-identity-content">
              <div className="profile-identity-topline">
                <div>
                  {editing ? (
                    <div className="profile-name-editor">
                      <input
                        className="input"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        aria-label="Display name"
                      />
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => setEditing(false)}>Save</button>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={() => {
                          setDisplayName(user?.username || "");
                          setEditing(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <h2>Hello, {userName}! 👋</h2>
                  )}
                  <p>MindCare AI is here to support your mental wellness every day.</p>
                </div>
                {!editing && <button className="btn btn-ghost" type="button" onClick={() => setEditing(true)}>✎ Edit Profile</button>}
              </div>

              <div className="profile-info-panel">
                <FieldItem icon="👤" label="Full Name" value={fullName} />
                <FieldItem icon="☎" label="Phone Number" value="0901 234 567" />
                <FieldItem icon="✉" label="Email" value={email} />
                <FieldItem icon="📅" label="Date of Birth" value="12/06/2003" />
                <FieldItem icon="⚥" label="Gender" value={gender} />
                <FieldItem icon="◌" label="Age Group" value={ageGroup} />
              </div>
            </div>
          </section>

          <section className="profile-card profile-detail-section">
            <div className="profile-section-heading">
              <div>
                <span className="profile-section-kicker">Safety network</span>
                <h3>Emergency Contact</h3>
              </div>
              <EditButton />
            </div>
            <div className="emergency-contact-grid">
              <FieldItem icon="👥" label="Contact Name" value="Nguyen Van Nam" />
              <FieldItem icon="♡" label="Relationship" value="Father" />
              <FieldItem icon="☎" label="Phone Number" value="0909 876 543" />
            </div>
          </section>

          <section className="profile-card profile-detail-section">
            <div className="profile-section-heading">
              <div>
                <span className="profile-section-kicker">Personal focus</span>
                <h3>Mental Wellness Goal</h3>
              </div>
              <EditButton />
            </div>
            <p className="wellness-goal-text">
              Reduce stress, improve sleep quality, and maintain emotional balance.
            </p>
          </section>

          <section className="profile-card profile-consent-card">
            <div className="profile-section-heading">
              <div>
                <span className="profile-section-kicker">Data choices</span>
                <h3>Privacy &amp; Consent</h3>
              </div>
            </div>
            <div className="consent-content-grid">
              <div className="consent-checklist">
                {CONSENT_ITEMS.map((item) => (
                  <div className="consent-check-item" key={item}>
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                ))}
                <div className="profile-policy-links">
                  <a href="#privacy">Privacy Policy</a>
                  <a href="#terms">Terms of Service</a>
                </div>
              </div>
              <div className="consent-status-panel">
                <div className="consent-status-row">
                  <span>Consent Status</span>
                  <strong>Agreed</strong>
                </div>
                <div className="consent-status-row">
                  <span>Last Updated Date</span>
                  <strong>14/06/2026</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-card progress-snapshot-section">
            <div className="profile-section-heading compact">
              <div>
                <h3>Progress Snapshot</h3>
                <p>A quick view of your mental wellness journey.</p>
              </div>
            </div>
            <div className="progress-snapshot-grid">
              <ProgressCard icon="✓" value="8" label="Screenings Completed" meta="Last completed: 14/06/2026" />
              <ProgressCard icon="🔥" value="5" label="Learning Streak" meta="Small steps, steady rhythm" accent="orange" />
              <ProgressCard icon="💬" value={conversations.length || turnCount} label="AI Support Sessions" meta="Support is always available" accent="blue" />
              <ProgressCard icon="📁" value="12" label="Resources Accessed" meta="Helpful tools saved" accent="mint" />
            </div>
          </section>
        </main>

        <aside className="profile-sidebar-column">
          <section className="profile-card profile-motivation-card">
            <Mascot variant="success" size={180} />
            <h3>You're doing great! 💚</h3>
            <p>Keep taking small steps toward better mental wellness.</p>
            <button className="btn btn-primary btn-full" type="button">Start Today's Journey</button>
          </section>

          <section className="profile-card recent-activity-card">
            <div className="profile-section-heading compact">
              <h3>Recent Activity</h3>
            </div>
            <div className="recent-activity-list">
              {RECENT_ACTIVITIES.map((item) => (
                <RecentActivityItem item={item} key={item.title} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
