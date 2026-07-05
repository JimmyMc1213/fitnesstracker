import type { Habit, HabitTemplate } from "@newyouai/types";

import { isMobilityHabit } from "@/lib/mobilityHabit";
import { sanitizeUserText } from "@/lib/userText";

export const WEIGH_IN_HABIT_ID = "weigh_in";
export const HABIT_NAME_MAX_LENGTH = 40;
export const HABIT_DESCRIPTION_MAX_LENGTH = 80;

export function stripEmDash(input: string): string {
  return input.replace(/\s*\u2014\s*/g, ", ").replace(/\u2014/g, ", ");
}

export function normalizeHabitName(input: string): string {
  return stripEmDash(sanitizeUserText(input)).trim().slice(0, HABIT_NAME_MAX_LENGTH);
}

export function normalizeHabitSubtitle(input: string | undefined): string | undefined {
  if (!input?.trim()) return undefined;
  const cleaned = stripEmDash(sanitizeUserText(input)).trim().slice(0, HABIT_DESCRIPTION_MAX_LENGTH);
  return cleaned || undefined;
}

export function normalizeHabitTemplate(template: HabitTemplate): HabitTemplate {
  const { subtitle: _existing, ...rest } = template;
  const name = normalizeHabitName(template.name) || "New habit";
  const subtitle = normalizeHabitSubtitle(template.subtitle);
  return subtitle ? { ...rest, name, subtitle } : { ...rest, name };
}

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
  {
    id: "creatine",
    name: "Take creatine (3-5g)",
    subtitle: "Every day, including rest days",
    icon: "pill",
    type: "manual",
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
  const trimmedName = normalizeHabitName(name) || "New habit";
  const trimmedSubtitle = normalizeHabitSubtitle(subtitle);
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
