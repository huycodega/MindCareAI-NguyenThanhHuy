import { useState, useEffect } from "react";
import { getUser, clearSession, api } from "./api.js";
import Login from "./pages/Login.jsx";
import Clinician from "./pages/Clinician.jsx";

function TopBar({ user, onLogout }) {
  return (
    <div className="topbar">
      <div className="brand">
        <span className="brand-dot" />CBT Clinician
        <small>Human-in-the-loop · clinical oversight</small>
      </div>
      {user && (
        <div className="who">
          <b>{user.username}</b>
          <button onClick={onLogout}>Sign out</button>
        </div>
      )}
    </div>
  );
}

function StatusBar({ health }) {
  if (!health) return null;
  const mock = health.mock_llm;
  return (
    <div className="status-bar">
      <span className="status-pill">
        <span className={`status-dot${mock ? " warn" : ""}`} />
        {mock ? "Mock mode (no GPU)" : "Live — Modal GPU"}
      </span>
      <span className="status-pill">
        🧠 {health.primary_responder || health.model_repo}
      </span>
      <span className="status-pill">
        🛡 {health.safety_gate}
      </span>
      {health.calibration?.loaded && (
        <span className="status-pill">
          T={health.calibration.global_temperature?.toFixed(2)}
        </span>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(getUser());
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => {});
  }, []);

  function logout() { clearSession(); setUser(null); }

  return (
    <>
      <TopBar user={user} onLogout={logout} />
      {user && <StatusBar health={health} />}
      {user ? <Clinician /> : <Login onAuth={setUser} />}
    </>
  );
}
