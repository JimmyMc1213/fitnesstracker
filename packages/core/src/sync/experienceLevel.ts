import type { ExperienceLevel } from "@newyouai/types";

export const DEFAULT_EXPERIENCE_LEVEL: ExperienceLevel = "intermediate";

export function normalizeExperienceLevel(raw: unknown): ExperienceLevel {
  if (raw === "beginner" || raw === "intermediate" || raw === "advanced") return raw;
  return DEFAULT_EXPERIENCE_LEVEL;
}
