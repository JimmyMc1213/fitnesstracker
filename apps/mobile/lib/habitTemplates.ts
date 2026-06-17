import type { HabitTemplate } from "@newyouai/types";

import { WEIGH_IN_HABIT_ID } from "@/lib/habits";

/** Default daily habits after onboarding (matches PWA `DEFAULT_HABITS`). */
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
      id: "creatine",
      name: "Take creatine (3-5g)",
      subtitle: "Every day, including rest days",
      icon: "pill",
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
    {
      id: "sunlight",
      name: "Sunlight first thing",
      subtitle: "Sets your circadian rhythm and boosts energy",
      icon: "sun",
      type: "manual",
    },
    {
      id: "no_alcohol",
      name: "No alcohol",
      subtitle: "Simple daily accountability",
      icon: "ban",
      type: "manual",
    },
  ];
}
