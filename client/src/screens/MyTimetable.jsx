import ScreenHead from "../components/ScreenHead.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getMyTimetable } from "../lib/api.js";
import { useApp } from "../context/AppContext.jsx";

export default function MyTimetable() {
  const { data: timetable } = useApiData(getMyTimetable, []);
  const { openFindVenue } = useApp();
  return (
    <div className="screen">
      <ScreenHead title="My Timetable" sub="Your full personal examination schedule for First Semester." />
      <div className="card">
        {timetable.length === 0 && <p className="empty-note">No timetable has been published for this account yet.</p>}
        {timetable.map((it) => (
          <div className="timeline-slot" key={it.code}>
            <div className="slot-time">{it.time}</div>
            <div className="slot-courses">
              <button className="slot-course slot-course-button" onClick={() => openFindVenue(it.code)}>
                <div><div className="code">{it.code}</div><div className="title">{it.title}</div></div>
                <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-soft)" }}>
                  <div>{it.venue}</div><div>Seat {it.seat || "TBA"}</div><div>View venue</div>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
