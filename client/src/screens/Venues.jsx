import { useState } from "react";
import ScreenHead from "../components/ScreenHead.jsx";
import VenueCard from "../components/VenueCard.jsx";
import CampusMap from "../components/CampusMap.jsx";
import { useApiData } from "../lib/useApiData.js";
import { getVenues } from "../lib/api.js";
import { sampleVenues } from "../lib/sampleData.js";
import { useApp } from "../context/AppContext.jsx";

function domIdFor(tag) {
  return "venue-" + tag.replace(/[^a-zA-Z0-9]/g, "");
}

export default function Venues() {
  const { data: venues } = useApiData(getVenues, sampleVenues);
  const { showToast } = useApp();
  const [highlight, setHighlight] = useState(null);

  function focusVenue(tag) {
    setHighlight(tag);
    const el = document.getElementById(domIdFor(tag));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlight(null), 1400);
  }

  function handleSave(e) {
    e.preventDefault();
    showToast("Venue saved (demo — connect the API to persist).");
    e.target.reset();
  }

  return (
    <div className="screen">
      <ScreenHead
        title="Venues"
        sub="Register examination venues and track live seating capacity."
        actions={<button className="btn btn-primary">＋ Register venue</button>}
      />

      <div className="card campus-map-card">
        <div className="campus-map-head">
          <h3>Campus location map</h3>
          <span className="hint">Click a pin to jump to that venue</span>
        </div>
        <CampusMap venues={venues} onPinClick={focusVenue} highlightTag={highlight} />
      </div>

      <div className="section-title" style={{ marginTop: 26 }}>All registered venues</div>
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div>
          <div className="grid grid-2">
            {venues.map((v) => (
              <VenueCard
                key={v.tag}
                venue={v}
                domId={domIdFor(v.tag)}
                highlighted={highlight === v.tag}
                actions={<><button className="btn btn-ghost btn-sm">Edit</button><button className="btn btn-ghost btn-sm">Deactivate</button></>}
              />
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Register a new venue</h3>
          <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSave}>
            <div className="field"><label>Venue name</label><input placeholder="e.g. Faculty of Law Hall" required /></div>
            <div className="field"><label>Location</label><input placeholder="e.g. Law Complex, Block B" required /></div>
            <div className="field"><label>Seating capacity</label><input placeholder="e.g. 200" type="number" required /></div>
            <div className="field"><label>Status</label><select><option>Active</option><option>Inactive</option></select></div>
            <button className="btn btn-primary" style={{ justifyContent: "center" }} type="submit">Save venue</button>
          </form>
        </div>
      </div>
    </div>
  );
}
