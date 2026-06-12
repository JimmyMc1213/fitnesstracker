import type { ExperienceLevel } from "@newyouai/types";

export const EXPERIENCE_LEVEL_OPTIONS: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const EXPERIENCE_LEVEL_DESCRIPTIONS: Record<ExperienceLevel, string> = {
  beginner: "New to lifting, higher reps, lighter starting weights",
  intermediate: "Comfortable with main lifts, balanced reps and load",
  advanced: "Experienced, lower reps, heavier starting weights",
};
