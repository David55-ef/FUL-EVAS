import { useRef, useState } from "react";
import ScreenHead from "../components/ScreenHead.jsx";
import VenueCard from "../components/VenueCard.jsx";
import CampusMap from "../components/CampusMap.jsx";
import { useApiData } from "../lib/useApiData.js";
import { createVenue, deactivateVenue, getVenues, updateVenue } from "../lib/api.js";
import { sampleVenues } from "../lib/sampleData.js";
import { useApp } from "../context/AppContext.jsx";

function domIdFor(tag) {
  return "venue-" + tag.replace(/[^a-zA-Z0-9]/g, "");
}

export default function Venues() {
  const { data: venues, refresh } = useApiData(getVenues, sampleVenues);
  const { showToast } = useApp();
  const [highlight, setHighlight] = useState(null);
  const [editing, setEditing] = useState(null);
  const [pendingDeactivate, setPendingDeactivate] = useState(null);
  const formCardRef = useRef(null);

  function focusVenue(tag) {
    setHighlight(tag);
    const el = document.getElementById(domIdFor(tag));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlight(null), 1400);
  }

  async function handleSave(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name").trim(),
      location: form.get("location").trim(),
      capacity: Number(form.get("capacity")),
      status: form.get("status"),
      tag: form.get("tag").trim() || undefined,
      images: form.get("images").split(/\r?\n|,/).map((image) => image.trim()).filter(Boolean),
    };
    try {
      if (editing?.id) {
        await updateVenue(editing.id, payload);
        showToast("Venue updated.");
      } else {
        await createVenue(payload);
        showToast("Venue registered.");
      }
      setEditing(null);
      await refresh();
    } catch (err) {
      showToast(err.message || "Could not save venue.");
    }
    e.target.reset();
  }

  async function confirmDeactivate() {
    if (!pendingDeactivate) return;
    try {
      await deactivateVenue(pendingDeactivate.id);
      showToast(`${pendingDeactivate.name} deactivated.`);
      setPendingDeactivate(null);
      await refresh();
    } catch (err) {
      showToast(err.message || "Could not deactivate venue.");
    }
  }

  function startRegistering() {
    setEditing(null);
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function startEditing(venue) {
    setEditing(venue);
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="screen">
      <ScreenHead
        title="Venues"
        sub="Register examination venues and track live seating capacity."
        actions={<button className="btn btn-primary" onClick={startRegistering}>＋ Register venue</button>}
      />

      <div className="card campus-map-card">
        <div className="campus-map-head">
          <h3>Campus location map</h3>
          <span className="hint">Click a pin to jump to that venue</span>
        </div>
        <CampusMap venues={venues} onPinClick={focusVenue} highlightTag={highlight} />
      </div>

      <div className="venue-form-band">
        <div className="card" ref={formCardRef}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>{editing ? "Edit venue" : "Register a new venue"}</h3>
          <form key={editing?.id || "new"} style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSave}>
            <div className="venue-form-grid">
              <div className="field"><label>Venue name</label><input name="name" defaultValue={editing?.name || ""} placeholder="e.g. Faculty of Law Hall" required /></div>
              <div className="field"><label>Location</label><input name="location" defaultValue={editing?.loc || ""} placeholder="e.g. Law Complex, Block B" required /></div>
              <div className="field"><label>Seating capacity</label><input name="capacity" defaultValue={editing?.cap || ""} placeholder="e.g. 200" type="number" min="1" required /></div>
              <div className="field"><label>Map tag</label><input name="tag" defaultValue={editing?.tag || ""} placeholder="e.g. LAW HALL" /></div>
              <div className="field"><label>Status</label><select name="status" defaultValue={editing?.status || "ACTIVE"}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
            </div>
            <div className="field">
              <label>Venue images</label>
              <textarea name="images" defaultValue={(editing?.images || []).join("\n")} placeholder="/venues/lt-a/lt-a-1.jpg&#10;https://example.com/hall-photo.jpg" rows="3" />
              <span className="hint">Paste one image path or URL per line. For demo, bundled paths from client/public work best.</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {editing && <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>Cancel</button>}
              <button className="btn btn-primary" style={{ justifyContent: "center", flex: 1 }} type="submit">Save venue</button>
            </div>
          </form>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 26 }}>All registered venues</div>
      <div className="grid grid-3">
        {venues.map((v) => (
          <VenueCard
            key={v.tag}
            venue={v}
            domId={domIdFor(v.tag)}
            highlighted={highlight === v.tag}
            actions={<><button className="btn btn-ghost btn-sm" onClick={() => startEditing(v)}>Edit</button><button className="btn btn-ghost btn-sm" onClick={() => setPendingDeactivate(v)}>Deactivate</button></>}
          />
        ))}
      </div>

      {pendingDeactivate && (
        <div className="modal-scrim" onClick={() => setPendingDeactivate(null)}>
          <div className="confirm-panel" onClick={(e) => e.stopPropagation()}>
            <h2>Deactivate venue?</h2>
            <p>{pendingDeactivate.name} will be hidden from future allocations, but the record stays in the system.</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setPendingDeactivate(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmDeactivate}>Deactivate venue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
