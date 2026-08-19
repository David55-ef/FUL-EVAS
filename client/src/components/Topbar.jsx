import { useApp, ROLE_LABEL, ROLE_INITIAL } from "../context/AppContext.jsx";

export default function Topbar() {
  const { role, department, sidebarOpen, setSidebarOpen, demoMode, logout } = useApp();

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span></span><span></span><span></span>
        </button>
        <div className="context-pill">📅 2025/2026 · <b>First Semester</b></div>
        {role === "student" && department && (
          <div className="context-pill" title="Detected automatically from your matriculation number">
            🎓 {department}
          </div>
        )}
        {demoMode === true && (
          <div className="context-pill" title="No API server detected — showing bundled sample data">
            🟡 Demo data (backend offline)
          </div>
        )}
        {demoMode === false && (
          <div className="context-pill" title="Connected to the live Express/MongoDB API">
            🟢 Live API
          </div>
        )}
      </div>
      <div className="topbar-right">
        <span className="role-switch-note">{ROLE_LABEL[role]} view</span>
        <div className="avatar">{ROLE_INITIAL[role]}</div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}
