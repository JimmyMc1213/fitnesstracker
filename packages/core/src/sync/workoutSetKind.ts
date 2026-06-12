import type { WorkoutSetKind } from "@newyouai/types";

export function normalizeWorkoutSetKind(raw: unknown): WorkoutSetKind {
  if (raw === "warmup" || raw === "dropset" || raw === "failure" || raw === "working") return raw;
  return "working";
}
