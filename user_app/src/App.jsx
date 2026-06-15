import { useState, useEffect } from "react";
import { getUser, clearSession, api } from "./api.js";
import Mascot from "./components/Mascot.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Consent from "./pages/Consent.jsx";
import Intake from "./pages/Intake.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Chat from "./pages/Chat.jsx";
import SangLoc from "./pages/SangLoc.jsx";
import HoSo from "./pages/HoSo.jsx";
import BaiHoc from "./pages/BaiHoc.jsx";
import TaiNguyen from "./pages/TaiNguyen.jsx";
import CaiDat from "./pages/CaiDat.jsx";

const NAV_ITEMS = [
  { id: "dashboard", icon: "🏠", label: "Home" },
  { id: "sangloc",   icon: "🛡️", label: "Screening" },
  { id: "chat",      icon: "💬", label: "AI Support" },
  { id: "baihoc",    icon: "📖", label: "Lessons" },
  { id: "tainguyen", icon: "🗂️", label: "Resources" },
  { id: "hoso",      icon: "👤", label: "Profile" },
  { id: "caidat",    icon: "⚙️",  label: "Settings" },
];

const TOPBAR_TABS = [
  { id: "dashboard", icon: "🏠", label: "Home" },
  { id: "baihoc",    icon: "📖", label: "Lessons" },
  { id: "tainguyen", icon: "🗂️", label: "Resources" },
  { id: "chat",      icon: "💬", label: "AI Support" },
];

function Topbar({ activePage, onNav, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user?.username ? user.username.slice(0, 1).toUpperCase() : "U";
  const displayName = user?.username
    ? user.username.split("@")[0]
    : "You";

  return (
    <header className="app-topbar">
      {/* Logo (aligned to sidebar width) */}
      <div className="topbar-logo-section">
        <div className="topbar-logo-icon">🌿</div>
        <span className="topbar-brand">MindCare AI</span>
      </div>

      {/* Center tabs — only on Home/Dashboard */}
      {activePage === "dashboard" && (
        <nav className="topbar-tabs">
          {TOPBAR_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`topbar-tab ${activePage === tab.id ? "active" : ""}`}
              onClick={() => onNav(tab.id)}
            >
              <span className="topbar-tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {/* Right: notification + user */}
      <div className="topbar-right">
        <button className="topbar-notif" title="Notifications">
          🔔
          <span className="topbar-notif-badge">3</span>
        </button>
        <div className="topbar-user-wrap">
          <button className="topbar-user-info" onClick={() => setMenuOpen((o) => !o)}>
            <div className="topbar-avatar">{initials}</div>
            <span className="topbar-username">{displayName}</span>
            <span className="topbar-caret">{menuOpen ? "▴" : "▾"}</span>
          </button>
          {menuOpen && (
            <>
              <div className="topbar-overlay" onClick={() => setMenuOpen(false)} />
              <div className="topbar-user-menu">
                <button className="user-menu-item" onClick={() => { setMenuOpen(false); onNav("hoso"); }}>
                  👤 Profile
                </button>
                <button className="user-menu-item" onClick={() => { setMenuOpen(false); onNav("caidat"); }}>
                  ⚙️ Settings
                </button>
                <div className="user-menu-divider" />
                <button className="user-menu-item user-menu-signout" onClick={() => { setMenuOpen(false); onLogout(); }}>
                  🚪 Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Sidebar({ activePage, onNav }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNav(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Bottom companion card */}
      <div className="sidebar-companion-card">
        <div className="sidebar-companion-title">You are not alone</div>
        <div className="sidebar-companion-text">
          MindCare AI is always here to listen and walk alongside you.
        </div>
        <div className="sidebar-companion-mascot">
          <Mascot variant="concerned" size={120} />
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState(getUser());
  const [stage, setStage] = useState("loading");
  const [activePage, setActivePage] = useState("dashboard");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!user) { setStage("landing"); return; }
    api.me()
      .then((m) => {
        if (m.consent_required) setStage("consent");
        else if (m.intake_required) setStage("intake");
        else setStage("app");
      })
      .catch(() => setStage("app"));
  }, [user]);

  function handleAuth(u) { setUser(u); setShowLogin(false); }

  function logout() {
    clearSession();
    setUser(null);
    setStage("landing");
    setShowLogin(false);
    setActivePage("dashboard");
  }

  if (stage === "landing" && !showLogin) return <Landing onSignIn={() => setShowLogin(true)} />;
  if (!user || showLogin) return <Login onAuth={handleAuth} onBack={() => setShowLogin(false)} />;
  if (stage === "loading") return null;
  if (stage === "consent") return <Consent onDone={() => setStage("intake")} />;
  if (stage === "intake")  return <Intake  onDone={() => setStage("app")} />;

  const pages = {
    dashboard: <Dashboard user={user} onNav={setActivePage} />,
    sangloc:   <SangLoc />,
    chat:      <Chat />,
    baihoc:    <BaiHoc />,
    hoso:      <HoSo user={user} />,
    tainguyen: <TaiNguyen />,
    caidat:    <CaiDat user={user} onLogout={logout} />,
  };

  const isChatPage = activePage === "chat";

  return (
    <div className="app-shell">
      <Topbar activePage={activePage} onNav={setActivePage} user={user} onLogout={logout} />

      <div className="app-body">
        <Sidebar activePage={activePage} onNav={setActivePage} />

        <div className={`main-content ${isChatPage ? "chat-mode" : ""}`}>
          {isChatPage ? (
            pages.chat
          ) : (
            <div className="page-content">
              {pages[activePage]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
