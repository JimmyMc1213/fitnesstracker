import { buildHabitsForDateKey } from "./data";
import { STRETCH_BLOCKS } from "./stretchRoutine";
import type { AppState, HabitTemplate } from "./types";

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

export function isMobilityHabit(habitId: string): boolean {
  return habitId === MOBILITY_HABIT_ID || habitId === LEGACY_MOBILITY_HABIT_ID;
}

export function ensureMobilityHabitTemplate(templates: HabitTemplate[]): HabitTemplate[] {
  const hasMobility = templates.some((t) => t.id === MOBILITY_HABIT_ID);
  if (hasMobility) {
    return templates.filter((t) => t.id !== LEGACY_MOBILITY_HABIT_ID);
  }

  const withoutLegacy = templates.filter((t) => t.id !== LEGACY_MOBILITY_HABIT_ID);
  return [...withoutLegacy, mobilityHabitTemplate()];
}

export function migrateMobilityHabitCompletion(
  habitsDoneByDay: Record<string, Record<string, boolean>>,
): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {};
  for (const [day, map] of Object.entries(habitsDoneByDay)) {
    const next = { ...map };
    if (next[LEGACY_MOBILITY_HABIT_ID]) {
      next[MOBILITY_HABIT_ID] = true;
      delete next[LEGACY_MOBILITY_HABIT_ID];
    }
    out[day] = next;
  }
  return out;
}

export function applyStretchSessionComplete(
  state: AppState,
  arizonaTodayKey: string,
  localTodayKey: string,
): AppState {
  const blockIds = STRETCH_BLOCKS.map((b) => b.id);
  const habitsDoneByDay = {
    ...state.habitsDoneByDay,
    [localTodayKey]: {
      ...(state.habitsDoneByDay[localTodayKey] ?? {}),
      [MOBILITY_HABIT_ID]: true,
    },
  };
  const habits = buildHabitsForDateKey(state.habitTemplates, habitsDoneByDay, localTodayKey);

  return {
    ...state,
    habits,
    habitsDoneByDay,
    nightlyStretchCompletedArizonaKey: arizonaTodayKey,
    nightlyStretchBlockIdsByArizonaDay: {
      ...state.nightlyStretchBlockIdsByArizonaDay,
      [arizonaTodayKey]: blockIds,
    },
  };
}
