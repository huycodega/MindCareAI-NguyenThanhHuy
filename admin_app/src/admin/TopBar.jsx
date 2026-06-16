import { useState } from "react";
import Icon from "./Icon.jsx";

export default function TopBar({ title, subtitle, searchPlaceholder, onLogout }) {
  const [menu, setMenu] = useState(false);
  return (
    <header className="la-topbar">
      <div className="la-topbar-title">
        <h1>{title}</h1>
        <span className="la-topbar-sub">{subtitle}</span>
      </div>

      <div className="la-search-wrap">
        <Icon name="search" size={17} className="la-search-icon" />
        <input className="la-search" placeholder={searchPlaceholder} />
      </div>

      <button className="la-btn-ghost"><Icon name="filter" size={16} /> Filters</button>

      <button className="la-icon-btn la-notif">
        <Icon name="bell" size={19} />
        <span className="la-notif-badge">8</span>
      </button>

      <div className="la-user-wrap">
        <button className="la-user" onClick={() => setMenu((m) => !m)}>
          <span className="la-avatar">A</span>
          <span className="la-user-text"><b>Admin</b><small>Administrator</small></span>
          <Icon name="chevronDown" size={15} />
        </button>
        {menu && (
          <>
            <div className="la-overlay" onClick={() => setMenu(false)} />
            <div className="la-user-menu"><button onClick={onLogout}>Sign out</button></div>
          </>
        )}
      </div>
    </header>
  );
}
