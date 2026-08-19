import ScreenHead from "../components/ScreenHead.jsx";
import VenueCard from "../components/VenueCard.jsx";
import { sampleVenues } from "../lib/sampleData.js";

const assignments = [
  { venue: sampleVenues[0], meta: "Main Campus, Block C · MTH201 · Mon, 9:00 – 11:00 AM", note: "372 students · co-invigilating with Dr. K. Adeyemi" },
  { venue: sampleVenues[3], meta: "Arts Complex · CSC401 · Tue, 1:00 – 3:00 PM", note: "150 students · sole invigilator" },
];

export default function MyAssignments() {
  return (
    <div className="screen">
      <ScreenHead title="My Assignments" sub="Venues and examinations assigned to you this semester." />
      <div className="grid grid-2">
        {assignments.map((a) => (
          <VenueCard
            key={a.venue.tag}
            venue={{ ...a.venue, loc: a.meta }}
            badge={<span className="badge badge-success">Confirmed</span>}
            footer={<div style={{ fontSize: 12.5, color: "var(--text-soft)" }}>{a.note}</div>}
            actions={<button className="btn btn-primary btn-sm">Download attendance sheet</button>}
          />
        ))}
      </div>
    </div>
  );
}
