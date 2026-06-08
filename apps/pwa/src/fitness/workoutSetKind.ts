import type { WorkoutSet, WorkoutSetKind } from "./types";

export const WORKOUT_SET_KINDS: WorkoutSetKind[] = ["working", "warmup", "dropset", "failure"];

export const SET_KIND_LABELS: Record<WorkoutSetKind, string> = {
  working: "Working set",
  warmup: "Warm up",
  dropset: "Drop set",
  failure: "Failure",
};

export const SET_KIND_SHORT: Record<WorkoutSetKind, string> = {
  working: "",
  warmup: "W",
  dropset: "D",
  failure: "F",
};

export function normalizeWorkoutSetKind(raw: unknown): WorkoutSetKind {
  if (raw === "warmup" || raw === "dropset" || raw === "failure" || raw === "working") return raw;
  return "working";
}

/** Label shown in the Set column (W/D/F or 1-based working index). */
export function setColumnLabel(sets: WorkoutSet[], index: number): string {
  const kind = sets[index]?.kind ?? "working";
  if (kind !== "working") return SET_KIND_SHORT[kind];
  let working = 0;
  for (let i = 0; i <= index; i++) {
    if ((sets[i]?.kind ?? "working") === "working") working += 1;
  }
  return String(working);
}

export function setKindStyle(kind: WorkoutSetKind | undefined): {
  background: string;
  color: string;
  border: string;
} {
  switch (kind) {
    case "warmup":
      return {
        background: "var(--workout-set-warmup-bg)",
        color: "var(--workout-set-warmup-fg)",
        border: "0.5px solid var(--workout-set-warmup-border)",
      };
    case "dropset":
      return {
        background: "var(--workout-set-dropset-bg)",
        color: "var(--workout-set-dropset-fg)",
        border: "0.5px solid var(--workout-set-dropset-border)",
      };
    case "failure":
      return {
        background: "var(--workout-set-failure-bg)",
        color: "var(--workout-set-failure-fg)",
        border: "0.5px solid var(--workout-set-failure-border)",
      };
    default:
      return {
        background: "var(--surface-2)",
        color: "var(--text-muted-soft)",
        border: "0.5px solid var(--border)",
      };
  }
}
