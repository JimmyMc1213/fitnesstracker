import type { Habit, HabitTemplate } from "@newyouai/types";

import { isMobilityHabit } from "@/lib/mobilityHabit";

export const WEIGH_IN_HABIT_ID = "weigh_in";

export type HabitAction = "openWeighIn";
export type HabitType = "manual" | "action";

export type HabitDefinition = {
  id: string;
  name: string;
  subtitle?: string;
  icon: string;
  type: HabitType;
  action?: HabitAction;
};

/** Habits available in the add sheet (excluding custom). Mirrors PWA catalog. */
export const ADDABLE_HABITS_CATALOG: HabitDefinition[] = [
  {
    id: "no_alcohol",
    name: "No alcohol",
    subtitle: "Simple daily accountability",
    icon: "ban",
    type: "manual",
  },
  {
    id: "cold_shower",
    name: "Cold shower",
    subtitle: "Recovery and mental clarity",
    icon: "snowflake",
    type: "manual",
  },
  {
    id: "pre_workout_meal",
    name: "Pre-workout meal",
    subtitle: "Fuel before you train",
    icon: "food",
    type: "manual",
  },
  {
    id: "post_workout_protein",
    name: "Post-workout protein",
    subtitle: "Protein within 30 min of finishing",
    icon: "protein",
    type: "manual",
  },
  {
    id: "screen_free_bed",
    name: "Screen-free before bed",
    subtitle: "Better sleep, better recovery",
    icon: "phone-off",
    type: "manual",
  },
  {
    id: "read_10_min",
    name: "Read 10 minutes",
    subtitle: "Compound growth over time",
    icon: "book",
    type: "manual",
  },
  {
    id: "no_junk_food",
    name: "No junk food",
    subtitle: "Consistency beats perfection",
    icon: "ban",
    type: "manual",
  },
];

export function normalizeHabitIcon(icon: string): string {
  if (icon === "water" || icon === "droplet") return "drop";
  if (icon === "sleep") return "moon";
  if (icon === "alcohol" || icon === "no_alcohol" || icon === "glass-off") return "ban";
  return icon;
}

export function newCustomHabitId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `custom-${crypto.randomUUID()}`;
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function availableHabitsToAdd(
  currentTemplates: HabitTemplate[],
  query: string,
): HabitDefinition[] {
  const currentIds = new Set(currentTemplates.map((t) => t.id));
  const q = query.trim().toLowerCase();
  return ADDABLE_HABITS_CATALOG.filter((h) => {
    if (currentIds.has(h.id)) return false;
    if (!q) return true;
    return h.name.toLowerCase().includes(q) || (h.subtitle?.toLowerCase().includes(q) ?? false);
  });
}

export function createCustomHabitTemplate(name: string, subtitle?: string): HabitTemplate {
  const trimmedName = name.trim().slice(0, 40);
  const trimmedSubtitle = subtitle?.trim().slice(0, 80);
  return {
    id: newCustomHabitId(),
    name: trimmedName,
    icon: "bolt",
    type: "manual",
    ...(trimmedSubtitle ? { subtitle: trimmedSubtitle } : {}),
  };
}

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
