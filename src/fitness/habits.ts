import type { Habit, HabitTemplate } from "./types";

export const WEIGH_IN_HABIT_ID = "weigh_in";

/** Legacy Jimmy-plan / auto-programmed nutrition habits — never show or assign to users. */
export const NUTRITION_PROGRAMMING_HABIT_IDS = new Set(["habit-track", "habit-protein"]);

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

export const DEFAULT_HABITS: HabitDefinition[] = [
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
    subtitle: "Weekends especially — burns fat without touching recovery",
    icon: "run",
    type: "manual",
  },
  {
    id: "creatine",
    name: "Take creatine (3-5g)",
    subtitle: "Every day — including rest days",
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

/** Habits available in the add sheet (excluding custom). */
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

const LEGACY_DEFAULT_IDS = new Set(["h1", "h2", "h3", "habit-hydration", "habit-steps"]);

export function newCustomHabitId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `custom-${crypto.randomUUID()}`;
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function definitionToTemplate(def: HabitDefinition): HabitTemplate {
  return {
    id: def.id,
    name: def.name,
    icon: normalizeHabitIcon(def.icon),
    ...(def.subtitle ? { subtitle: def.subtitle } : {}),
    type: def.type,
    ...(def.action ? { action: def.action } : {}),
  };
}

export function defaultDailyHabitTemplates(): HabitTemplate[] {
  return DEFAULT_HABITS.map(definitionToTemplate);
}

/** True for legacy auto-assigned nutrition habits (e.g. "Track every meal", "Hit 175g protein"). */
export function isNutritionProgrammingHabit(template: Pick<HabitTemplate, "id" | "name">): boolean {
  if (NUTRITION_PROGRAMMING_HABIT_IDS.has(template.id)) return true;
  const name = template.name.trim().toLowerCase();
  if (name === "track every meal" || name === "track meal goal") return true;
  if (name === "protein goal" || /^hit \d+g protein\b/.test(name)) return true;
  return false;
}

export function stripNutritionProgrammingHabits(templates: HabitTemplate[]): HabitTemplate[] {
  return templates.filter((t) => !isNutritionProgrammingHabit(t));
}

export function isLegacyDefaultHabitTemplates(templates: HabitTemplate[]): boolean {
  if (templates.length === 0) return false;
  return templates.every((t) => LEGACY_DEFAULT_IDS.has(t.id) || t.id === "habit-mobility" || t.id === "h4");
}

export function normalizeHabitIcon(icon: string): string {
  if (icon === "water" || icon === "droplet") return "drop";
  if (icon === "sleep") return "moon";
  if (icon === "alcohol" || icon === "no_alcohol" || icon === "glass-off") return "ban";
  return icon;
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
