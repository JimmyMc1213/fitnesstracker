import { defaultExerciseTarget } from "./exercisePrescriptionDefaults";
import exerciseLibrary from "./exerciseLibrary";
import type { Habit, HabitTemplate, MacroTotals, VolumeUnit, WorkoutExercise, WorkoutRoutineTemplate, WorkoutSet, WorkoutState } from "./types";
import { buildHabitsForDateKey as buildHabitsForDateKeyFromTemplates, defaultDailyHabitTemplates, isLegacyDefaultHabitTemplates } from "./habits";
import { normalizeWorkoutSetKind } from "./workoutSetKind";
import { normalizeDayLabel, weekdayMonStartIndex } from "./trainingCalendar";
import { DEFAULT_WATER_DAILY_TARGET_OZ } from "./waterIntake";

/** Fallback macros before onboarding sets personalized targets. */
export const DEFAULT_NUTRITION_TARGETS: MacroTotals = { cal: 2000, p: 150, c: 200, f: 65 };

/** Weeks since `planStartIso` (1-based, no fixed program length). */
export function planWeekIndex(d: Date, planStartIso: string): number {
  const start = new Date(`${planStartIso}T12:00:00`);
  const diffMs = d.getTime() - start.getTime();
  const w = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, w);
}

/** Days since `planStartIso` (1-based). */
export function planDayIndex(d: Date, planStartIso: string): number {
  const start = new Date(`${planStartIso}T12:00:00`);
  const diffMs = d.getTime() - start.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, days);
}

/** Legacy Mon–Fri demo split ids from the original prototype (migration only). */
export const LEGACY_DEMO_WORKOUT_IDS = new Set([
  "mon-upper",
  "tue-lower",
  "wed-push",
  "thu-pull",
  "fri-legs",
]);

export function isLegacyDemoWorkoutTemplates(templates: WorkoutRoutineTemplate[]): boolean {
  if (templates.length !== LEGACY_DEMO_WORKOUT_IDS.size) return false;
  return templates.every((t) => LEGACY_DEMO_WORKOUT_IDS.has(t.id));
}

function normalizeSets(raw: unknown): WorkoutSet[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ];
  }
  return raw.map((s) => {
    if (!s || typeof s !== "object") return { w: 0, r: 0, done: false };
    const o = s as Record<string, unknown>;
    const kind = normalizeWorkoutSetKind(o.kind);
    return {
      w: Number(o.w) || 0,
      r: Number(o.r) || 0,
      done: Boolean(o.done),
      ...(kind !== "working" ? { kind } : {}),
    };
  });
}

/** Normalize persisted routine exercises. */
export function normalizeWorkoutExerciseArray(raw: unknown): WorkoutExercise[] {
  if (!Array.isArray(raw)) return [];
  const out: WorkoutExercise[] = [];
  for (let i = 0; i < raw.length; i++) {
    const x = raw[i];
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.name !== "string" || !String(o.name).trim()) continue;
    const id = typeof o.id === "string" ? o.id : `mig-${i}-${Date.now()}`;
    const target = typeof o.target === "string" ? o.target : "3 × 10";
    const label = typeof o.label === "string" && o.label.trim() ? o.label.trim() : undefined;
    const sets = normalizeSets(o.sets);
    out.push({
      id,
      name: String(o.name).trim(),
      target,
      ...(label ? { label } : {}),
      sets,
    });
  }
  return out;
}

/** Validate and normalize routines from storage. */
export function normalizeWorkoutTemplates(raw: unknown): WorkoutRoutineTemplate[] {
  if (!Array.isArray(raw)) return [];
  const out: WorkoutRoutineTemplate[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.name !== "string") continue;
    const name = o.name.trim() || "Untitled";
    const dayLabel = typeof o.dayLabel === "string" ? o.dayLabel : "";
    const focus = typeof o.focus === "string" ? o.focus : "";
    const exercises = normalizeWorkoutExerciseArray(o.exercises);
    const warmupItems = Array.isArray(o.warmupItems)
      ? (o.warmupItems as unknown[])
          .map((w) => {
            if (!w || typeof w !== "object") return null;
            const u = (w as Record<string, unknown>).description;
            return typeof u === "string" && u.trim() ? { description: u.trim() } : null;
          })
          .filter((x): x is { description: string } => x != null)
      : undefined;
    const warmupTip = typeof o.warmupTip === "string" && o.warmupTip.trim() ? o.warmupTip.trim() : undefined;
    const sessionTip = typeof o.sessionTip === "string" && o.sessionTip.trim() ? o.sessionTip.trim() : undefined;
    out.push({
      id: o.id,
      name,
      dayLabel,
      focus,
      exercises,
      ...(warmupItems?.length ? { warmupItems } : {}),
      ...(warmupTip ? { warmupTip } : {}),
      ...(sessionTip ? { sessionTip } : {}),
    });
  }
  return out;
}

/**
 * Drop stacked legacy demo routines and duplicate weekday slots.
 * Keeps onboarding/program templates over prototype demo ids when both exist.
 */
export function sanitizeWorkoutTemplates(
  templates: WorkoutRoutineTemplate[],
  opts?: { onboardingComplete?: boolean },
): WorkoutRoutineTemplate[] {
  const normalized = normalizeWorkoutTemplates(templates);
  if (normalized.length === 0) return [];

  const nonLegacy = normalized.filter((t) => !LEGACY_DEMO_WORKOUT_IDS.has(t.id));
  const kept = nonLegacy.length > 0 ? nonLegacy : normalized;

  const byDay = new Map<string, WorkoutRoutineTemplate>();
  const withoutDay: WorkoutRoutineTemplate[] = [];

  for (const t of kept) {
    const day = normalizeDayLabel(t.dayLabel);
    if (!day) {
      withoutDay.push(t);
      continue;
    }
    const prev = byDay.get(day);
    if (!prev) {
      byDay.set(day, t);
      continue;
    }
    const prevIsLegacy = LEGACY_DEMO_WORKOUT_IDS.has(prev.id);
    const nextIsLegacy = LEGACY_DEMO_WORKOUT_IDS.has(t.id);
    if (prevIsLegacy && !nextIsLegacy) byDay.set(day, t);
    else if (!prevIsLegacy && nextIsLegacy) continue;
    else byDay.set(day, t);
  }

  const ordered = [...byDay.values()].sort(
    (a, b) => weekdayMonStartIndex(a.dayLabel) - weekdayMonStartIndex(b.dayLabel),
  );
  const result = [...ordered, ...withoutDay];

  if (opts?.onboardingComplete === false && isLegacyDemoWorkoutTemplates(result)) {
    return [];
  }

  return result;
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

const STANDARD_HABIT_ICONS = new Set<HabitTemplate["icon"]>(["drop", "run", "moon", "pill", "scale", "sun", "ban", "book"]);

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
