import type { ActivityLevel } from "@newyouai/types";

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];

const LABELS: Record<ActivityLevel, string> = {
  sedentary: "Mostly seated",
  light: "Light (1-2 days/wk)",
  moderate: "Moderate (3-4 days/wk)",
  active: "Active (5-6 days/wk)",
  very_active: "Very active (daily + physical job)",
};

export function activityLevelLabel(level: ActivityLevel): string {
  return LABELS[level];
}
