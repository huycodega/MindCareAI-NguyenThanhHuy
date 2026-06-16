import { useState } from "react";
import { api, setSession } from "../api.js";

export default function Login({ onAuth }) {
  const [username, setU] = useState("clinician");
  const [password, setP] = useState("clinic123");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await api.login(username, password);
      setSession(res.token, { username: res.username, role: res.role });
      onAuth({ username: res.username, role: res.role });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="admin-logo-icon">🌿</div>
          <div className="admin-logo-text" style={{ color: "var(--ink)" }}>
            MindCare AI<small style={{ color: "var(--ink-faint)" }}>Admin console</small>
          </div>
        </div>
        <div className="login-title">Welcome back</div>
        <p className="login-sub">
          Manage accounts, oversee crisis escalations, and review the
          human-in-the-loop case queue.
        </p>

        <form onSubmit={submit}>
          <label>Username or email</label>
          <input value={username} onChange={(e) => setU(e.target.value)} autoFocus />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setP(e.target.value)} />
          {err && <div className="login-error">{err}</div>}
          <button className="btn primary block" disabled={busy} style={{ marginTop: 18 }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
