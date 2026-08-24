import ScreenHead from "../components/ScreenHead.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getAllocationRecords } from "../lib/api.js";

export default function PrintCenter() {
  const { data: rows } = useApiData(getAllocationRecords, []);
  const sets = rows.slice(0, 3).map((row) => ({
    title: `Print set - ${row.venue}`,
    sub: `${row.code} · ${row.when} · ${row.students} students`,
    preview: `${row.code}\n${row.venue}`,
  }));

  return (
    <div className="screen">
      <ScreenHead title="Print Center" sub="Generate print-ready venue lists, attendance sheets, and seating plans." />
      <div className="grid grid-3">
        {sets.length === 0 && <p className="empty-note">Run venue allocation first to create printable records.</p>}
        {sets.map((s) => (
          <div className="print-thumb" key={s.title}>
            <div className="p-preview">{s.preview}</div>
            <div className="p-title">{s.title}</div>
            <div className="p-sub">{s.sub}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Print</button>
          </div>
        ))}
      </div>
      <div className="section-title">All scheduled examinations</div>
      <div className="table-wrap"><div className="table-scroll"><table>
        <thead><tr><th>Course</th><th>Venue</th><th>Date / time</th><th>Students</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="mono">{r.code}</td><td>{r.venue}</td><td>{r.when}</td><td>{r.students}</td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Print set</button></td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );
}
