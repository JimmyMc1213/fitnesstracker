import type { WorkoutSet, WorkoutSetKind } from "@newyouai/types";

import { normalizeWorkoutSetKind } from "@newyouai/core";

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

export { normalizeWorkoutSetKind };

export function setColumnLabel(sets: WorkoutSet[], index: number): string {
  const kind = sets[index]?.kind ?? "working";
  if (kind !== "working") return SET_KIND_SHORT[kind];
  let working = 0;
  for (let i = 0; i <= index; i++) {
    if ((sets[i]?.kind ?? "working") === "working") working += 1;
  }
  return String(working);
}

export function setKindColors(kind: WorkoutSetKind | undefined): {
  background: string;
  color: string;
  border: string;
} {
  switch (kind) {
    case "warmup":
      return { background: "rgba(255,159,10,0.12)", color: "#FF9F0A", border: "rgba(255,159,10,0.35)" };
    case "dropset":
      return { background: "rgba(191,90,242,0.12)", color: "#BF5AF2", border: "rgba(191,90,242,0.35)" };
    case "failure":
      return { background: "rgba(255,69,58,0.12)", color: "#FF453A", border: "rgba(255,69,58,0.35)" };
    default:
      return { background: "transparent", color: "transparent", border: "transparent" };
  }
}
