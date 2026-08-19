const Tree = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x="-2" y="0" width="4" height="14" fill="#8F7A4E" />
    <circle cx="0" cy="-6" r="12" fill="#0B2545" opacity="0.55" />
  </g>
);

const Scene = ({ children }) => (
  <svg viewBox="0 0 300 140" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <circle className="vp-sun" cx="258" cy="26" r="14" />
    <path d="M0 118 Q40 108 90 116 T190 114 T300 118 V140 H0 Z" fill="#DCCE9F" opacity="0.6" />
    {children}
    <path d="M0 128 H300 V140 H0 Z" fill="#C9BD8E" opacity="0.55" />
  </svg>
);

export const VenueArtNLT = () => (
  <Scene>
    <rect x="55" y="70" width="150" height="58" fill="#0B2545" />
    <path d="M75 70 V40 A55 55 0 0 1 185 40 V70 Z" fill="#10345C" stroke="#C9A227" strokeWidth="2" />
    <line x1="130" y1="14" x2="130" y2="70" stroke="#C9A227" strokeWidth="1.4" />
    <line x1="98" y1="26" x2="98" y2="70" stroke="#C9A227" strokeWidth="1.2" opacity="0.8" />
    <line x1="162" y1="26" x2="162" y2="70" stroke="#C9A227" strokeWidth="1.2" opacity="0.8" />
    <rect x="60" y="82" width="18" height="18" fill="#C9A227" opacity="0.85" />
    <rect x="182" y="82" width="18" height="18" fill="#C9A227" opacity="0.85" />
    <rect x="118" y="96" width="24" height="32" fill="#071A33" />
    <Tree x={30} y={116} s={0.9} /><Tree x={232} y={120} s={1.1} />
  </Scene>
);

export const VenueArtSci = () => (
  <Scene>
    <rect x="70" y="86" width="140" height="42" fill="#0B2545" />
    <path d="M70 86 A70 40 0 0 1 210 86 Z" fill="#10345C" />
    <circle cx="140" cy="60" r="8" fill="#C9A227" />
    <rect x="136" y="30" width="8" height="20" fill="#C9A227" />
    {[0, 1, 2, 3, 4, 5].map((i) => (<rect key={i} x={82 + i * 22} y="92" width="10" height="36" fill="#EFE6C9" opacity="0.9" />))}
    <path d="M62 128 H218 V120 H62 Z" fill="#C9A227" />
    <Tree x={40} y={122} s={0.8} /><Tree x={244} y={118} s={1} />
  </Scene>
);

export const VenueArtOLT1 = () => (
  <Scene>
    <rect x="66" y="66" width="150" height="62" fill="#10345C" />
    <path d="M60 66 L141 32 L222 66 Z" fill="#0B2545" />
    {[0, 1, 2, 3, 4].map((i) => (<rect key={i} x={78 + i * 26} y="80" width="12" height="40" fill="#EFE6C9" opacity="0.85" />))}
    <rect x="126" y="18" width="30" height="14" fill="#C9A227" opacity="0.9" />
    <Tree x={46} y={120} s={0.9} /><Tree x={238} y={116} s={0.9} />
  </Scene>
);

export const VenueArtArts = () => (
  <Scene>
    <rect x="72" y="74" width="132" height="54" fill="#0B2545" />
    <path d="M64 74 L138 34 L212 74 Z" fill="#10345C" />
    <circle cx="138" cy="58" r="11" fill="none" stroke="#C9A227" strokeWidth="2.4" />
    <circle cx="138" cy="58" r="4" fill="#C9A227" />
    <path d="M124 128 V96 A14 14 0 0 1 152 96 V128 Z" fill="#071A33" />
    <rect x="82" y="92" width="14" height="20" fill="#C9A227" opacity="0.8" />
    <rect x="180" y="92" width="14" height="20" fill="#C9A227" opacity="0.8" />
    <Tree x={52} y={120} s={1} /><Tree x={228} y={116} s={0.85} />
  </Scene>
);

export const VenueArtCBAS = () => (
  <Scene>
    <rect x="58" y="52" width="182" height="76" fill="#0B2545" />
    <rect x="58" y="46" width="182" height="8" fill="#C9A227" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <g key={i}>
        <rect x={68 + i * 24} y="64" width="16" height="16" fill="#8FB6D6" opacity="0.85" />
        <rect x={68 + i * 24} y="90" width="16" height="16" fill="#8FB6D6" opacity="0.7" />
      </g>
    ))}
    <rect x="138" y="108" width="26" height="20" fill="#071A33" />
    <Tree x={38} y={122} s={0.8} /><Tree x={258} y={120} s={0.9} />
  </Scene>
);

export const VenueArtOLT2 = () => (
  <Scene>
    <rect x="80" y="46" width="120" height="82" fill="#10345C" />
    <path d="M74 46 L140 20 L206 46 Z" fill="#0B2545" />
    {[0, 1, 2].map((i) => (<path key={i} d={`M${100 + i * 40} 66 v30 a8 8 0 0 0 16 0 v-30 a8 8 0 0 0 -16 0 Z`} fill="#EFE6C9" opacity="0.85" />))}
    <rect x="126" y="104" width="28" height="24" fill="#071A33" />
    <Tree x={56} y={120} s={0.9} /><Tree x={232} y={118} s={1} />
  </Scene>
);

export const VENUE_ART = { nlt: VenueArtNLT, sci: VenueArtSci, olt1: VenueArtOLT1, arts: VenueArtArts, cbas: VenueArtCBAS, olt2: VenueArtOLT2 };
export const VenueArt = ({ artKey }) => {
  const Comp = VENUE_ART[artKey] || VenueArtNLT;
  return <Comp />;
};
