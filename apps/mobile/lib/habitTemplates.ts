import type { HabitTemplate } from "@newyouai/types";

/** Default daily habits seeded after onboarding (matches PWA defaultDailyHabitTemplates). */
export function defaultHabitTemplatesFromOnboarding(): HabitTemplate[] {
  return [
    { id: "habit-water", name: "Drink water target", icon: "💧" },
    { id: "habit-steps", name: "Hit step goal", icon: "👟" },
    { id: "habit-protein", name: "Hit protein target", icon: "🥩" },
  ];
}
