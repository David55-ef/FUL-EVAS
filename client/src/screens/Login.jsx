import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { IconLogo } from "../lib/icons.jsx";
import CampusMap from "../components/CampusMap.jsx";
import { sampleVenues } from "../lib/sampleData.js";
import { login as apiLogin } from "../lib/api.js";
import { departmentFromMatric } from "../lib/department.js";

const ROLES = [
  { id: "admin", label: "Administrator" },
  { id: "officer", label: "Exam Officer" },
  { id: "invigilator", label: "Invigilator" },
  { id: "student", label: "Student" },
];

function seatPattern(n) {
  return Array.from({ length: n }, () => Math.random() > 0.4);
}

export default function Login({ onBack }) {
  const { enter, demoMode, showToast } = useApp();
  const [role, setRole] = useState("admin");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const seats = useRef(seatPattern(160));

  useEffect(() => {
    setId("");
    setPassword("");
    setError(null);
  }, [role]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await apiLogin(role, id, password);
      // Only a genuine, server-verified success reaches here — apiLogin
      // throws on any non-2xx response (wrong password, unknown account,
      // rate-limited, etc.), which the catch block below handles by
      // showing an error and NOT logging in. Nothing about entering the
      // app is decided by what's in this form.
      if (res?.token) localStorage.setItem("fulevas_token", res.token);
      enter({ role: res.role, name: res.name, department: res.department });
      if (res.role === "student" && res.department) {
        showToast(`Welcome, ${res.name || "student"} — you're registered under ${res.department}.`);
      }
    } catch (err) {
      setError(err.message || "Sign-in failed. Check your ID and password and try again.");
    } finally {
      setBusy(false);
    }
  }

  // Explicit, clearly-labelled fallback for when there is genuinely no
  // backend running (e.g. reviewing the UI without MongoDB set up). This
  // is a deliberate, visible action — never triggered automatically by a
  // rejected login — and every screen still shows a persistent "Demo data"
  // badge for as long as the session runs this way.
  function continueInDemoMode() {
    const department = role === "student" ? departmentFromMatric(id) || "Department not recognised" : null;
    enter({ role, name: id || ROLES.find((r) => r.id === role)?.label, department });
    if (role === "student") showToast(`Demo mode — department detected from matric: ${department}`);
  }

  return (
    <div className="login-wrap">
      {onBack && <button className="login-back" onClick={onBack}>← Back to site</button>}
      <div className="login-card">
        <div className="login-visual texture-dots">
          <div className="seat-grid" style={{ position: "absolute", inset: 0, opacity: 0.14, padding: 20, "--cols": 16 }}>
            {seats.current.map((f, i) => (<div key={i} className={`seat ${f ? "filled" : ""}`} />))}
          </div>
          <div className="map-accent"><CampusMap venues={sampleVenues} /></div>
          <div className="lv-top">
            <div className="brand">
              <div className="brand-mark"><IconLogo /></div>
              <div className="brand-text"><div className="t1" style={{ color: "#fff" }}>FUL-EVAS</div><div className="t2">Federal University Lokoja</div></div>
            </div>
            <h1>Every student,<br />the right seat,<br />the first time.</h1>
            <p>Venue registration, clash-free timetabling, and invigilator assignment for FUL examinations — handled in minutes, not days.</p>
          </div>
          <div className="lv-bottom">
            <p style={{ fontSize: 11, color: "#7F91B4" }}>Examination Venue Allocation System · React + Express + MongoDB build</p>
          </div>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <div className="sub">
            {role === "student"
              ? "Your department is detected automatically from your matric number once you sign in."
              : "Enter your staff credentials for this role."}
          </div>
          <div className="role-pick">
            {ROLES.map((r) => (
              <button type="button" key={r.id} className={role === r.id ? "selected" : ""} onClick={() => setRole(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
          <div className="field">
            <label>{role === "student" ? "Matriculation Number" : "Staff ID"}</label>
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder={role === "student" ? "e.g. FUL/CSC/20/1234" : "e.g. FUL/STAFF/0231"} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>

          {demoMode === true && (
            <>
              <div className="hint" style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 11.5 }}>
                No API server detected at this address.
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={continueInDemoMode}>
                Continue in demo mode instead (no login check)
              </button>
            </>
          )}
          {demoMode === false && (
            <div className="hint" style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 11.5 }}>
              Connected to the live API — credentials are checked for real.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
