import { nutritionPresetFingerprint } from "./nutritionTotals";
import { mergeExercisePersonalBests } from "./workoutSummary";
import type { PersistedFitnessSlice } from "./persistFitnessSlice";
import { normalizeUnitPreferences } from "./unitPreferences";
import { normalizeExperienceLevel } from "./experienceLevel";
import { normalizeEquipmentSetup } from "./equipmentSetup";
import type {
  AdjustmentEvent,
  EquipmentSetup,
  ExperienceLevel,
  LoggedFood,
  NutritionLoggedItem,
  NutritionPreset,
  ProgressGoalConfig,
  UnitPreferences,
  WeightEntry,
  WorkoutState,
} from "./types";

function weightEntryTimestamp(e: WeightEntry): number {
  if (e.loggedAtIso) {
    const t = Date.parse(e.loggedAtIso);
    if (Number.isFinite(t)) return t;
  }
  return Date.parse(`${e.dateKey}T12:00:00`);
}

function mergeWeightLog(a: WeightEntry[], b: WeightEntry[]): WeightEntry[] {
  const byDay = new Map<string, WeightEntry>();
  for (const e of [...a, ...b]) {
    const prev = byDay.get(e.dateKey);
    if (!prev) byDay.set(e.dateKey, e);
    else {
      const newer = weightEntryTimestamp(e) >= weightEntryTimestamp(prev) ? e : prev;
      const older = newer === e ? prev : e;
      byDay.set(e.dateKey, {
        ...older,
        ...newer,
        photoDataUrl: newer.photoDataUrl ?? older.photoDataUrl,
        loggedAtIso: newer.loggedAtIso ?? older.loggedAtIso,
      });
    }
  }
  return [...byDay.entries()].sort(([ka], [kb]) => ka.localeCompare(kb)).map(([, v]) => v);
}

function mergeHabitsDoneByDay(
  a: Record<string, Record<string, boolean>>,
  b: Record<string, Record<string, boolean>>,
): Record<string, Record<string, boolean>> {
  const days = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, Record<string, boolean>> = {};
  for (const d of days) {
    const ia = a[d] ?? {};
    const ib = b[d] ?? {};
    const ids = new Set([...Object.keys(ia), ...Object.keys(ib)]);
    const merged: Record<string, boolean> = {};
    for (const id of ids) merged[id] = Boolean(ia[id] || ib[id]);
    out[d] = merged;
  }
  return out;
}

function mergeWorkoutsCompleted(
  a: Record<string, boolean>,
  b: Record<string, boolean>,
): Record<string, boolean> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, boolean> = {};
  for (const k of keys) out[k] = Boolean(a[k] || b[k]);
  return out;
}

function mergeNutritionItemsByDay(
  a: Record<string, NutritionLoggedItem[]>,
  b: Record<string, NutritionLoggedItem[]>,
): Record<string, NutritionLoggedItem[]> {
  const days = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, NutritionLoggedItem[]> = {};
  for (const d of days) {
    const la = a[d] ?? [];
    const lb = b[d] ?? [];
    const byId = new Map<string, NutritionLoggedItem>();
    for (const it of [...la, ...lb]) byId.set(it.id, it);
    out[d] = [...byId.values()];
  }
  return out;
}

function mergeNutritionManualByDay(
  a: Record<string, { cal: number; p: number; c: number; f: number }>,
  b: Record<string, { cal: number; p: number; c: number; f: number }>,
): Record<string, { cal: number; p: number; c: number; f: number }> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, { cal: number; p: number; c: number; f: number }> = {};
  for (const k of keys) {
    const ma = a[k];
    const mb = b[k];
    if (!ma) out[k] = { ...mb! };
    else if (!mb) out[k] = { ...ma };
    else {
      out[k] = {
        cal: Math.max(ma.cal, mb.cal),
        p: Math.max(ma.p, mb.p),
        c: Math.max(ma.c, mb.c),
        f: Math.max(ma.f, mb.f),
      };
    }
  }
  return out;
}

function mergeNutritionPresets(a: NutritionPreset[], b: NutritionPreset[]): NutritionPreset[] {
  const byFp = new Map<string, NutritionPreset>();
  for (const p of [...a, ...b]) {
    const fp = nutritionPresetFingerprint(p.name, p);
    const prev = byFp.get(fp);
    if (!prev || p.lastUsedAtMs >= prev.lastUsedAtMs) byFp.set(fp, p);
  }
  return [...byFp.values()].sort((x, y) => y.lastUsedAtMs - x.lastUsedAtMs).slice(0, 150);
}

function mergeNutritionLog(a: LoggedFood[], b: LoggedFood[]): LoggedFood[] {
  const byId = new Map<string, LoggedFood>();
  for (const x of [...a, ...b]) byId.set(x.id, x);
  return [...byId.values()].sort((x, y) => y.loggedAtMs - x.loggedAtMs);
}

function mergeAdjustmentHistory(a: AdjustmentEvent[], b: AdjustmentEvent[]): AdjustmentEvent[] {
  const byIso = new Map<string, AdjustmentEvent>();
  for (const x of [...a, ...b]) byIso.set(`${x.atIso}|${x.weekEndingSunday}`, x);
  return [...byIso.values()].sort((x, y) => x.atIso.localeCompare(y.atIso));
}

function mergeById<T extends { id: string }>(a: T[], b: T[], cap = 500): T[] {
  const byId = new Map<string, T>();
  for (const x of [...a, ...b]) byId.set(x.id, x);
  return [...byId.values()].slice(0, cap);
}

function mergeStretchBlocks(a: Record<string, string[]>, b: Record<string, string[]>): Record<string, string[]> {
  const days = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, string[]> = {};
  for (const d of days) {
    const set = new Set([...(a[d] ?? []), ...(b[d] ?? [])]);
    out[d] = [...set];
  }
  return out;
}

function mergeWorkoutState(local: WorkoutState, remote: WorkoutState): WorkoutState {
  if (local.sessionPhase === "lifting") return local;
  if (remote.sessionPhase === "lifting") return remote;
  return remote;
}

function mergeProgressGoal(
  local: ProgressGoalConfig | null | undefined,
  remote: ProgressGoalConfig | null | undefined,
): ProgressGoalConfig | null {
  return remote ?? local ?? null;
}

function mergeUnitPreferences(local: UnitPreferences | undefined, remote: UnitPreferences | undefined): UnitPreferences {
  return normalizeUnitPreferences(remote ?? local);
}

function mergeExperienceLevel(local: ExperienceLevel, remote: ExperienceLevel): ExperienceLevel {
  if (local === remote) return local;
  const rank: Record<ExperienceLevel, number> = { beginner: 0, intermediate: 1, advanced: 2 };
  return rank[remote] >= rank[local] ? remote : local;
}

function mergeEquipmentSetup(local: EquipmentSetup, remote: EquipmentSetup): EquipmentSetup {
  return normalizeEquipmentSetup(remote ?? local);
}

/**
 * Union-merge two device snapshots so simultaneous edits on phone + desktop lose as little as possible.
 * When both sides edited the same habit day or workout-completion flag, done=true wins.
 */
export function mergePersistedFitnessSlices(local: PersistedFitnessSlice, remote: PersistedFitnessSlice): PersistedFitnessSlice {
  return {
    nutritionLog: mergeNutritionLog(local.nutritionLog, remote.nutritionLog),
    nutritionManualByDay: mergeNutritionManualByDay(local.nutritionManualByDay, remote.nutritionManualByDay),
    nutritionItemsByDay: mergeNutritionItemsByDay(local.nutritionItemsByDay, remote.nutritionItemsByDay),
    nutritionPresets: mergeNutritionPresets(local.nutritionPresets, remote.nutritionPresets),
    nutritionTargets: { ...local.nutritionTargets, ...remote.nutritionTargets },
    weightLog: mergeWeightLog(local.weightLog, remote.weightLog),
    lastAdjustmentSundayKey:
      [local.lastAdjustmentSundayKey, remote.lastAdjustmentSundayKey]
        .filter(Boolean)
        .sort()
        .pop() ?? local.lastAdjustmentSundayKey,
    sundayReviewCompletedKey:
      [local.sundayReviewCompletedKey, remote.sundayReviewCompletedKey]
        .filter(Boolean)
        .sort()
        .pop() ?? local.sundayReviewCompletedKey,
    adjustmentHistory: mergeAdjustmentHistory(local.adjustmentHistory, remote.adjustmentHistory),
    workout: mergeWorkoutState(local.workout, remote.workout),
    customExercises: mergeById(local.customExercises, remote.customExercises),
    exerciseNotesByKey: { ...local.exerciseNotesByKey, ...remote.exerciseNotesByKey },
    workoutTemplates: mergeById(local.workoutTemplates, remote.workoutTemplates, 80),
    workoutsCompletedByDay: mergeWorkoutsCompleted(local.workoutsCompletedByDay, remote.workoutsCompletedByDay),
    exercisePersonalBests: mergeExercisePersonalBests(local.exercisePersonalBests, remote.exercisePersonalBests),
    nightlyStretchCompletedArizonaKey:
      local.nightlyStretchCompletedArizonaKey && remote.nightlyStretchCompletedArizonaKey
        ? local.nightlyStretchCompletedArizonaKey.localeCompare(remote.nightlyStretchCompletedArizonaKey) >= 0
          ? local.nightlyStretchCompletedArizonaKey
          : remote.nightlyStretchCompletedArizonaKey
        : local.nightlyStretchCompletedArizonaKey ?? remote.nightlyStretchCompletedArizonaKey,
    nightlyStretchBlockIdsByArizonaDay: mergeStretchBlocks(
      local.nightlyStretchBlockIdsByArizonaDay,
      remote.nightlyStretchBlockIdsByArizonaDay,
    ),
    displayName:
      (remote.displayName?.trim().length ?? 0) >= (local.displayName?.trim().length ?? 0)
        ? remote.displayName.trim()
        : local.displayName.trim(),
    habitTemplates: mergeById(local.habitTemplates, remote.habitTemplates, 40),
    habitsDoneByDay: mergeHabitsDoneByDay(local.habitsDoneByDay, remote.habitsDoneByDay),
    planStartIso: remote.planStartIso || local.planStartIso,
    stepsTarget: Math.max(local.stepsTarget, remote.stepsTarget),
    progressGoal: mergeProgressGoal(local.progressGoal, remote.progressGoal),
    unitPreferences: mergeUnitPreferences(
      normalizeUnitPreferences(local.unitPreferences),
      normalizeUnitPreferences(remote.unitPreferences),
    ),
    unitPreferencesChosen: Boolean(local.unitPreferencesChosen || remote.unitPreferencesChosen),
    experienceLevel: mergeExperienceLevel(
      normalizeExperienceLevel(local.experienceLevel),
      normalizeExperienceLevel(remote.experienceLevel),
    ),
    experienceLevelChosen: Boolean(local.experienceLevelChosen || remote.experienceLevelChosen),
    equipmentSetup: mergeEquipmentSetup(
      normalizeEquipmentSetup(local.equipmentSetup),
      normalizeEquipmentSetup(remote.equipmentSetup),
    ),
    equipmentSetupChosen: Boolean(local.equipmentSetupChosen || remote.equipmentSetupChosen),
    onboardingProfile: remote.onboardingProfile ?? local.onboardingProfile ?? null,
    onboardingComplete: Boolean(local.onboardingComplete || remote.onboardingComplete),
  };
}
