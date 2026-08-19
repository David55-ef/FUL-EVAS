export default function CampusMap({ venues, onPinClick, highlightTag }) {
  return (
    <svg className="campus-map" viewBox="0 0 700 720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#123A63" />
          <stop offset="100%" stopColor="#071A33" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="700" height="720" fill="url(#mapGlow)" />
      <path d="M0 170 Q210 60 700 200" stroke="#2A4E78" strokeWidth="10" fill="none" opacity="0.5" />
      <path d="M70 720 Q175 400 158 170" stroke="#2A4E78" strokeWidth="9" fill="none" opacity="0.5" />
      <path d="M700 400 Q455 430 368 620" stroke="#2A4E78" strokeWidth="9" fill="none" opacity="0.5" />
      <text x="30" y="45" fontFamily="IBM Plex Sans" fontSize="16" fill="#7F91B4" letterSpacing="0.06em">MAIN CAMPUS</text>
      <text x="670" y="45" fontFamily="IBM Plex Sans" fontSize="16" fill="#7F91B4" letterSpacing="0.06em" textAnchor="end">SCIENCE COMPLEX</text>
      <text x="30" y="695" fontFamily="IBM Plex Sans" fontSize="16" fill="#7F91B4" letterSpacing="0.06em">CBAS BUILDING</text>
      <text x="670" y="695" fontFamily="IBM Plex Sans" fontSize="16" fill="#7F91B4" letterSpacing="0.06em" textAnchor="end">FACULTY COMPLEXES</text>
      {venues.map((v) => (
        <g
          key={v.tag}
          className={`map-pin ${highlightTag === v.tag ? "active" : ""}`}
          onClick={() => onPinClick && onPinClick(v.tag)}
        >
          <title>{v.name} — {v.loc}</title>
          <circle className="pin-pulse" cx={v.mx} cy={v.my - 14} r="11" />
          <path className="pin-shape" d={`M${v.mx} ${v.my} c-14 -14 -22 -24 -22 -37 a22 22 0 1 1 44 0 c0 13 -8 23 -22 37 Z`} transform="translate(0,-22)" />
          <circle className="pin-dot" cx={v.mx} cy={v.my - 37} r="6" />
          <text className="pin-label" x={v.mx} y={v.my + 22} textAnchor="middle">{v.tag}</text>
        </g>
      ))}
    </svg>
  );
}
