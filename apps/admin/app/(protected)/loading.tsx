export default function Loading() {
  return (
    <>
      <div className="kpis">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="card sk sk-card" key={i} />
        ))}
      </div>

      <div className="grid2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="sk sk-line" style={{ width: "40%", marginTop: 18 }} />
          <div className="sk sk-chart" />
        </div>
        <div className="card">
          <div className="sk sk-line" style={{ width: "40%", marginTop: 18 }} />
          <div className="sk sk-chart" />
        </div>
      </div>
    </>
  );
}
