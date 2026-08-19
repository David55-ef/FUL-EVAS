import ScreenHead from "../components/ScreenHead.jsx";
import { IconUpload } from "../lib/icons.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getCourses } from "../lib/api.js";
import { sampleCourses } from "../lib/sampleData.js";
import { useApp } from "../context/AppContext.jsx";

export default function Courses() {
  const { data: courses } = useApiData(getCourses, sampleCourses);
  const { showToast } = useApp();

  return (
    <div className="screen">
      <ScreenHead title="Courses & Students" sub="Upload course lists and student course-registration data for the semester." />
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Bulk upload</h3>
          <div
            className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); showToast("File received (demo — wire to POST /courses/import)."); }}
          >
            <IconUpload />
            <div className="u-title">Drop course_registrations.csv here</div>
            <div className="u-sub">or click to browse — .csv, .xlsx up to 10MB</div>
          </div>
          <div className="hint" style={{ marginTop: 10 }}>148 courses and 15,204 registrations currently loaded for 2025/2026, First Semester.</div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Validation summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Rows processed</span><b className="mono">15,412</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Successfully imported</span><b className="mono" style={{ color: "var(--success)" }}>15,204</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Rejected — duplicate matric no.</span><b className="mono" style={{ color: "var(--danger)" }}>142</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Rejected — unknown course code</span><b className="mono" style={{ color: "var(--danger)" }}>66</b></div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>Download rejected rows</button>
        </div>
      </div>

      <div className="section-title">Courses this semester</div>
      <div className="table-wrap"><div className="table-scroll"><table>
        <thead><tr><th>Code</th><th>Title</th><th>Department</th><th>Registered students</th></tr></thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.code}>
              <td className="mono" style={{ fontWeight: 600, color: "var(--ink)" }}>{c.code}</td>
              <td>{c.title}</td><td>{c.dept}</td><td>{c.students}</td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );
}
