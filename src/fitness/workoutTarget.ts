/** Parsed prescription from strings like `4 × 6-8` or `3 × 10-12 / arm`. */
export type ParsedWorkoutTarget = {
  /** Rep range / suffix after the multiply sign (e.g. `6-8`, `near failure`). */
  repRange: string;
};

const TARGET_SPLIT_RE = /^(\d+)\s*[×x]\s*(.+)$/iu;

/** Split `4 × 6-8` into set count hint + rep range; non-matching strings keep the whole value as rep range. */
export function parseWorkoutTarget(target: string): ParsedWorkoutTarget {
  const trimmed = target.trim();
  const m = trimmed.match(TARGET_SPLIT_RE);
  if (m) return { repRange: m[2].trim() || "10" };
  return { repRange: trimmed || "10" };
}

/** Build a target label using live set count and rep range. */
export function formatWorkoutTarget(setCount: number, repRange: string): string {
  const n = Math.min(Math.max(setCount, 1), 12);
  const range = repRange.trim() || "10";
  return `${n} × ${range}`;
}

/** Update only the set-count prefix while preserving rep range text. */
export function syncTargetSetCount(target: string, setCount: number): string {
  const { repRange } = parseWorkoutTarget(target);
  return formatWorkoutTarget(setCount, repRange);
}

/** Replace rep range using the live set count. */
export function syncTargetRepRange(_target: string, repRange: string, setCount: number): string {
  return formatWorkoutTarget(setCount, repRange);
}

/** Keep `exercise.target` set-count prefix aligned with `exercise.sets.length`. */
export function withSyncedTargetSetCount<T extends { target: string; sets: unknown[] }>(exercise: T): T {
  return {
    ...exercise,
    target: syncTargetSetCount(exercise.target, exercise.sets.length),
  };
}

/** Parse `8-12` or `10` style rep ranges into numeric bounds. */
export function parseRepRangeBounds(repRange: string): { low: number; high: number } {
  const trimmed = repRange.trim();
  const parts = trimmed.split(/[–-]/).map((p) => parseInt(p.trim(), 10));
  if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
    const low = Math.max(1, parts[0]!);
    const high = Math.max(low, parts[1]!);
    return { low, high };
  }
  const single = parseInt(trimmed, 10);
  if (Number.isFinite(single)) {
    const n = Math.max(1, single);
    return { low: n, high: n };
  }
  return { low: 8, high: 12 };
}

/** Format rep bounds as `8-12` (ASCII dash for storage). */
export function formatRepRangeBounds(low: number, high: number): string {
  const lo = Math.max(1, low);
  const hi = Math.max(lo, high);
  return lo === hi ? String(lo) : `${lo}-${hi}`;
}
