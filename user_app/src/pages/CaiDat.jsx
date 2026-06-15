import { useState } from "react";
import PageHero from "../components/PageHero.jsx";

function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <label className="toggle">
      <input type="checkbox" checked={on} onChange={() => setOn(!on)} />
      <div className="toggle-slider" />
    </label>
  );
}

const NOTIFICATIONS = [
  { label: "Daily learning reminder",     desc: "Reminds you to study every day",                  on: true },
  { label: "New resource updates",        desc: "When new articles or audio are available",        on: true },
  { label: "Periodic screening reminder", desc: "Reminder to complete PHQ-9 monthly",              on: false },
  { label: "Weekly email summary",        desc: "Weekly progress report sent to your email",       on: true },
  { label: "Push notifications",          desc: "Browser push notifications",                      on: false },
];

const PRIVACY = [
  { label: "Allow AI to learn from conversations", desc: "Helps AI improve support quality",                       on: true },
  { label: "Share anonymized data for research",   desc: "Contribute to improving community mental health",         on: false },
  { label: "Save mood history",                    desc: "Track your mental wellness progress over time",           on: true },
  { label: "Allow clinician to view chat history", desc: "An assigned clinician can review sessions to help you",   on: true },
];

const CONTACTS = [
  { icon: "📧", label: "Support email", value: "support@mindcareai.vn" },
  { icon: "📞", label: "Hotline",       value: "1800 599 920 (free)" },
  { icon: "💬", label: "Live chat",     value: "Mon – Fri, 8am – 5pm" },
  { icon: "📖", label: "FAQ & Help",    value: "help.mindcareai.vn" },
];

export default function CaiDat({ user, onLogout }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    username:   user?.username || "",
    email:      user?.email || "",
    phone:      "",
    gender:     "",
    dob:        "",
    occupation: "",
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <PageHero
        title="Settings"
        subtitle="Manage your account, security, notifications, and privacy preferences all in one place."
        mascot="master"
      />

      {saved && <div className="banner ok" style={{ marginBottom: 18 }}>✅ Changes saved successfully!</div>}

      <div className="settings-grid">
        {/* ── LEFT COLUMN ── */}
        <div className="settings-col">

          {/* Account */}
          <div className="card">
            <div className="settings-section-title">👤 Account</div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {(form.username || "U").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{form.username || "User"}</div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 8 }}>{form.email || "—"}</div>
                <button className="btn btn-ghost btn-sm">Upload photo</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field">
                <label>Username</label>
                <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Phone number</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+84..." />
              </div>
              <div className="field">
                <label>Gender</label>
                <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="field">
                <label>Date of birth</label>
                <input className="input" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              </div>
              <div className="field">
                <label>Occupation</label>
                <input className="input" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Student, office worker..." />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <div className="settings-section-title">🔒 Security</div>
            <div className="field">
              <label>Current password</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field">
                <label>New password</label>
                <input className="input" type="password" placeholder="••••••••" />
              </div>
              <div className="field">
                <label>Confirm new password</label>
                <input className="input" type="password" placeholder="••••••••" />
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginBottom: 16 }}>Update password</button>
            <div className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>Two-factor authentication (Email OTP)</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>Send an OTP code to your email at each sign-in</div>
              </div>
              <Toggle defaultOn={true} />
            </div>
          </div>

          {/* Language & appearance */}
          <div className="card">
            <div className="settings-section-title">🌐 Language & Timezone</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field">
                <label>Language</label>
                <select className="input">
                  <option>English</option>
                  <option>Tiếng Việt</option>
                </select>
              </div>
              <div className="field">
                <label>Timezone</label>
                <select className="input">
                  <option>Asia/Ho_Chi_Minh (GMT+7)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="settings-col">

          {/* Notifications */}
          <div className="card">
            <div className="settings-section-title">🔔 Notifications</div>
            {NOTIFICATIONS.map((item) => (
              <div key={item.label} className="toggle-wrap">
                <div className="toggle-info">
                  <div className="toggle-label">{item.label}</div>
                  <div className="toggle-desc">{item.desc}</div>
                </div>
                <Toggle defaultOn={item.on} />
              </div>
            ))}
          </div>

          {/* Privacy */}
          <div className="card">
            <div className="settings-section-title">🛡️ Privacy</div>
            {PRIVACY.map((item) => (
              <div key={item.label} className="toggle-wrap">
                <div className="toggle-info">
                  <div className="toggle-label">{item.label}</div>
                  <div className="toggle-desc">{item.desc}</div>
                </div>
                <Toggle defaultOn={item.on} />
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 4 }}>
              <button className="btn btn-ghost btn-sm">📥 Download my data</button>
              <button className="btn btn-danger btn-sm">🗑️ Delete chat history</button>
            </div>
          </div>

          {/* Contact & support */}
          <div className="card">
            <div className="settings-section-title">💬 Contact & Support</div>
            {CONTACTS.map((c) => (
              <div key={c.label} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ fontSize: 20, width: 28, textAlign: "center" }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.label}</div>
                  <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="card" style={{ borderColor: "#FAD1D1" }}>
            <div className="settings-section-title" style={{ color: "var(--danger)" }}>⚠️ Danger Zone</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Sign out of all devices</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>End all active sessions everywhere.</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={onLogout}>Sign out</button>
            </div>
            <div className="divider" />
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Delete account</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>
                Permanently delete your account and all data — chat history, AI memory, screening results, and profile.
              </div>
              <button className="btn btn-danger btn-sm">🗑️ Permanently delete account</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
