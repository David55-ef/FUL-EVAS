import ScreenHead from "../components/ScreenHead.jsx";
import VenueCard from "../components/VenueCard.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getVenues } from "../lib/api.js";
import { sampleVenues } from "../lib/sampleData.js";

export default function Overview() {
  const { data: venues } = useApiData(getVenues, sampleVenues);

  return (
    <div className="screen">
      <ScreenHead
        title="Overview"
        sub="Snapshot of the current examination session across all faculties."
        actions={<button className="btn btn-gold">＋ Generate timetable</button>}
      />
      <div className="grid grid-4">
        <div className="card stat-card"><div className="stat-label">Registered venues</div><div className="stat-value">{venues.length}</div><div className="stat-sub">3 faculties covered</div></div>
        <div className="card stat-card"><div className="stat-label">Courses this semester</div><div className="stat-value">148</div><div className="stat-sub up">▲ 6 added this week</div></div>
        <div className="card stat-card"><div className="stat-label">Students registered</div><div className="stat-value" style={{ fontFamily: "'Fraunces',serif" }}>15,204</div><div className="stat-sub">Across 42 departments</div></div>
        <div className="card stat-card"><div className="stat-label">Unresolved clashes</div><div className="stat-value" style={{ color: "var(--danger)" }}>1</div><div className="stat-sub warn">Needs manual review</div></div>
      </div>

      <div className="section-title"><span className="eyebrow">Live</span> Venue utilisation</div>
      <div className="grid grid-3">
        {venues.slice(0, 3).map((v) => (<VenueCard key={v.tag} venue={v} />))}
      </div>

      <div className="section-title">Recent activity</div>
      <div className="table-wrap"><div className="table-scroll"><table>
        <thead><tr><th>Action</th><th>By</th><th>When</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Uploaded student registrations — CSC406</td><td>Admin</td><td>2 hours ago</td><td><span className="badge badge-success">Completed</span></td></tr>
          <tr><td>Generated Semester 1 timetable</td><td>Admin</td><td>Yesterday</td><td><span className="badge badge-warn">1 clash flagged</span></td></tr>
          <tr><td>Registered venue — CBAS Lab Block Hall</td><td>Admin</td><td>3 days ago</td><td><span className="badge badge-success">Completed</span></td></tr>
        </tbody>
      </table></div></div>
    </div>
  );
}
