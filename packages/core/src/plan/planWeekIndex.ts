/** Weeks since `planStartIso` (1-based, no fixed program length). */
export function planWeekIndex(d: Date, planStartIso: string): number {
  const start = new Date(`${planStartIso}T12:00:00`);
  const diffMs = d.getTime() - start.getTime();
  const w = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, w);
}
