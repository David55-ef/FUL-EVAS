import { useState } from "react";
import ScreenHead from "../components/ScreenHead.jsx";
import { useApiData } from "../lib/useApiData.js";
import { createInvigilator, getInvigilatorAssignments, getInvigilators } from "../lib/api.js";
import { sampleInvigilators } from "../lib/sampleData.js";
import { useApp } from "../context/AppContext.jsx";

export default function Invigilators() {
  const { showToast } = useApp();
  const { data: invigilators, refresh } = useApiData(getInvigilators, sampleInvigilators);
  const [schedule, setSchedule] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await createInvigilator({
        staffId: form.get("staffId").trim(),
        name: form.get("name").trim(),
        department: form.get("department").trim(),
        contact: form.get("contact").trim(),
        password: form.get("password"),
      });
      e.currentTarget.reset();
      setShowPassword(false);
      await refresh();
      showToast("Invigilator registered.");
    } catch (err) {
      showToast(err.message || "Could not register invigilator.");
    }
  }

  async function handleSchedule(staff) {
    try {
      const assignments = await getInvigilatorAssignments(staff._id);
      setSchedule({ staff, assignments });
    } catch (err) {
      showToast(err.message || "Could not load schedule.");
    }
  }

  return (
    <div className="screen">
      <ScreenHead
        title="Invigilators"
        sub="Register academic and non-academic staff eligible to supervise examinations."
      />
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="table-wrap"><div className="table-scroll"><table>
          <thead><tr><th>Staff ID</th><th>Name</th><th>Department</th><th></th></tr></thead>
          <tbody>
            {invigilators.map((i) => (
              <tr key={i.id}>
                <td className="mono">{i.id}</td><td>{i.name}</td><td>{i.dept}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => handleSchedule(i)}>View schedule</button></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
        <div className="card">
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Register invigilator</h3>
          <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleRegister}>
            <div className="field"><label>Staff ID</label><input name="staffId" placeholder="FUL/STAFF/0001" required /></div>
            <div className="field"><label>Name</label><input name="name" placeholder="Dr. Example Name" required /></div>
            <div className="field"><label>Department</label><input name="department" placeholder="Computer Science" /></div>
            <div className="field"><label>Contact</label><input name="contact" placeholder="email or phone" /></div>
            <div className="field">
              <label>Temporary password</label>
              <div className="password-input">
                <input name="password" type={showPassword ? "text" : "password"} minLength="8" required />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.3A10.8 10.8 0 0112 4c5.5 0 9 5 9 5a15.8 15.8 0 01-3.1 3.5M6.6 6.6C4.3 8.1 3 10 3 10s3.5 5 9 5a10.4 10.4 0 004.1-.8" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" /><circle cx="12" cy="12" r="2.5" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit">Save invigilator</button>
          </form>
        </div>
      </div>
      {schedule && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="screen-head" style={{ marginBottom: 8 }}>
            <div><h1 style={{ fontSize: 18 }}>{schedule.staff.name}</h1><p>{schedule.staff.id} schedule</p></div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSchedule(null)}>Close</button>
          </div>
          {schedule.assignments.length === 0 && <p className="empty-note">No assignments yet.</p>}
          {schedule.assignments.map((item) => (
            <div className="slot-course" key={item.id}>
              <div><div className="code">{item.course}</div><div className="title">{item.title}</div></div>
              <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-soft)" }}>{item.venue}<br />{item.date} · {item.time}<br />{item.students} students</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
