// Shared UI helpers for the admin console.

const AVATAR_COLORS = [
  "linear-gradient(135deg,#6366F1,#8B5CF6)",
  "linear-gradient(135deg,#16B981,#0EA5A5)",
  "linear-gradient(135deg,#F59E0B,#EF7C0B)",
  "linear-gradient(135deg,#EF4444,#EC4899)",
  "linear-gradient(135deg,#3B82F6,#06B6D4)",
  "linear-gradient(135deg,#8B5CF6,#D946EF)",
];

export function avatarColor(seed = "") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function initials(name = "") {
  const base = (name || "").split("@")[0];
  return (base.slice(0, 1) || "U").toUpperCase();
}

export function displayName(name = "") {
  return (name || "").split("@")[0] || "user";
}

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function timeAgo(iso) {
  if (!iso) return "never";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return fmtDate(iso);
}

const RISK_LABEL = { high: "High risk", elevated: "Elevated", moderate: "Moderate", low: "Low" };
const RISK_CLASS = { high: "red", elevated: "amber", moderate: "blue", low: "green" };

export function RiskPill({ risk }) {
  return (
    <span className={`pill ${RISK_CLASS[risk] || "gray"}`}>
      <span className="dot" />{RISK_LABEL[risk] || risk}
    </span>
  );
}

export function StatusPill({ status }) {
  const cls = status === "suspended" ? "red" : "green";
  const label = status === "suspended" ? "Suspended" : "Active";
  return <span className={`pill ${cls}`}><span className="dot" />{label}</span>;
}

export function Avatar({ name, size = 34, className = "cell-avatar" }) {
  return (
    <div className={className}
         style={{ background: avatarColor(name), width: size, height: size }}>
      {initials(name)}
    </div>
  );
}

export function StatCard({ icon, color, value, label }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export function Empty({ icon = "🌿", text }) {
  return <div className="empty"><div className="empty-mascot">{icon}</div>{text}</div>;
}
