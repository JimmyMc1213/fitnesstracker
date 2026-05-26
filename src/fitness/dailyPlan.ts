/** Local calendar date key (YYYY-MM-DD). */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Short heading for home eyebrow, e.g. THU MAY 21 */
export function formatDateKeyEyebrow(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "").toUpperCase();
}

/** Calendar date in America/Phoenix (no DST). */
export function arizonaCalendarDateKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Short label for UI, e.g. "Wed · May 6" */
export function formatDailyPlanSubtitle(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
