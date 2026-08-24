import ScreenHead from "../components/ScreenHead.jsx";
import VenueCard from "../components/VenueCard.jsx";
import { useApiData } from "../lib/useApiData.js";
import { generateAllocation, generateTimetable, getAllocations, getCourses, getInvigilators } from "../lib/api.js";
import { sampleCourses, sampleInvigilators, sampleVenues } from "../lib/sampleData.js";
import { useApp } from "../context/AppContext.jsx";

export default function Overview() {
  const { showToast, setScreen } = useApp();
  const { data: venues, refresh } = useApiData(getAllocations, sampleVenues);
  const { data: courses } = useApiData(getCourses, sampleCourses);
  const { data: invigilators } = useApiData(getInvigilators, sampleInvigilators);
  const registrations = courses.reduce((sum, course) => sum + (course.students || 0), 0);
  const clashes = venues.reduce((sum, venue) => sum + (venue.sessions || []).filter((session) => session.courses?.length > 1 && session.used > venue.cap).length, 0);

  async function handleGenerate() {
    try {
      const timetable = await generateTimetable();
      const allocation = await generateAllocation();
      await refresh();
      showToast(`Timetable ready: ${timetable.scheduled} courses, ${allocation.studentsSeated} seats assigned.`);
    } catch (err) {
      showToast(err.message || "Could not generate timetable yet.");
    }
  }

  return (
    <div className="screen">
      <ScreenHead
        title="Overview"
        sub="Snapshot of the current examination session across all faculties."
        actions={<button className="btn btn-gold" onClick={handleGenerate}>＋ Generate timetable</button>}
      />
      <div className="grid grid-4">
        <div className="card stat-card"><div className="stat-label">Registered venues</div><div className="stat-value">{venues.length}</div><div className="stat-sub">{venues.filter((v) => v.status !== "INACTIVE").length} active venues</div></div>
        <div className="card stat-card"><div className="stat-label">Courses loaded</div><div className="stat-value">{courses.length}</div><div className="stat-sub">Current database records</div></div>
        <div className="card stat-card"><div className="stat-label">Course registrations</div><div className="stat-value" style={{ fontFamily: "'Fraunces',serif" }}>{registrations.toLocaleString("en-US")}</div><div className="stat-sub">Counted from course registrations</div></div>
        <div className="card stat-card"><div className="stat-label">Invigilators</div><div className="stat-value">{invigilators.length}</div><div className="stat-sub">{clashes ? `${clashes} capacity issue(s)` : "No capacity issue from allocations"}</div></div>
      </div>

      <div className="section-title"><span className="eyebrow">Live</span> Venue utilisation</div>
      <div className="grid grid-3">
        {venues.slice(0, 3).map((v) => (<VenueCard key={v.tag} venue={v} />))}
      </div>

      <div className="section-title">Recent activity</div>
      <div className="table-wrap"><div className="table-scroll"><table>
        <thead><tr><th>Action</th><th>By</th><th>When</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Venue allocation data</td><td>System</td><td>Now</td><td><span className="badge badge-success">{venues.some((v) => v.used > 0) ? "Available" : "Not generated yet"}</span></td></tr>
          <tr><td>Course registration data</td><td>System</td><td>Now</td><td><span className="badge badge-success">{registrations.toLocaleString("en-US")} rows counted</span></td></tr>
          <tr><td>Review full allocation</td><td>Admin</td><td>Next</td><td><button className="btn btn-ghost btn-sm" onClick={() => setScreen("allocation")}>Open allocation</button></td></tr>
        </tbody>
      </table></div></div>
    </div>
  );
}
