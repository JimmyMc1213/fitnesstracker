import { buildAreaChart } from "../lib/format";

export function AreaChart({
  data,
  width = 560,
  height = 160,
  gradientId,
}: {
  data: number[];
  width?: number;
  height?: number;
  gradientId: string;
}) {
  const { linePts, areaPath, dots } = buildAreaChart(data, width, height);
  const gridLines = [height * 0.25, height * 0.5, height * 0.75];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CAA668" stopOpacity="0.2" />
          <stop offset="1" stopColor="#CAA668" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map((y) => (
        <line key={y} x1="0" y1={y} x2={width} y2={y} stroke="#F1EFE9" />
      ))}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline points={linePts} fill="none" stroke="#9C7C3E" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {dots.length <= 12 &&
        dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="3" fill="#fff" stroke="#9C7C3E" strokeWidth="2" />)}
    </svg>
  );
}

export function HBars({
  bars,
  formatValue,
}: {
  bars: { label: string; count: number; color: string }[];
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(...bars.map((b) => b.count), 1);
  return (
    <div className="hbars">
      {bars.map((b) => (
        <div className="hbar" key={b.label}>
          <span className="hl">{b.label}</span>
          <div className="htrack">
            <div className="hfill" style={{ width: `${Math.max(4, (b.count / max) * 100)}%`, background: b.color }} />
          </div>
          <span className="hv">{formatValue ? formatValue(b.count) : b.count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function PercentBars({ bars }: { bars: { label: string; pct: number; color: string }[] }) {
  return (
    <div className="hbars">
      {bars.map((b) => (
        <div className="hbar" key={b.label}>
          <span className="hl">{b.label}</span>
          <div className="htrack">
            <div className="hfill" style={{ width: `${b.pct}%`, background: b.color }} />
          </div>
          <span className="hv">{b.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export function Ring({ pct, label = "convert", size = 104 }: { pct: number; label?: string; size?: number }) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  return (
    <div className="ringwrap" style={{ width: size, height: size }}>
      <svg className="ring" width={size} height={size} viewBox="0 0 104 104">
        <circle cx="52" cy="52" r={r} fill="none" stroke="#F1EFE9" strokeWidth="11" />
        <circle
          cx="52"
          cy="52"
          r={r}
          fill="none"
          stroke="#CAA668"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${dash.toFixed(1)} ${circumference.toFixed(2)}`}
          strokeDashoffset="0"
        />
      </svg>
      <div className="ringctr">
        <div className="ringpct">{pct}%</div>
        <div className="ringsub">{label}</div>
      </div>
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= rating ? "ph-fill ph-star son" : "ph ph-star soff"} />
      ))}
    </div>
  );
}
