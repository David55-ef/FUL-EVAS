import { useEffect, useState } from "react";
import { VenueArt } from "../lib/venueArt.jsx";
import { fetchVenueImage } from "../lib/api.js";

const imageCache = new Map();

export default function BuildingImage({ venue, tagLabel }) {
  // Real campus photos (venue.images, seeded from client/public/venues/)
  // take priority — they're the actual building, load instantly with no
  // API call, and never hit a quota. Google Custom Search is only a
  // fallback for venues that don't have a real photo on file yet.
  const hasRealPhoto = Array.isArray(venue.images) && venue.images.length > 0;

  const [state, setState] = useState(() => {
    if (hasRealPhoto) return { status: "done", url: venue.images[0], source: "real" };
    return imageCache.has(venue.tag)
      ? { status: "done", url: imageCache.get(venue.tag), source: "search" }
      : { status: "loading", url: null, source: "search" };
  });

  useEffect(() => {
    if (hasRealPhoto) {
      setState({ status: "done", url: venue.images[0], source: "real" });
      return;
    }
    let cancelled = false;
    if (imageCache.has(venue.tag)) return;

    fetchVenueImage(venue.name)
      .then((res) => {
        if (cancelled) return;
        const url = res && res.imageUrl ? res.imageUrl : null;
        imageCache.set(venue.tag, url);
        setState({ status: "done", url, source: "search" });
      })
      .catch(() => {
        if (cancelled) return;
        imageCache.set(venue.tag, null);
        setState({ status: "done", url: null, source: "search" });
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue.tag, hasRealPhoto]);

  return (
    <div className="venue-photo">
      {state.status === "loading" && <div className="vp-skel" />}
      {state.status === "done" && state.url && (
        <>
          <img
            src={state.url}
            alt={venue.name}
            loading="lazy"
            onError={() => setState({ status: "done", url: null, source: state.source })}
          />
          {state.source === "search" && <span className="vp-source">Google Images</span>}
        </>
      )}
      {state.status === "done" && !state.url && <VenueArt artKey={venue.art} />}
      {tagLabel && <span className="vp-tag">{tagLabel}</span>}
    </div>
  );
}
