import ScreenHead from "../components/ScreenHead.jsx";
import { useApiData } from "../lib/useApiData.js";
import { generateTimetable, getTimetable } from "../lib/api.js";
import { sampleTimetable } from "../lib/sampleData.js";
import { useApp } from "../context/AppContext.jsx";

export default function Timetable() {
  const { showToast } = useApp();
  const { data: timetable, refresh } = useApiData(getTimetable, sampleTimetable);
  const clashCount = timetable.reduce((sum, slot) => sum + slot.items.filter((it) => it.clash).length, 0);

  async function handleRegenerate() {
    try {
      const result = await generateTimetable();
      await refresh();
      showToast(`Timetable regenerated: ${result.scheduled} courses scheduled.`);
    } catch (err) {
      showToast(err.message || "Could not regenerate timetable.");
    }
  }

  return (
    <div className="screen">
      <ScreenHead
        title="Timetable"
        sub="Automatically generated, clash-free examination schedule for First Semester."
        actions={<button className="btn btn-gold" onClick={handleRegenerate}>↻ Regenerate</button>}
      />
      {clashCount > 0 && (
        <div className="card" style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 12, background: "var(--danger-bg)", borderColor: "var(--danger)" }}>
          <span className="badge badge-danger">{clashCount} clash{clashCount === 1 ? "" : "es"} flagged</span>
          <span style={{ fontSize: 13, color: "var(--text)" }}>Review the highlighted courses before publishing the timetable.</span>
        </div>
      )}
      <div className="card">
        {timetable.length === 0 && <p className="empty-note">No timetable has been generated yet.</p>}
        {timetable.map((slot) => (
          <div className="timeline-slot" key={slot.time}>
            <div className="slot-time">{slot.time}</div>
            <div className="slot-courses">
              {slot.items.map((it) => (
                <div className={`slot-course ${it.clash ? "clash" : ""}`} key={it.code}>
                  <div><div className="code">{it.code}</div><div className="title">{it.title}</div></div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{it.venue}</div>
                    {it.clash
                      ? <span className="badge badge-danger" style={{ marginTop: 4 }}>Clash</span>
                      : <span className="badge badge-success" style={{ marginTop: 4 }}>Scheduled</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
