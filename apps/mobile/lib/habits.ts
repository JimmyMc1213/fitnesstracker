import type { Habit, HabitTemplate } from "@newyouai/types";

import { isMobilityHabit } from "@/lib/mobilityHabit";

export const WEIGH_IN_HABIT_ID = "weigh_in";

export type HabitType = "manual" | "action";

export function habitTypeOf(template: HabitTemplate): HabitType {
  if (template.type === "action" || template.type === "manual") return template.type;
  if (template.action === "openWeighIn" || template.id === WEIGH_IN_HABIT_ID) return "action";
  return "manual";
}

export function isWeighInActionHabit(template: Pick<HabitTemplate, "id" | "action">): boolean {
  return template.id === WEIGH_IN_HABIT_ID || template.action === "openWeighIn";
}

export function isActionHabit(template: HabitTemplate): boolean {
  return habitTypeOf(template) === "action";
}

export function markWeighInHabitDone(
  habitsDoneByDay: Record<string, Record<string, boolean>>,
  dateKey: string,
): Record<string, Record<string, boolean>> {
  return {
    ...habitsDoneByDay,
    [dateKey]: {
      ...(habitsDoneByDay[dateKey] ?? {}),
      [WEIGH_IN_HABIT_ID]: true,
    },
  };
}

export function buildHabitsForDateKey(
  templates: HabitTemplate[],
  habitsDoneByDay: Record<string, Record<string, boolean>>,
  dateKey: string,
  options?: { weightLogged?: boolean },
): Habit[] {
  const map = habitsDoneByDay[dateKey] ?? {};
  const weightLogged = options?.weightLogged ?? false;
  return templates.map((t) => {
    let done = Boolean(map[t.id]);
    if (isWeighInActionHabit(t) && weightLogged) done = true;
    return {
      ...t,
      type: habitTypeOf(t),
      done,
    };
  });
}

export function habitsForDateKey(
  state: {
    habitTemplates: HabitTemplate[];
    habitsDoneByDay: Record<string, Record<string, boolean>>;
    weightLog: { dateKey: string }[];
  },
  dateKey: string,
): Habit[] {
  const weightLogged = state.weightLog.some((e) => e.dateKey === dateKey);
  return buildHabitsForDateKey(state.habitTemplates, state.habitsDoneByDay, dateKey, { weightLogged });
}

export function dailyHabitTemplatesFromState(templates: HabitTemplate[]): HabitTemplate[] {
  return templates.filter((t) => !isMobilityHabit(t.id));
}

export function pruneHabitsDoneByDay(
  habitsDoneByDay: Record<string, Record<string, boolean>>,
  templateIds: ReadonlySet<string>,
): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {};
  for (const [day, map] of Object.entries(habitsDoneByDay)) {
    const inner: Record<string, boolean> = {};
    for (const [id, done] of Object.entries(map)) {
      if (templateIds.has(id)) inner[id] = done;
    }
    if (Object.keys(inner).length > 0) out[day] = inner;
  }
  return out;
}
