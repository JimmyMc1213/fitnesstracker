import type { WorkoutExercise, WorkoutRoutineTemplate, WorkoutSet } from "@newyouai/types";
import { normalizeDayLabel, weekdayMonStartIndex } from "../training/trainingCalendar";
import { normalizeWorkoutSetKind } from "./workoutSetKind";

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
