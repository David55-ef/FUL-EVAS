import ScreenHead from "../components/ScreenHead.jsx";
import VenueCard from "../components/VenueCard.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getMyAssignments } from "../lib/api.js";

export default function MyAssignments() {
  const { data: assignments } = useApiData(getMyAssignments, []);

  return (
    <div className="screen">
      <ScreenHead title="My Assignments" sub="Venues and examinations assigned to you this semester." />
      <div className="grid grid-2">
        {assignments.length === 0 && <p className="empty-note">No invigilation assignments have been published for you yet.</p>}
        {assignments.map((a) => (
          <VenueCard
            key={a.id}
            venue={{ name: a.venue, loc: `${a.loc} · ${a.course} · ${a.date} · ${a.time}`, art: a.art, tag: a.tag || a.course, cap: a.cap || a.studentCount || 1, used: a.used || a.studentCount || 0, images: a.images || [] }}
            badge={<span className="badge badge-success">Confirmed</span>}
            footer={<div style={{ fontSize: 12.5, color: "var(--text-soft)" }}>{a.studentCount} students · {a.coInvigilators?.length ? `with ${a.coInvigilators.join(", ")}` : "sole invigilator"}</div>}
            actions={<button className="btn btn-primary btn-sm" onClick={() => window.print()}>Print attendance sheet</button>}
          />
        ))}
      </div>
    </div>
  );
}
