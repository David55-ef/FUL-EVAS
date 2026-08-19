import ScreenHead from "../components/ScreenHead.jsx";
import VenueCard from "../components/VenueCard.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getAllocations } from "../lib/api.js";
import { sampleVenues } from "../lib/sampleData.js";

export default function Allocation() {
  const { data: venues } = useApiData(getAllocations, sampleVenues);

  return (
    <div className="screen">
      <ScreenHead
        title="Venue Allocation"
        sub="Students and invigilators assigned to venues for each scheduled examination."
        actions={<><button className="btn btn-ghost">Export CSV</button><button className="btn btn-gold">↻ Re-run allocation</button></>}
      />
      <div className="grid grid-2">
        {venues.map((v) => (
          <VenueCard
            key={v.tag}
            venue={v}
            footer={
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-soft)" }}>
                <span>Invigilators: {1 + Math.ceil(v.used / 120)}</span>
                <span>Mon 9:00–11:00 AM</span>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
