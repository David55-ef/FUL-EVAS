import ScreenHead from "../components/ScreenHead.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getTimetable } from "../lib/api.js";
import { sampleTimetable } from "../lib/sampleData.js";

export default function Timetable() {
  const { data: timetable } = useApiData(getTimetable, sampleTimetable);
  const hasClash = timetable.some((slot) => slot.items.some((it) => it.clash));

  return (
    <div className="screen">
      <ScreenHead
        title="Timetable"
        sub="Automatically generated, clash-free examination schedule for First Semester."
        actions={<button className="btn btn-gold">↻ Regenerate</button>}
      />
      {hasClash && (
        <div className="card" style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 12, background: "var(--danger-bg)", borderColor: "var(--danger)" }}>
          <span className="badge badge-danger">1 clash flagged</span>
          <span style={{ fontSize: 13, color: "var(--text)" }}>ENG101 shares students with a course already scheduled in this slot — resolve manually before publishing.</span>
        </div>
      )}
      <div className="card">
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
