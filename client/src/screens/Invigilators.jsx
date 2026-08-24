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
            <div className="field"><label>Temporary password</label><input name="password" type="password" minLength="8" required /></div>
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
