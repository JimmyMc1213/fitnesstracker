import type { HabitTemplate } from "@newyouai/types";

/** Legacy Jimmy-plan / auto-programmed nutrition habits — never show or assign to users. */
export const NUTRITION_PROGRAMMING_HABIT_IDS = new Set(["habit-track", "habit-protein"]);

const STANDARD_HABIT_ICONS = new Set<HabitTemplate["icon"]>(["drop", "run", "moon", "pill", "scale", "sun", "ban", "book"]);

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

/** One row per standard icon (water/steps/sleep); extras deduped by name. */
export function dedupeHabitTemplates(templates: HabitTemplate[]): HabitTemplate[] {
  const sorted = [...templates].sort((a, b) => {
    const rank = (t: HabitTemplate) => (t.id.startsWith("habit-") ? 0 : 1);
    return rank(a) - rank(b);
  });
  const out: HabitTemplate[] = [];
  const seenIcons = new Set<HabitTemplate["icon"]>();
  const seenNames = new Set<string>();

  for (const t of sorted) {
    const nameKey = t.name.trim().toLowerCase();
    if (STANDARD_HABIT_ICONS.has(t.icon)) {
      if (seenIcons.has(t.icon)) continue;
      seenIcons.add(t.icon);
      out.push(t);
      continue;
    }
    if (seenNames.has(nameKey)) continue;
    seenNames.add(nameKey);
    out.push(t);
  }
  return out;
}
