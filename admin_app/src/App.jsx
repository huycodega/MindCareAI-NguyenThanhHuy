import { useState } from "react";
import { getUser, clearSession } from "./api.js";
import Login from "./pages/Login.jsx";
import LessonsAdmin from "./pages/LessonsAdmin.jsx";
import ResourcesAdmin from "./pages/ResourcesAdmin.jsx";

export default function App() {
  const [user, setUser] = useState(getUser());
  const [page, setPage] = useState("resources");

  function logout() { clearSession(); setUser(null); }

  // Only the implemented admin pages route; other nav items are visual.
  function navigate(id) {
    if (id === "lessons" || id === "resources") setPage(id);
  }

  if (!user) return <Login onAuth={setUser} />;
  if (page === "lessons") return <LessonsAdmin onLogout={logout} onNav={navigate} />;
  return <ResourcesAdmin onLogout={logout} onNav={navigate} />;
}
