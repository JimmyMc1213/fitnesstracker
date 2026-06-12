import type { HabitTemplate } from "@newyouai/types";

export const MOBILITY_HABIT_ID = "habit-mobility";
const LEGACY_MOBILITY_HABIT_ID = "h4";

export function mobilityHabitTemplate(): HabitTemplate {
  return {
    id: MOBILITY_HABIT_ID,
    name: "Mobility",
    icon: "bolt",
    subtitle: "Stretch routine ~15 min",
  };
}

export function ensureMobilityHabitTemplate(templates: HabitTemplate[]): HabitTemplate[] {
  const hasMobility = templates.some((t) => t.id === MOBILITY_HABIT_ID);
  if (hasMobility) {
    return templates.filter((t) => t.id !== LEGACY_MOBILITY_HABIT_ID);
  }

  const withoutLegacy = templates.filter((t) => t.id !== LEGACY_MOBILITY_HABIT_ID);
  return [...withoutLegacy, mobilityHabitTemplate()];
}
