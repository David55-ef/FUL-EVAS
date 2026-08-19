import { useState } from "react";
import SeatGrid, { badgeForVenue } from "./SeatGrid.jsx";
import { IconPin } from "../lib/icons.jsx";

export default function VenueDetailModal({ venue, onClose }) {
  const images = Array.isArray(venue.images) && venue.images.length > 0 ? venue.images : [];
  const [photoIdx, setPhotoIdx] = useState(0);
  const [tab, setTab] = useState("photos");

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{venue.name}</h2>
            <div className="pin-tag"><IconPin />{venue.loc}</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-tabs">
          <button className={tab === "photos" ? "active" : ""} onClick={() => setTab("photos")}>
            Photos {images.length > 0 && `(${images.length})`}
          </button>
          <button className={tab === "seating" ? "active" : ""} onClick={() => setTab("seating")}>
            Seating arrangement
          </button>
        </div>

        {tab === "photos" && (
          <div className="modal-gallery">
            {images.length > 0 ? (
              <>
                <div className="modal-gallery-main">
                  <img src={images[photoIdx]} alt={`${venue.name} — photo ${photoIdx + 1}`} />
                </div>
                {images.length > 1 && (
                  <div className="modal-gallery-thumbs">
                    {images.map((src, i) => (
                      <button
                        key={src}
                        className={i === photoIdx ? "active" : ""}
                        onClick={() => setPhotoIdx(i)}
                      >
                        <img src={src} alt={`Thumbnail ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="modal-gallery-empty">No photos on file for this venue yet.</div>
            )}
          </div>
        )}

        {tab === "seating" && (
          <div className="modal-seating">
            <div className="modal-seating-head">
              <div>
                <div className="modal-seating-cap">{venue.used}/{venue.cap} seats filled</div>
                <div className="modal-seating-sub">Each square is one seat — filled seats are currently allocated to a course.</div>
              </div>
              {badgeForVenue(venue)}
            </div>
            <div className="modal-seating-front">FRONT / EXAM FACILITATOR</div>
            <SeatGrid total={venue.cap} filled={venue.used} cols={Math.min(24, Math.max(10, Math.round(Math.sqrt(venue.cap * 2.4))))} />
          </div>
        )}
      </div>
    </div>
  );
}
