import ScreenHead from "../components/ScreenHead.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getVenues, getCourses, getInvigilators } from "../lib/api.js";
import { sampleVenues, sampleCourses, sampleInvigilators } from "../lib/sampleData.js";

function Bar({ label, value, max, tone = "gold", suffix = "" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="bar-row">
      <div className="bar-row-label">{label}</div>
      <div className="bar-track">
        <div className={`bar-fill bar-${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="bar-row-value">{value}{suffix}</div>
    </div>
  );
}

export default function Analytics() {
  const { data: venues } = useApiData(getVenues, sampleVenues);
  const { data: courses } = useApiData(getCourses, sampleCourses);
  const { data: invigilators } = useApiData(getInvigilators, sampleInvigilators);

  const totalCapacity = venues.reduce((s, v) => s + (v.cap || 0), 0);
  const totalFilled = venues.reduce((s, v) => s + (v.used || 0), 0);
  const overallUtilisation = totalCapacity > 0 ? Math.round((totalFilled / totalCapacity) * 100) : 0;
  const fullVenues = venues.filter((v) => v.used >= v.cap).length;
  const emptyVenues = venues.filter((v) => v.used === 0).length;

  const byDept = {};
  courses.forEach((c) => {
    const key = c.dept || "Unassigned";
    byDept[key] = (byDept[key] || 0) + (c.students || 1);
  });
  const deptEntries = Object.entries(byDept).sort((a, b) => b[1] - a[1]);
  const maxDeptCount = Math.max(1, ...deptEntries.map(([, v]) => v));

  const venuesSorted = [...venues].sort((a, b) => (b.used / (b.cap || 1)) - (a.used / (a.cap || 1)));
  const maxCap = Math.max(1, ...venues.map((v) => v.cap || 0));

  const invigilatorLoad = venues.length > 0 && invigilators.length > 0
    ? (venues.length / invigilators.length).toFixed(1)
    : "—";

  return (
    <div className="screen">
      <ScreenHead
        title="Analytics"
        sub="How the current examination session is actually shaping up, at a glance."
      />

      <div className="grid grid-4">
        <div className="card stat-card"><div className="stat-label">Overall utilisation</div><div className="stat-value">{overallUtilisation}%</div><div className="stat-sub">{totalFilled.toLocaleString("en-US")} / {totalCapacity.toLocaleString("en-US")} seats filled</div></div>
        <div className="card stat-card"><div className="stat-label">Venues at full capacity</div><div className="stat-value" style={{ color: fullVenues > 0 ? "var(--warning)" : undefined }}>{fullVenues}</div><div className="stat-sub">of {venues.length} registered venues</div></div>
        <div className="card stat-card"><div className="stat-label">Venues with no allocation</div><div className="stat-value">{emptyVenues}</div><div className="stat-sub">not yet assigned a course</div></div>
        <div className="card stat-card"><div className="stat-label">Venues per invigilator</div><div className="stat-value">{invigilatorLoad}</div><div className="stat-sub">{invigilators.length} invigilators on staff</div></div>
      </div>

      <div className="section-title"><span className="eyebrow">Live</span> Venue utilisation, highest first</div>
      <div className="card">
        {venuesSorted.map((v) => (
          <Bar
            key={v.tag}
            label={v.name}
            value={v.used}
            max={maxCap}
            suffix={` / ${v.cap}`}
            tone={v.used >= v.cap ? "danger" : v.used === 0 ? "neutral" : "gold"}
          />
        ))}
      </div>

      <div className="section-title">Students registered by department</div>
      <div className="card">
        {deptEntries.length === 0 && <p className="empty-note">No course registrations yet.</p>}
        {deptEntries.map(([dept, count]) => (
          <Bar key={dept} label={dept} value={count} max={maxDeptCount} tone="ink" />
        ))}
      </div>
    </div>
  );
}
