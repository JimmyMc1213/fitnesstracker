export function KpiCard({
  label,
  value,
  icon,
  iconFilled,
  delta,
  deltaUp,
  foot,
}: {
  label: string;
  value: string;
  icon?: string;
  iconFilled?: boolean;
  delta?: string;
  deltaUp?: boolean;
  foot?: string;
}) {
  return (
    <div className="card kpi">
      <div className="kpitop">
        <div className="kpilab">{label}</div>
        {icon ? (
          <div className={iconFilled ? "iconchip" : "iconchip neu"}>
            <i className={icon} />
          </div>
        ) : null}
      </div>
      <div className="kpival">{value}</div>
      <div className="kpifoot">
        {delta ? (
          <span className={deltaUp ? "delta up" : "delta down"}>
            <i className={deltaUp ? "ph ph-arrow-up-right" : "ph ph-arrow-down-right"} />
            {delta}
          </span>
        ) : null}
        {foot ? <span>{foot}</span> : null}
      </div>
    </div>
  );
}
