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
        <div className="login-logo">👨‍⚕️</div>
        <div className="login-title">Clinician Dashboard</div>
        <p className="login-sub">
          Review AI-generated CBT responses, approve or edit drafts,
          and oversee patient safety flags — all in one place.
        </p>

        <form onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setU(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setP(e.target.value)} />
          </div>
          {err && <div className="banner crisis">{err}</div>}
          <button className="btn accent-login full" disabled={busy} style={{ marginTop: 4 }}>
            {busy ? <span className="spinner" /> : null}
            Sign in
          </button>
        </form>

        <div className="divider" />
        <div className="demo-hint">
          Demo: <strong>clinician</strong> / <strong>clinic123</strong>
        </div>
      </div>
    </div>
  );
}
