import ScreenHead from "../components/ScreenHead.jsx";
import Stamp from "../components/Stamp.jsx";

const rows = [
  ["Student", "ADEBAYO, F."],
  ["Matric No.", "FUL/CSC/20/1234"],
  ["Course", "CSC406"],
  ["Venue", "SCI. AUD."],
  ["Date", "08-SEP-2026"],
  ["Time", "13:00–15:00"],
  ["Seat", "B-114"],
];

export default function ExamSlip() {
  return (
    <div className="screen">
      <ScreenHead
        title="Exam Slip"
        sub="Print or download your official examination slip for CSC406."
        actions={<button className="btn btn-primary" onClick={() => window.print()}>⬇ Download PDF</button>}
      />
      <div className="exam-slip">
        <div className="slip-head">
          <div><div className="s-title">Examination Slip</div><div className="s-sub">FUL-EVAS · 2025/2026 First Semester</div></div>
          <Stamp small lines={["FUL", "OK"]} />
        </div>
        <div className="slip-body">
          <div className="slip-rows">
            {rows.map(([k, v]) => (
              <div className="slip-row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
