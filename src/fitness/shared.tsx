import type { ReactNode } from "react";

import type { FoodItem, MacroTotals } from "./types";

export function sumItems(items: FoodItem[]): MacroTotals {
  return items.reduce(
    (a, x) => ({
      cal: a.cal + x.cal,
      p: a.p + x.p,
      c: a.c + x.c,
      f: a.f + x.f,
    }),
    { cal: 0, p: 0, c: 0, f: 0 },
  );
}

export function MacroBar({ label, value, target, unit = "g" }: { label: string; value: number; target: number; unit?: string }) {
  const pct = Math.max(0, Math.min(1, value / target));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
          {Math.round(value)}
          <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
            {" "}
            / {target}
            {unit}
          </span>
        </span>
      </div>
      <div className="barTrack">
        <div className="barFill" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}

export function MacroRing({ value, target, size = 132, stroke = 6 }: { value: number; target: number; size?: number; stroke?: number }) {
  const pct = Math.max(0, Math.min(1, value / target));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#ffffff"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
          {Math.round(value)}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
          of {target} kcal
        </div>
      </div>
    </div>
  );
}

export function Sparkline({ data, width = 120, height = 36, stroke = "#ffffff" }: { data: number[]; width?: number; height?: number; stroke?: string }) {
  if (!data?.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.length > 0 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={stroke} />}
    </svg>
  );
}

export function LineChart({
  data,
  width,
  height = 160,
  padLeft = 12,
  padRight = 36,
  padY = 16,
}: {
  data: number[];
  width: number;
  height?: number;
  /** Space before the plot (line start). */
  padLeft?: number;
  /** Space on the right for Y-axis tick labels (e.g. “172.4”). */
  padRight?: number;
  padY?: number;
}) {
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const range = max - min || 1;
  const w = Math.max(1, width - padLeft - padRight);
  const h = height - padY * 2;
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;
  const pts = data.map((v, i) => [padLeft + i * stepX, padY + h - ((v - min) / range) * h] as const);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${pts[pts.length - 1][0]} ${padY + h} L${pts[0][0]} ${padY + h} Z`;
  const ticks = [max, (max + min) / 2, min];
  const tickTextX = width - 6;
  const gridRight = width - padRight;
  return (
    <svg width={width} height={height} style={{ display: "block", maxWidth: "100%" }}>
      {ticks.map((t, i) => {
        const y = padY + (i / 2) * h;
        return (
          <g key={i}>
            <line x1={padLeft} x2={gridRight} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <text x={tickTextX} y={y - 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="var(--ui)">
              {t.toFixed(1)}
            </text>
          </g>
        );
      })}
      <path d={area} fill="rgba(255,255,255,0.04)" />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (i === pts.length - 1 ? <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#ffffff" /> : null))}
    </svg>
  );
}

export function BarChart({
  data,
  width,
  height = 100,
  max = 6,
  activeIndex,
}: {
  data: number[];
  width: number;
  height?: number;
  max?: number;
  /** Program week bar to emphasize (0-based). Defaults to last bar. */
  activeIndex?: number;
}) {
  const padX = 4;
  const w = width - padX * 2;
  const barW = w / data.length - 4;
  const hi =
    activeIndex !== undefined
      ? Math.max(0, Math.min(data.length - 1, activeIndex))
      : data.length - 1;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {data.map((v, i) => {
        const x = padX + i * (w / data.length) + 2;
        const fillH = (v / max) * (height - 16);
        const y = height - fillH;
        const isActive = i === hi;
        return (
          <g key={i}>
            <rect x={x} y={0} width={barW} height={height - 14} fill="rgba(255,255,255,0.04)" rx="2" />
            <rect x={x} y={y - 14} width={barW} height={fillH} fill={isActive ? "#ffffff" : "rgba(255,255,255,0.3)"} rx="2" />
            <text
              x={x + barW / 2}
              y={height - 2}
              textAnchor="middle"
              fill={isActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)"}
              fontSize="9"
              fontFamily="var(--ui)"
              fontWeight={isActive ? "600" : "500"}
            >
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Heatmap({ days, cell = 12, gap = 3 }: { days: number[]; cell?: number; gap?: number }) {
  const cols = Math.ceil(days.length / 7);
  const wi = cols * (cell + gap) - gap;
  const ht = 7 * (cell + gap) - gap;
  return (
    <svg width={wi} height={ht} style={{ display: "block" }}>
      {days.map((v, i) => {
        const col = Math.floor(i / 7);
        const row = i % 7;
        const x = col * (cell + gap);
        const y = row * (cell + gap);
        const fill = v ? "#ffffff" : row === 0 || row === 6 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)";
        return <rect key={i} x={x} y={y} width={cell} height={cell} rx="2" fill={fill} />;
      })}
    </svg>
  );
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="between" style={{ marginTop: 28, marginBottom: 12 }}>
      <span className="label">{children}</span>
      {right}
    </div>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div style={{ paddingTop: 8, paddingBottom: 4 }}>
      <div className="between" style={{ alignItems: "flex-start" }}>
        <div>
          {eyebrow && <div className="h-greeting">{eyebrow}</div>}
          <div className="h-title">{title}</div>
        </div>
        {right}
      </div>
    </div>
  );
}
