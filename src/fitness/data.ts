import exerciseLibrary from "./exerciseLibrary";
import type { FoodItem, Habit, HabitTemplate, MacroTotals, WorkoutExercise, WorkoutRoutineTemplate, WorkoutSet, WorkoutState } from "./types";
import { normalizeDayLabel, weekdayMonStartIndex } from "./trainingCalendar";
import { DEFAULT_WATER_DAILY_TARGET_OZ, formatWaterOz } from "./waterIntake";

/** Phase 1 cutting, starting targets; app may auto-adjust weekly from weigh-ins. */
export const DEFAULT_NUTRITION_TARGETS: MacroTotals = { cal: 2200, p: 180, c: 220, f: 65 };
/** @deprecated Use `state.nutritionTargets` or DEFAULT_NUTRITION_TARGETS */
export const TARGETS = DEFAULT_NUTRITION_TARGETS;

/** Day 1 of your 12-week block, used for program-week context (e.g. habits subtitle). */
export const PLAN_START_ISO = "2026-05-07";

export function planWeekIndex(d: Date = new Date(), planStartIso: string = PLAN_START_ISO): number {
  const start = new Date(`${planStartIso}T12:00:00`);
  const diffMs = d.getTime() - start.getTime();
  const w = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, Math.min(12, w));
}

/** 1-based day index within the 12-week block (max 84). */
export function planDayIndex(d: Date = new Date(), planStartIso: string = PLAN_START_ISO): number {
  const start = new Date(`${planStartIso}T12:00:00`);
  const diffMs = d.getTime() - start.getTime();
  const day = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, Math.min(84, day));
}

/** @deprecated Prefer `state.stepsTarget`; kept for call sites that don’t have state yet */
export function stepsTargetForPlanWeek(_week: number): number {
  return 10_000;
}

/** Food rows for search / add, unused in UI for now; kept for a future in-app food database. */
export type FoodDbRow = FoodItem & { id: string };

export const FOOD_DB: FoodDbRow[] = [
  { id: "f1", name: "Whey protein", qty: "1 scoop", cal: 120, p: 25, c: 3, f: 1 },
  { id: "f2", name: "Ground beef 85/15", qty: "4 oz", cal: 240, p: 28, c: 0, f: 14 },
  { id: "f3", name: "Sweet potato", qty: "1 medium", cal: 112, p: 2, c: 26, f: 0 },
  { id: "f4", name: "White rice", qty: "1 cup", cal: 205, p: 4, c: 45, f: 0 },
  { id: "f5", name: "Chicken breast", qty: "6 oz", cal: 280, p: 53, c: 0, f: 6 },
  { id: "f6", name: "Whole eggs", qty: "3 large", cal: 215, p: 19, c: 1, f: 15 },
  { id: "f7", name: "Oats, dry", qty: "1/2 cup", cal: 150, p: 5, c: 27, f: 3 },
  { id: "f8", name: "Banana", qty: "1 large", cal: 121, p: 1, c: 31, f: 0 },
  { id: "f9", name: "Whole milk", qty: "12 oz", cal: 220, p: 12, c: 18, f: 12 },
  { id: "f10", name: "Peanut butter", qty: "2 tbsp", cal: 190, p: 8, c: 7, f: 16 },
  { id: "f11", name: "Greek yogurt", qty: "1 cup", cal: 150, p: 25, c: 9, f: 0 },
  { id: "f12", name: "Almonds", qty: "1 oz", cal: 164, p: 6, c: 6, f: 14 },
];

/** Mon–Fri training; Sat active recovery; Sun rest (see daily tasks). */
export const SPLIT = [
  { id: "mon-upper", day: "Mon", name: "Upper strength", focus: "Bench · Pulldown/pull-up · Accessories" },
  { id: "tue-lower", day: "Tue", name: "Lower + core", focus: "Squat pattern · RDL · Leg press · Core" },
  { id: "wed-push", day: "Wed", name: "Push", focus: "Incline · Chest · Delts · Tri" },
  { id: "thu-pull", day: "Thu", name: "Pull", focus: "Lats · Rows · Rear delts · Bi" },
  { id: "fri-legs", day: "Fri", name: "Legs · shoulders", focus: "Squat · Split squat · Lateral raises · Carries" },
] as const;

/** Built-in Mon–Fri demo split ids (first-launch seed only; not a personalized plan). */
export const DEFAULT_WORKOUT_SPLIT_IDS = new Set<string>(SPLIT.map((s) => s.id));

function ex(id: string, name: string, target: string, setCount: number): WorkoutExercise {
  const n = Math.min(Math.max(setCount, 1), 3);
  return {
    id,
    name,
    target,
    sets: Array.from({ length: n }, () => ({ w: 0, r: 0, done: false })),
  };
}

const TEMPLATE_MON_UPPER: WorkoutExercise[] = [
  ex("u1", "Bench press", "4 × 5-8", 4),
  ex("u2", "Pull-up or lat pulldown", "4 × 6-10", 4),
  ex("u3", "Incline dumbbell press", "3 × 8-10", 3),
  ex("u4", "Seated cable row", "3 × 8-10", 3),
  ex("u5", "Dumbbell shoulder press", "3 × 8-10", 3),
  ex("u6", "Lateral raise", "3 × 12-20", 3),
  ex("u7", "Triceps pushdown", "3 × 10-15", 3),
  ex("u8", "Dumbbell curl", "3 × 10-15", 3),
];

const TEMPLATE_TUE_LOWER: WorkoutExercise[] = [
  ex("l1", "Goblet squat or hack squat", "4 × 6-10", 4),
  ex("l2", "Romanian deadlift (light/moderate)", "3 × 8-10", 3),
  ex("l3", "Leg press", "3 × 10-12", 3),
  ex("l4", "Leg curl", "3 × 10-15", 3),
  ex("l5", "Calf raise", "4 × 10-15", 4),
  ex("l6", "Cable crunch", "3 × 10-15", 3),
  ex("l7", "Plank", "3 × 45-60s", 3),
];

const TEMPLATE_WED_PUSH: WorkoutExercise[] = [
  ex("p1", "Incline bench press", "4 × 8-10", 4),
  ex("p2", "Machine chest press", "3 × 10-12", 3),
  ex("p3", "Cable fly", "3 × 12-15", 3),
  ex("p4", "Seated dumbbell shoulder press", "3 × 8-12", 3),
  ex("p5", "Lateral raise", "4 × 15-25", 4),
  ex("p6", "Rear delt fly", "3 × 15-20", 3),
  ex("p7", "Overhead triceps extension", "3 × 10-15", 3),
  ex("p8", "Push-up", "2 × near failure", 2),
];

const TEMPLATE_THU_PULL: WorkoutExercise[] = [
  ex("b1", "Lat pulldown", "4 × 8-12", 4),
  ex("b2", "Chest-supported row", "4 × 8-12", 4),
  ex("b3", "Single-arm cable row", "3 × 10-12 / arm", 3),
  ex("b4", "Straight-arm pulldown", "3 × 12-15", 3),
  ex("b5", "Face pull", "3 × 15-20", 3),
  ex("b6", "Incline dumbbell curl", "3 × 10-12", 3),
  ex("b7", "Hammer curl", "3 × 10-15", 3),
  ex("b8", "Back extension", "2 × 12-15", 2),
];

const TEMPLATE_FRI_LEGS: WorkoutExercise[] = [
  ex("g1", "Front squat, goblet squat, or hack squat", "3 × 8-10", 3),
  ex("g2", "Bulgarian split squat", "3 × 8-12 / leg", 3),
  ex("g3", "Leg extension", "3 × 12-15", 3),
  ex("g4", "Leg curl", "3 × 12-15", 3),
  ex("g5", "Lateral raise", "5 × 15-25", 5),
  ex("g6", "Cable crunch", "3 × 10-15", 3),
  ex("g7", "Hanging knee raise", "3 × 8-15", 3),
  ex("g8", "Farmer carry", "3 rounds", 3),
];

const TEMPLATES: Record<(typeof SPLIT)[number]["id"], WorkoutExercise[]> = {
  "mon-upper": TEMPLATE_MON_UPPER,
  "tue-lower": TEMPLATE_TUE_LOWER,
  "wed-push": TEMPLATE_WED_PUSH,
  "thu-pull": TEMPLATE_THU_PULL,
  "fri-legs": TEMPLATE_FRI_LEGS,
};

export function workoutTemplateForSplitId(splitId: string): WorkoutExercise[] {
  const t = TEMPLATES[splitId as keyof typeof TEMPLATES];
  if (!t) return TEMPLATE_MON_UPPER.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
  return t.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
}

/** Program default routines (Mon–Fri); used to seed localStorage on first launch. */
export function defaultWorkoutRoutineTemplates(): WorkoutRoutineTemplate[] {
  return SPLIT.map((s) => ({
    id: s.id,
    name: s.name,
    dayLabel: s.day,
    focus: s.focus,
    exercises: workoutTemplateForSplitId(s.id),
  }));
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
    return {
      w: Number(o.w) || 0,
      r: Number(o.r) || 0,
      done: Boolean(o.done),
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

export function isDefaultSeedWorkoutTemplates(templates: WorkoutRoutineTemplate[]): boolean {
  if (templates.length !== SPLIT.length) return false;
  return templates.every((t) => DEFAULT_WORKOUT_SPLIT_IDS.has(t.id));
}

/**
 * Drop stacked demo routines and duplicate weekday slots.
 * Keeps onboarding/program templates over the built-in 5-day seed when both exist.
 */
export function sanitizeWorkoutTemplates(
  templates: WorkoutRoutineTemplate[],
  opts?: { onboardingComplete?: boolean },
): WorkoutRoutineTemplate[] {
  const normalized = normalizeWorkoutTemplates(templates);
  if (normalized.length === 0) return [];

  const nonDefault = normalized.filter((t) => !DEFAULT_WORKOUT_SPLIT_IDS.has(t.id));
  const kept = nonDefault.length > 0 ? nonDefault : normalized;

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
    const prevIsDefault = DEFAULT_WORKOUT_SPLIT_IDS.has(prev.id);
    const nextIsDefault = DEFAULT_WORKOUT_SPLIT_IDS.has(t.id);
    if (prevIsDefault && !nextIsDefault) byDay.set(day, t);
    else if (!prevIsDefault && nextIsDefault) continue;
    else byDay.set(day, t);
  }

  const ordered = [...byDay.values()].sort(
    (a, b) => weekdayMonStartIndex(a.dayLabel) - weekdayMonStartIndex(b.dayLabel),
  );
  const result = [...ordered, ...withoutDay];

  if (opts?.onboardingComplete === false && isDefaultSeedWorkoutTemplates(result)) {
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

/** One line when building or editing a routine. */
export function newTemplateExerciseLine(
  name: string,
  opts?: { label?: string; target?: string; setCount?: number },
): WorkoutExercise {
  const setCount = Math.min(Math.max(opts?.setCount ?? 3, 1), 12);
  const target = (opts?.target ?? "3 × 10").trim() || "3 × 10";
  const label = opts?.label?.trim();
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
  splitId: "mon-upper",
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
  return [
    { id: "h1", name: "Water 1 gal", icon: "drop" },
    { id: "h2", name: "Steps 10k", icon: "run" },
    { id: "h3", name: "Sleep 8h", icon: "moon" },
    { id: "h4", name: "Low-back routine 8 min", icon: "bolt" },
  ];
}

const STANDARD_HABIT_ICONS = new Set<HabitTemplate["icon"]>(["drop", "run", "moon"]);

function stepsHabitLabel(stepsTarget: number): string {
  if (stepsTarget % 1000 === 0) return `Steps ${stepsTarget / 1000}k`;
  return `Steps ${stepsTarget.toLocaleString()}`;
}

/** Habits shown on the plan-ready screen and Home daily habits card after onboarding. */
export function habitTemplatesFromOnboarding(
  stepsTarget: number = 10_000,
  waterDailyTargetOz: number = DEFAULT_WATER_DAILY_TARGET_OZ,
): HabitTemplate[] {
  return [
    { id: "habit-hydration", name: `Water ${formatWaterOz(waterDailyTargetOz)}`, icon: "drop" },
    { id: "habit-steps", name: stepsHabitLabel(stepsTarget), icon: "run" },
  ];
}

export function isDefaultSeedHabitTemplates(templates: HabitTemplate[]): boolean {
  const defaults = defaultHabitTemplates();
  if (templates.length !== defaults.length) return false;
  const defaultIds = new Set(defaults.map((d) => d.id));
  return templates.every((t) => defaultIds.has(t.id));
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
): Habit[] {
  const map = habitsDoneByDay[dateKey] ?? {};
  return templates.map((t) => ({ ...t, done: Boolean(map[t.id]) }));
}

/** @deprecated Use `defaultHabitTemplates` + `buildHabitsForDateKey` */
export function initialHabitsForToday(): Habit[] {
  return defaultHabitTemplates().map((t) => ({ ...t, done: false }));
}

/** Demo trend ~1 lb/wk down for chart */
export const WEIGHT_14 = [172.4, 172.2, 172.0, 171.8, 171.6, 171.5, 171.4, 171.2, 171.0, 170.8, 170.6, 170.4, 170.2, 170.0];

export const WPW_8 = [4, 5, 5, 5, 5, 5, 4, 5];
