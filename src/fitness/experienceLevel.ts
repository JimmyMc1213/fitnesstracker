import type { ExperienceLevel } from "./types";

export const DEFAULT_EXPERIENCE_LEVEL: ExperienceLevel = "intermediate";

export const EXPERIENCE_LEVEL_OPTIONS: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const EXPERIENCE_LEVEL_DESCRIPTIONS: Record<ExperienceLevel, string> = {
  beginner: "New to lifting — higher reps, lighter starting weights",
  intermediate: "Comfortable with main lifts — balanced reps and load",
  advanced: "Experienced — lower reps, heavier starting weights",
};

export function normalizeExperienceLevel(raw: unknown): ExperienceLevel {
  if (raw === "beginner" || raw === "intermediate" || raw === "advanced") return raw;
  return DEFAULT_EXPERIENCE_LEVEL;
}

/** Weight multiplier applied to intermediate baseline starting weights. */
export function experienceWeightMultiplier(level: ExperienceLevel): number {
  switch (level) {
    case "beginner":
      return 0.7;
    case "advanced":
      return 1.15;
    default:
      return 1;
  }
}

/** Shift rep range endpoints for experience level (min/max stay ≥ 1). */
export function adjustRepRangeForExperience(range: string, level: ExperienceLevel): string {
  const trimmed = range.trim();
  if (!trimmed || /failure|rounds|s\b/i.test(trimmed)) return trimmed;

  const dash = trimmed.includes("–") ? "–" : "-";
  const parts = trimmed.split(/[–-]/).map((p) => p.trim());
  if (parts.length === 1) {
    const n = parseInt(parts[0]!, 10);
    if (!Number.isFinite(n)) return trimmed;
    const shift = level === "beginner" ? 2 : level === "advanced" ? -2 : 0;
    return String(Math.max(1, n + shift));
  }

  const low = parseInt(parts[0]!, 10);
  const high = parseInt(parts[1]!, 10);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return trimmed;

  const shift = level === "beginner" ? 2 : level === "advanced" ? -2 : 0;
  const nextLow = Math.max(1, low + shift);
  const nextHigh = Math.max(nextLow, high + shift);
  return `${nextLow}${dash}${nextHigh}`;
}

/** Parse "4 × 5–8" style targets and adjust rep portion for experience. */
export function adjustWorkoutTargetForExperience(target: string, level: ExperienceLevel): string {
  const m = target.match(/^(\d+\s*×\s*)(.+)$/i);
  if (!m) return adjustRepRangeForExperience(target, level);
  const prefix = m[1]!;
  const repPart = m[2]!.trim();
  return `${prefix}${adjustRepRangeForExperience(repPart, level)}`;
}
