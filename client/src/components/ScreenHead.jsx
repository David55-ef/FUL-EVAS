export default function ScreenHead({ title, sub, actions }) {
  return (
    <div className="screen-head">
      <div><h1>{title}</h1><p>{sub}</p></div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>
    </div>
  );
}
