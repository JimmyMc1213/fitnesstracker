import type { HabitTemplate } from "@newyouai/types";

import { WEIGH_IN_HABIT_ID } from "@/lib/habits";

/** Default daily habits after onboarding (matches PWA `ONBOARDING_HABITS`). */
export function defaultHabitTemplatesFromOnboarding(): HabitTemplate[] {
  return [
    {
      id: "water",
      name: "Drink water target",
      subtitle: "Hydration drives performance and recovery",
      icon: "droplet",
      type: "manual",
    },
    {
      id: "steps",
      name: "10,000 steps",
      subtitle: "Weekends especially burn fat without touching recovery",
      icon: "run",
      type: "manual",
    },
    {
      id: "sleep",
      name: "Sleep 7-8 hours",
      subtitle: "You build muscle while you sleep, not while you lift",
      icon: "moon",
      type: "manual",
    },
    {
      id: WEIGH_IN_HABIT_ID,
      name: "Morning weigh-in",
      subtitle: "First thing after waking, before food",
      icon: "scale",
      type: "action",
      action: "openWeighIn",
    },
  ];
}
