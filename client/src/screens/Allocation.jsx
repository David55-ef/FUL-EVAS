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
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-soft)" }}>
                <span>Invigilators: {(v.sessions || []).reduce((sum, session) => sum + (session.invigilators || 0), 0)}</span>
                <span>{v.sessions?.[0]?.time || "No active session"}</span>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
