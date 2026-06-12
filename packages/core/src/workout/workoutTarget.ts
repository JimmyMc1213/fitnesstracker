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

/** Parse `8-12`, `10`, or timed `30 sec` / `30 sec (or 40m)` into numeric bounds. */
export function parseRepRangeBounds(repRange: string): { low: number; high: number } {
  const trimmed = repRange.trim();
  const timedMatch = trimmed.match(/^(\d+)\s*sec\b/i);
  if (timedMatch) {
    const n = Math.max(1, parseInt(timedMatch[1]!, 10));
    return { low: n, high: n };
  }
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

/** Parsed min/max reps from an exercise prescription target. */
export function getExerciseRepBounds(exercise: { target: string }): { low: number; high: number } {
  const { repRange } = parseWorkoutTarget(exercise.target);
  return parseRepRangeBounds(repRange);
}

/** Human-readable rep range for coach copy (e.g. `8-12 reps`, `10 reps`). */
export function describeRepRangeBounds(low: number, high: number): string {
  const lo = Math.max(1, low);
  const hi = Math.max(lo, high);
  return lo === hi ? `${lo} reps` : `${lo}-${hi} reps`;
}

export function describeExerciseRepRange(exercise: { target: string }): string {
  const { low, high } = getExerciseRepBounds(exercise);
  return describeRepRangeBounds(low, high);
}
