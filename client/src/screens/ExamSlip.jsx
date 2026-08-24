import ScreenHead from "../components/ScreenHead.jsx";
import Stamp from "../components/Stamp.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getExamSlip } from "../lib/api.js";
import { sampleMyTimetable } from "../lib/sampleData.js";

const fallback = {
  profile: { name: "ADEBAYO, F.", matricNo: "FUL/CSC/20/1234" },
  exams: sampleMyTimetable,
};

export default function ExamSlip() {
  const { data } = useApiData(getExamSlip, fallback);
  return (
    <div className="screen">
      <ScreenHead
        title="Exam Slip"
        sub="Your current examination venues and seat numbers."
        actions={<button className="btn btn-primary" onClick={() => window.print()}>⬇ Print slip</button>}
      />
      <div className="exam-slip">
        <div className="slip-head">
          <div><div className="s-title">Examination Slip</div><div className="s-sub">FUL-EVAS · 2025/2026 First Semester</div></div>
          <Stamp small lines={["FUL", "OK"]} />
        </div>
        <div className="slip-body">
          <div className="slip-rows">
            <div className="slip-row"><span className="k">Student</span><span className="v">{data.profile?.name || "—"}</span></div>
            <div className="slip-row"><span className="k">Matric No.</span><span className="v">{data.profile?.matricNo || "—"}</span></div>
          </div>
          <div className="card" style={{ marginTop: 18 }}>
            {data.exams.map((exam) => (
              <div className="slot-course" key={exam.code}>
                <div><div className="code">{exam.code}</div><div className="title">{exam.title}</div></div>
                <div style={{ textAlign: "right", fontSize: 12 }}>
                  <div>{exam.venue}</div><div>{exam.time}</div><strong>Seat {exam.seat || "TBA"}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
