import ScreenHead from "../components/ScreenHead.jsx";
import VenueCard from "../components/VenueCard.jsx";
import { useApiData } from "../lib/useApiData.js";
import { generateAllocation, getAllocationRecords, getAllocations } from "../lib/api.js";
import { sampleVenues } from "../lib/sampleData.js";
import { useApp } from "../context/AppContext.jsx";

function downloadCsv(filename, rows) {
  const headers = ["Course", "Title", "Venue", "Date", "Time", "Students", "Invigilators"];
  const body = rows.map((row) => [
    row.code, row.title, row.venue, row.date, row.time, row.students, row.invigilators,
  ].map((value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`).join(","));
  const blob = new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Allocation() {
  const { role, showToast } = useApp();
  const { data: venues, refresh } = useApiData(getAllocations, sampleVenues);

  async function handleRerun() {
    try {
      const result = await generateAllocation();
      await refresh();
      showToast(`Allocation done: ${result.studentsSeated} students seated.`);
    } catch (err) {
      showToast(err.message || "Could not rerun allocation.");
    }
  }

  async function handleExport() {
    try {
      const records = await getAllocationRecords();
      downloadCsv("ful-evas-allocation.csv", records);
      showToast(`Exported ${records.length} allocation rows.`);
    } catch (err) {
      showToast(err.message || "Could not export allocation CSV.");
    }
  }

  function venueSchedule(venue) {
    const sessions = venue.sessions || [];
    if (!sessions.length) return <div className="allocation-schedule-empty">No exam scheduled in this venue yet.</div>;
    return (
      <div className="allocation-schedule">
        {sessions.slice(0, 3).map((session) => (
          <div className="allocation-session" key={`${session.date}-${session.time}`}>
            <div>
              <strong>{session.date} · {session.time}</strong>
              {(session.allocations || []).map((allocation) => (
                <div className="allocation-line" key={allocation.id}>
                  <span>{allocation.code}</span>
                  <span>{allocation.students} students</span>
                  <span>{allocation.invigilatorCount} invigilator{allocation.invigilatorCount === 1 ? "" : "s"}</span>
                </div>
              ))}
            </div>
            <div className="allocation-staff">
              {(session.allocations || []).flatMap((allocation) => allocation.invigilators || []).join(", ") || "No invigilator assigned"}
            </div>
          </div>
        ))}
        {sessions.length > 3 && <div className="allocation-more">+{sessions.length - 3} more session{sessions.length - 3 === 1 ? "" : "s"}</div>}
      </div>
    );
  }

  return (
    <div className="screen">
      <ScreenHead
        title="Venue Allocation"
        sub="Students and invigilators assigned to venues for each scheduled examination."
        actions={<><button className="btn btn-ghost" onClick={handleExport}>Export CSV</button>{role === "admin" && <button className="btn btn-gold" onClick={handleRerun}>↻ Re-run allocation</button>}</>}
      />
      <div className="grid grid-2">
        {venues.length === 0 && <p className="empty-note">No venue allocation has been generated yet.</p>}
        {venues.map((v) => (
          <VenueCard
            key={v.tag}
            venue={v}
            footer={
              venueSchedule(v)
            }
          />
        ))}
      </div>
    </div>
  );
}
