import ScreenHead from "../components/ScreenHead.jsx";

const sets = [
  { title: "Venue list — NLT", sub: "MTH201 · Mon 9:00 AM · 372 students", preview: "Venue list preview" },
  { title: "Attendance sheet — OLT1", sub: "CHM202 · Mon 9:00 AM · 176 students", preview: "Attendance sheet preview" },
  { title: "Seating plan — Science Aud.", sub: "CSC406 · Mon 1:00 PM · 214 students", preview: "Seating plan preview" },
];

const rows = [
  { code: "MTH201", venue: "New Lecture Theatre (NLT)", when: "Mon, 9:00 AM", students: 372 },
  { code: "CHM202", venue: "Old Lecture Theatre 1", when: "Mon, 9:00 AM", students: 176 },
  { code: "CSC406", venue: "Faculty of Science Auditorium", when: "Mon, 1:00 PM", students: 214 },
];

export default function PrintCenter() {
  return (
    <div className="screen">
      <ScreenHead title="Print Center" sub="Generate print-ready venue lists, attendance sheets, and seating plans." />
      <div className="grid grid-3">
        {sets.map((s) => (
          <div className="print-thumb" key={s.title}>
            <div className="p-preview">{s.preview}</div>
            <div className="p-title">{s.title}</div>
            <div className="p-sub">{s.sub}</div>
            <button className="btn btn-ghost btn-sm">Print</button>
          </div>
        ))}
      </div>
      <div className="section-title">All scheduled examinations</div>
      <div className="table-wrap"><div className="table-scroll"><table>
        <thead><tr><th>Course</th><th>Venue</th><th>Date / time</th><th>Students</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <td className="mono">{r.code}</td><td>{r.venue}</td><td>{r.when}</td><td>{r.students}</td>
              <td><button className="btn btn-ghost btn-sm">Print set</button></td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );
}
