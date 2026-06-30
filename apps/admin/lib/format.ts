export function compactNumber(n: number): string {
  if (Math.abs(n) >= 1000) {
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  }
  return String(n);
}

export function numberWithCommas(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function currency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function initialsFromEmail(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

export function shortId(id: string, len = 8): string {
  if (id.length <= len) return id;
  return id.slice(0, len);
}

export function relativeTime(input: string | number | Date | null | undefined): string {
  if (!input) return "—";
  const then = new Date(input).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function formatDate(input: string | number | Date | null | undefined): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const CHIP_BY_STATUS: Record<string, [string, string]> = {
  active: ["cgreen", "Active"],
  trialing: ["camber", "Trial"],
  expired: ["cgray", "Expired"],
  none: ["cgray", "Free"],
  free: ["cgray", "Free"],
  // future you job statuses (real schema: queued | generating | ready | failed)
  ready: ["cgreen", "Ready"],
  generating: ["cblue", "Generating"],
  queued: ["camber", "Queued"],
  failed: ["cred", "Failed"],
  // issues
  open: ["camber", "Open"],
  triaged: ["cblue", "Triaged"],
  planned: ["cblue", "Planned"],
  resolved: ["cgreen", "Resolved"],
  // foods
  live: ["cgreen", "Live"],
  flagged: ["cred", "Flagged"],
};

export function statusChip(status: string): { cls: string; label: string } {
  const [cls, label] = CHIP_BY_STATUS[status] ?? ["cgray", status];
  return { cls: `chip ${cls}`, label };
}

const GOAL_CHIP: Record<string, [string, string]> = {
  cut: ["cblue", "Cutting"],
  bulk: ["camber", "Bulking"],
  maintain: ["cgray", "Maintain"],
};

export function goalChip(goal: string | undefined | null): { cls: string; label: string } {
  const [cls, label] = GOAL_CHIP[goal ?? ""] ?? ["cgray", goal ?? "—"];
  return { cls: `chip ${cls}`, label };
}

/** Build an SVG polyline + area path for a simple sparkline/area chart. */
export function buildAreaChart(
  data: number[],
  width: number,
  height: number,
  opts: { padTop?: number; padBottom?: number; maxScale?: number; minScale?: number } = {},
): { linePts: string; areaPath: string; dots: { x: number; y: number }[] } {
  const n = data.length;
  if (n === 0) return { linePts: "", areaPath: "", dots: [] };
  const padTop = opts.padTop ?? 12;
  const padBottom = opts.padBottom ?? 12;
  const max = Math.max(...data) * (opts.maxScale ?? 1.08) || 1;
  const min = Math.min(...data) * (opts.minScale ?? 0.86);
  const span = max - min || 1;
  const X = (i: number) => (n === 1 ? width / 2 : i * (width / (n - 1)));
  const Y = (v: number) => height - ((v - min) / span) * (height - padTop - padBottom) - padBottom;
  const dots = data.map((v, i) => ({ x: +X(i).toFixed(1), y: +Y(v).toFixed(1) }));
  const linePts = dots.map((d) => `${d.x},${d.y}`).join(" ");
  const areaPath = `M0,${height} L` + dots.map((d) => `${d.x},${d.y}`).join(" L") + ` L${width},${height} Z`;
  return { linePts, areaPath, dots };
}
