import ScreenHead from "../components/ScreenHead.jsx";
import { sampleMyTimetable } from "../lib/sampleData.js";
import { useApiData } from "../lib/useApiData.js";
import { getMyTimetable } from "../lib/api.js";

export default function MyTimetable() {
  const { data: timetable } = useApiData(getMyTimetable, sampleMyTimetable);
  return (
    <div className="screen">
      <ScreenHead title="My Timetable" sub="Your full personal examination schedule for First Semester." />
      <div className="card">
        {timetable.map((it) => (
          <div className="timeline-slot" key={it.code}>
            <div className="slot-time">{it.time}</div>
            <div className="slot-courses">
              <div className="slot-course">
                <div><div className="code">{it.code}</div><div className="title">{it.title}</div></div>
                <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-soft)" }}>
                  <div>{it.venue}</div><div>Seat {it.seat || "TBA"}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
