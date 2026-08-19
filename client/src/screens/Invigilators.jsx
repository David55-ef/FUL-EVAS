import ScreenHead from "../components/ScreenHead.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getInvigilators } from "../lib/api.js";
import { sampleInvigilators } from "../lib/sampleData.js";

export default function Invigilators() {
  const { data: invigilators } = useApiData(getInvigilators, sampleInvigilators);

  return (
    <div className="screen">
      <ScreenHead
        title="Invigilators"
        sub="Register academic and non-academic staff eligible to supervise examinations."
        actions={<button className="btn btn-primary">＋ Register invigilator</button>}
      />
      <div className="table-wrap"><div className="table-scroll"><table>
        <thead><tr><th>Staff ID</th><th>Name</th><th>Department</th><th>Assignments this week</th><th></th></tr></thead>
        <tbody>
          {invigilators.map((i, idx) => (
            <tr key={i.id}>
              <td className="mono">{i.id}</td><td>{i.name}</td><td>{i.dept}</td><td>{2 + idx}</td>
              <td><button className="btn btn-ghost btn-sm">View schedule</button></td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </div>
  );
}
