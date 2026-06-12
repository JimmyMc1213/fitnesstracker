import { defaultExerciseTarget } from "./exercisePrescriptionDefaults";
import exerciseLibrary from "./exerciseLibrary";
import type { Habit, HabitTemplate, MacroTotals, VolumeUnit, WorkoutExercise, WorkoutRoutineTemplate, WorkoutSet, WorkoutState } from "./types";
import { buildHabitsForDateKey as buildHabitsForDateKeyFromTemplates, defaultDailyHabitTemplates, isLegacyDefaultHabitTemplates } from "./habits";
import { DEFAULT_WATER_DAILY_TARGET_OZ } from "./waterIntake";

/** Fallback macros before onboarding sets personalized targets. */
export const DEFAULT_NUTRITION_TARGETS: MacroTotals = { cal: 2000, p: 150, c: 200, f: 65 };

export {
  planWeekIndex,
  LEGACY_DEMO_WORKOUT_IDS,
  isLegacyDemoWorkoutTemplates,
  normalizeWorkoutExerciseArray,
  normalizeWorkoutTemplates,
  sanitizeWorkoutTemplates,
  dedupeHabitTemplates,
} from "@newyouai/core";

/** Days since `planStartIso` (1-based). */
export function planDayIndex(d: Date, planStartIso: string): number {
  const start = new Date(`${planStartIso}T12:00:00`);
  const diffMs = d.getTime() - start.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, days);
}

/** Fresh IDs and set clones for starting a live session from a saved routine. */
export function cloneExercisesForNewSession(exercises: WorkoutExercise[]): WorkoutExercise[] {
  const t = Date.now();
  return exercises.map((e, i) => ({
    ...e,
    id: `e${t}-${i}-${Math.random().toString(36).slice(2, 9)}`,
    sets: e.sets.map((s) => ({ ...s })),
  }));
}

/** Deep-clone a saved routine with a new id and fresh exercise ids. */
export function duplicateWorkoutTemplate(template: WorkoutRoutineTemplate): WorkoutRoutineTemplate {
  const t = Date.now();
  const baseName = template.name.trim() || "Workout";
  return {
    ...template,
    id: `tpl_${t}-${Math.random().toString(36).slice(2, 9)}`,
    name: `${baseName} copy`,
    exercises: template.exercises.map((e, i) => ({
      ...e,
      id: `te${t}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      sets: e.sets.map((s) => ({ ...s })),
    })),
    warmupItems: template.warmupItems ? template.warmupItems.map((item) => ({ ...item })) : undefined,
  };
}

/** One line when building or editing a routine. */
export function newTemplateExerciseLine(
  name: string,
  opts?: { label?: string; target?: string; setCount?: number },
): WorkoutExercise {
  const setCount = Math.min(Math.max(opts?.setCount ?? 3, 1), 12);
  const label = opts?.label?.trim();
  const target =
    (opts?.target ?? defaultExerciseTarget(name.trim(), label, setCount)).trim() || defaultExerciseTarget(name.trim(), label, setCount);
  return {
    id: `te${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    ...(label ? { label } : {}),
    target,
    sets: Array.from({ length: setCount }, () => ({ w: 0, r: 0, done: false })),
  };
}

export function resizeWorkoutSets(existing: WorkoutSet[], n: number): WorkoutSet[] {
  const c = Math.min(Math.max(n, 1), 12);
  const next = existing.slice(0, c);
  while (next.length < c) {
    const last = next[next.length - 1] ?? { w: 0, r: 0, done: false };
    next.push({ w: last.w, r: 0, done: false });
  }
  return next;
}

export const INITIAL_WORKOUT: WorkoutState = {
  splitId: "",
  startedAt: "-",
  sessionDayKey: null,
  sessionPhase: "idle",
  sessionTitle: "Workout",
  sessionStartedAtMs: null,
  exercises: [],
};

/** Full built-in exercise catalog (names only — use exerciseLibrary or catalogExercisesForEquipment for tags). */
export const EXERCISE_DB = exerciseLibrary.map((ex) => ex.name) as readonly string[];

export function defaultHabitTemplates(): HabitTemplate[] {
  return defaultDailyHabitTemplates();
}

/** Habits shown on the plan-ready screen and Home daily habits card after onboarding. */
export function habitTemplatesFromOnboarding(
  _stepsTarget: number = 10_000,
  _waterDailyTargetOz: number = DEFAULT_WATER_DAILY_TARGET_OZ,
  _volumeUnit: VolumeUnit = "oz",
): HabitTemplate[] {
  return defaultDailyHabitTemplates();
}

export function isDefaultSeedHabitTemplates(templates: HabitTemplate[]): boolean {
  return isLegacyDefaultHabitTemplates(templates);
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

export function buildHabitsForDateKey(
  templates: HabitTemplate[],
  habitsDoneByDay: Record<string, Record<string, boolean>>,
  dateKey: string,
  options?: { weightLogged?: boolean },
): Habit[] {
  return buildHabitsForDateKeyFromTemplates(templates, habitsDoneByDay, dateKey, options);
}

/** @deprecated Use `defaultHabitTemplates` + `buildHabitsForDateKey` */
export function initialHabitsForToday(): Habit[] {
  return defaultHabitTemplates().map((t) => ({ ...t, done: false }));
}
