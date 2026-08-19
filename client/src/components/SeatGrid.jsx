export default function SeatGrid({ total, filled, cols }) {
  const c = cols || Math.min(20, Math.max(8, Math.round(Math.sqrt(total * 2))));
  const ratio = filled / total;
  const cls = ratio >= 1 ? "over" : ratio >= 0.9 ? "tight" : "";
  const seats = Array.from({ length: total }, (_, i) => i < filled);
  return (
    <div className="seat-grid" style={{ "--cols": c }}>
      {seats.map((f, i) => (
        <div key={i} className={`seat ${f ? "filled " + cls : ""}`} />
      ))}
    </div>
  );
}

export function badgeForVenue(v) {
  const ratio = v.used / v.cap;
  if (ratio > 1) return <span className="badge badge-danger">Over capacity</span>;
  if (ratio === 1) return <span className="badge badge-warn">Full</span>;
  if (ratio === 0) return <span className="badge badge-neutral">Unassigned</span>;
  return <span className="badge badge-success">Available</span>;
}
