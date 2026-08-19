export default function Stamp({ small, lines }) {
  return (
    <div className={`stamp${small ? " sm" : ""}`}>
      {lines.map((l, i) => (
        <span key={i} className={i === 1 ? "stamp-big" : ""}>{l}</span>
      ))}
    </div>
  );
}
