import { useState } from "react";
import BuildingImage from "../components/BuildingImage.jsx";
import Stamp from "../components/Stamp.jsx";
import { IconPin } from "../lib/icons.jsx";
import { searchPublicVenue, searchVenue, isBackendUp } from "../lib/api.js";
import { sampleSearchResult } from "../lib/sampleData.js";
import { useApp } from "../context/AppContext.jsx";

export default function FindVenue() {
  const [query, setQuery] = useState("CSC406");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);
  const { loggedIn } = useApp();

  async function handleSearch(e) {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setResult(null);
    try {
      const res = loggedIn ? await searchVenue(query) : await searchPublicVenue(query);
      setResult(res);
    } catch (err) {
      // Backend reachable but the search itself failed (not found, bad
      // input, etc.) — show the real reason instead of faking a result.
      // Only fall back to demo data when the backend can't be reached at all.
      if (await isBackendUp()) {
        setError(err.message || "No venue found for that query.");
      } else {
        setResult(sampleSearchResult);
      }
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="screen">
      <div className="search-hero texture-dots">
        <h1>Find your examination venue</h1>
        <p>{loggedIn ? "Enter one of your course codes to see your exact venue and seat." : "Enter a course code or matric number to check a published exam venue."}</p>
        <form className="search-box" onSubmit={handleSearch}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. CSC406" />
          <button className="btn btn-gold" type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button>
        </form>
        {error && <div className="search-error">{error}</div>}
      </div>

      {result && (
        <div className="result-card">
          <div className="result-media">
            <BuildingImage venue={{ tag: result.code, name: result.venue, art: result.venueArt || "sci" }} />
            <div className="pin-tag" style={{ marginTop: 8 }}><IconPin />{result.venueLoc || "Science Complex, FUL"}</div>
          </div>
          <div>
            <div className="r-course">{result.code}</div>
            <h2>{result.title}</h2>
            <div className="result-grid">
              <div className="result-item"><div className="r-label">Venue</div><div className="r-value">{result.venue}</div></div>
              <div className="result-item"><div className="r-label">Date</div><div className="r-value">{result.date}</div></div>
              <div className="result-item"><div className="r-label">Time</div><div className="r-value">{result.time}</div></div>
            </div>
          </div>
          <Stamp lines={["FUL·EVAS", "Confirmed", `Seat ${result.seat}`]} />
        </div>
      )}
    </div>
  );
}
