import { useState } from "react";
import BuildingImage from "./BuildingImage.jsx";
import SeatGrid, { badgeForVenue } from "./SeatGrid.jsx";
import VenueDetailModal from "./VenueDetailModal.jsx";
import { IconPin } from "../lib/icons.jsx";

export default function VenueCard({ venue, actions, footer, domId, highlighted, badge }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`card venue-card ${highlighted ? "pin-target" : ""}`} id={domId}>
      <button className="venue-photo-trigger" onClick={() => setOpen(true)} aria-label={`View inside ${venue.name}`}>
        <BuildingImage venue={venue} tagLabel="View inside" />
      </button>
      <div className="v-head">
        <div>
          <div className="v-name">{venue.name}</div>
          <div className="pin-tag"><IconPin />{venue.loc}</div>
        </div>
        {badge || badgeForVenue(venue)}
      </div>
      <div className="capacity-row">
        <SeatGrid total={venue.cap} filled={venue.used} cols={14} />
        <div className="cap-label">{venue.used}/{venue.cap} seats</div>
      </div>
      {footer}
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
      {open && <VenueDetailModal venue={venue} onClose={() => setOpen(false)} />}
    </div>
  );
}
