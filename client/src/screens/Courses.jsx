import { useRef, useState } from "react";
import ScreenHead from "../components/ScreenHead.jsx";
import { IconUpload } from "../lib/icons.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getCourses, importCourses } from "../lib/api.js";
import { sampleCourses } from "../lib/sampleData.js";
import { useApp } from "../context/AppContext.jsx";

export default function Courses() {
  const { data: courses, refresh } = useApiData(getCourses, sampleCourses);
  const { showToast } = useApp();
  const fileInput = useRef(null);
  const [summary, setSummary] = useState(null);

  function parseCsv(text) {
    const [headerLine, ...lines] = text.trim().split(/\r?\n/);
    const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
    return lines.filter(Boolean).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
      return {
        code: row.code || row.coursecode || row["course code"],
        title: row.title || row["course title"],
        department: row.department || row.dept,
        level: row.level ? Number(row.level) : undefined,
        durationMins: row.durationmins ? Number(row.durationmins) : undefined,
      };
    }).filter((row) => row.code && row.title);
  }

  async function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const coursesToImport = file.name.endsWith(".json") ? JSON.parse(text) : parseCsv(text);
      const result = await importCourses(Array.isArray(coursesToImport) ? coursesToImport : coursesToImport.courses);
      setSummary(result);
      await refresh();
      showToast(`Imported ${result.imported} course(s).`);
    } catch (err) {
      showToast(err.message || "Could not import that file.");
    }
  }

  return (
    <div className="screen">
      <ScreenHead title="Courses & Students" sub="Upload course lists and student course-registration data for the semester." />
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Bulk upload</h3>
          <div
            className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInput.current?.click()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            <IconUpload />
            <div className="u-title">Drop courses.csv here</div>
            <div className="u-sub">or click to browse — .csv or .json</div>
            <input ref={fileInput} type="file" accept=".csv,.json" hidden onChange={(e) => handleFiles(e.target.files)} />
          </div>
          <div className="hint" style={{ marginTop: 10 }}>{courses.length} courses currently loaded. Course registration rows are counted from the backend.</div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Validation summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Rows processed</span><b className="mono">{summary ? summary.imported + summary.rejected.length : "—"}</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Successfully imported</span><b className="mono" style={{ color: "var(--success)" }}>{summary?.imported ?? "—"}</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Rejected rows</span><b className="mono" style={{ color: "var(--danger)" }}>{summary?.rejected?.length ?? "—"}</b></div>
            <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{summary?.rejected?.[0]?.reason || "Import a CSV/JSON file to see validation details."}</div>
          </div>
        </div>
      </div>

      <div className="section-title">Courses this semester</div>
      <div className="table-wrap"><div className="table-scroll"><table>
        <thead><tr><th>Code</th><th>Title</th><th>Department</th><th>Level</th><th>Registered students</th></tr></thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.code}>
              <td className="mono" style={{ fontWeight: 600, color: "var(--ink)" }}>{c.code}</td>
              <td>{c.title}</td><td>{c.dept}</td><td>{c.level ? `${c.level}L` : "—"}</td><td>{c.students}</td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );
}
