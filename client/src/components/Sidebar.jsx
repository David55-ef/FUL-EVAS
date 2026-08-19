import { useApp, NAV, ROLE_LABEL, ROLE_INITIAL } from "../context/AppContext.jsx";
import { IconLogo, NAV_ICONS } from "../lib/icons.jsx";

export default function Sidebar() {
  const { role, name, department, screen, setScreen, sidebarOpen, setSidebarOpen, logout } = useApp();

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-mark"><IconLogo /></div>
        <div className="brand-text">
          <div className="t1">FUL-EVAS</div>
          <div className="t2">Federal University Lokoja</div>
        </div>
      </div>

      {/* Identity is read-only here — it reflects the account this token was
          issued for and cannot be changed without signing out and back in
          as someone else. There is deliberately no way to switch role
          without a fresh login. */}
      <div className="identity-card">
        <div className="avatar">{ROLE_INITIAL[role]}</div>
        <div className="identity-text">
          <div className="identity-name">{name || ROLE_LABEL[role]}</div>
          <div className="identity-role">{ROLE_LABEL[role]}</div>
          {department && <div className="identity-dept">{department}</div>}
        </div>
      </div>

      <nav className="primary-nav">
        {NAV[role].map((item) => {
          const Icon = NAV_ICONS[item.id];
          return (
            <button
              key={item.id}
              className={`nav-item ${screen === item.id ? "active" : ""}`}
              onClick={() => { setScreen(item.id); setSidebarOpen(false); }}
            >
              {Icon && <Icon />}<span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="logout-btn" onClick={logout}>Sign out</button>
      <div className="nav-foot">2025/2026 Session · First Semester</div>
    </div>
  );
}
