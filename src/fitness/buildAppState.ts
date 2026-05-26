import {
  loadTasksForToday,
  localDateKey,
} from "./dailyPlan";
import { sanitizeCoachCopy } from "./exerciseSessionNotes";
import {
  DEFAULT_NUTRITION_TARGETS,
  INITIAL_WORKOUT,
  PLAN_START_ISO,
  buildHabitsForDateKey,
  dedupeHabitTemplates,
  normalizeWorkoutTemplates,
  sanitizeWorkoutTemplates,
} from "./data";
import { defaultDailyHabitTemplates, isLegacyDefaultHabitTemplates } from "./habits";
import { ensureMobilityHabitTemplate, migrateMobilityHabitCompletion } from "./mobilityHabit";
import { normalizeExerciseSessionHistoryByKey } from "./exerciseSessionHistory";
import { normalizeWorkoutHistory } from "./workoutHistory";
import { normalizeExerciseNotesByKey } from "./exerciseNotes";
import { normalizeExperienceLevel } from "./experienceLevel";
import { normalizeEquipmentSetup } from "./equipmentSetup";
import {
  applyStreakEligibility,
  normalizeFitnessStreakSnapshot,
  normalizeStreakEligibleByDay,
  normalizeStreakSessionBaseline,
} from "./dailyStreak";
import { normalizeNutritionMeals } from "./nutritionMeals";
import { mergePersistedNutritionDays, normalizeNutritionPresets, normalizeNutritionUserFoods } from "./nutritionTotals";
import { normalizeOnboardingProfile, DEFAULT_ONBOARDING_PROFILE } from "./onboardingProfile";
import { normalizeOnboardingDraft } from "./onboardingDraft";
import { migratePersistedFitnessSlice } from "./migrateTrainingSchedule";
import { normalizeRestTimerDefaultSeconds, normalizeRestTimerSecondsByExerciseKey } from "./restTimerPreferences";
import { restSecondsFromTrainingDuration } from "./sessionLengthConfig";
import { normalizeAppTheme, readStoredTheme } from "./theme";
import { normalizeNotificationPreferences } from "./notificationPreferences";
import { normalizeUnitPreferences } from "./unitPreferences";
import { normalizeWaterDailyTargetOz, normalizeWaterLogByDay } from "./waterIntake";
import type { PersistedFitnessSlice } from "./persistFitnessSlice";
import type {
  AdjustmentEvent,
  AppState,
  CustomExerciseTemplate,
  ExercisePersonalBest,
  FoodItem,
  HabitTemplate,
  LoggedFood,
  MacroTotals,
  ProgressGoalConfig,
  SubscriptionTier,
  WeightEntry,
  WorkoutState,
} from "./types";

function normalizeWeightMacroNudge(raw: unknown): { deltaCal: number; reason: string } | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const o = raw as Record<string, unknown>;
  const deltaCal = Number(o.deltaCal);
  const reason = typeof o.reason === "string" ? o.reason.trim() : "";
  if (!Number.isFinite(deltaCal) || !reason) return undefined;
  return { deltaCal, reason };
}

function normalizeWeightLog(raw: unknown): WeightEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: WeightEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.dateKey)) continue;
    const weightLbs = Number(o.weightLbs);
    if (!Number.isFinite(weightLbs) || weightLbs <= 0) continue;
    const entry: WeightEntry = { dateKey: o.dateKey, weightLbs };
    if (typeof o.loggedAtIso === "string" && o.loggedAtIso.trim()) entry.loggedAtIso = o.loggedAtIso.trim();
    if (typeof o.photoDataUrl === "string" && o.photoDataUrl.trim()) entry.photoDataUrl = o.photoDataUrl;
    if (typeof o.coachMessage === "string" && o.coachMessage.trim()) entry.coachMessage = o.coachMessage.trim();
    const macroNudge = normalizeWeightMacroNudge(o.macroNudge);
    if (macroNudge) entry.macroNudge = macroNudge;
    out.push(entry);
  }
  return out;
}

function normalizeAdjustmentHistory(raw: unknown): AdjustmentEvent[] {
  if (!Array.isArray(raw)) return [];
  const out: AdjustmentEvent[] = [];
  for (const ev of raw) {
    if (!ev || typeof ev !== "object") continue;
    const o = ev as Record<string, unknown>;
    if (typeof o.weekEndingSunday !== "string" || typeof o.atIso !== "string") continue;
    out.push({
      atIso: o.atIso,
      weekEndingSunday: o.weekEndingSunday,
      weeklyLossLbs: Number(o.weeklyLossLbs) || 0,
      before: o.before as MacroTotals,
      after: o.after as MacroTotals,
      reason: String(o.reason ?? ""),
      recommendedDeltaCal: typeof o.recommendedDeltaCal === "number" ? o.recommendedDeltaCal : undefined,
      appliedDeltaCal: typeof o.appliedDeltaCal === "number" ? o.appliedDeltaCal : undefined,
    });
  }
  return out;
}

function normalizePersistedWorkout(raw: WorkoutState | undefined): WorkoutState {
  if (!raw) return { ...INITIAL_WORKOUT };
  const legacyPhase = raw.sessionPhase as string;
  let sessionPhase: WorkoutState["sessionPhase"] =
    legacyPhase === "idle" ? "idle" : "lifting";
  if (legacyPhase === "prep") sessionPhase = "lifting";

  const base: WorkoutState = {
    ...raw,
    sessionPhase,
    sessionDayKey: typeof raw.sessionDayKey === "string" ? raw.sessionDayKey : null,
    sessionTitle: typeof raw.sessionTitle === "string" ? raw.sessionTitle : "Workout",
    sessionStartedAtMs: typeof raw.sessionStartedAtMs === "number" ? raw.sessionStartedAtMs : null,
  };

  const today = localDateKey(new Date());
  if (sessionPhase === "lifting" && base.sessionDayKey == null) {
    base.sessionDayKey = today;
  }

  if (sessionPhase === "lifting" && base.sessionStartedAtMs == null) {
    base.sessionStartedAtMs = Date.now();
  }

  if (sessionPhase === "idle") {
    return {
      ...base,
      startedAt: "-",
      sessionDayKey: null,
      sessionStartedAtMs: null,
      exercises: [],
      sessionTitle: "Workout",
      sessionCoachNotesByExerciseId: undefined,
      sessionBaselineExerciseOrder: undefined,
    };
  }

  if (sessionPhase === "lifting" && base.sessionDayKey !== today) {
    return {
      ...base,
      sessionPhase: "idle",
      startedAt: "-",
      sessionDayKey: null,
      sessionStartedAtMs: null,
      exercises: [],
      sessionTitle: "Workout",
      sessionCoachNotesByExerciseId: undefined,
      sessionBaselineExerciseOrder: undefined,
    };
  }

  if (base.sessionCoachNotesByExerciseId) {
    const notes: Record<string, string> = {};
    for (const [id, note] of Object.entries(base.sessionCoachNotesByExerciseId)) {
      notes[id] = sanitizeCoachCopy(note);
    }
    base.sessionCoachNotesByExerciseId = notes;
  }

  return base;
}

function normalizeStretchBlockCompletionMap(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(v)) continue;
    out[k] = v.filter((x): x is string => typeof x === "string");
  }
  return out;
}

type LegacyMeal = { items: FoodItem[] };

function migrateLegacyMealsToLog(meals: LegacyMeal[]): LoggedFood[] {
  const flat: FoodItem[] = [];
  for (const m of meals) {
    if (!m?.items?.length) continue;
    for (const it of m.items) flat.push(it);
  }
  const base = Date.now() - flat.length * 1000;
  return flat.map((it, i) => ({ ...it, loggedAtMs: base + i * 1000 }));
}

function normalizeNutritionLog(raw: unknown): LoggedFood[] {
  if (!Array.isArray(raw)) return [];
  const out: LoggedFood[] = [];
  for (let i = 0; i < raw.length; i++) {
    const o = raw[i];
    if (!o || typeof o !== "object") continue;
    const r = o as Record<string, unknown>;
    out.push({
      id: String(r.id ?? `i${i}`),
      name: String(r.name ?? ""),
      qty: String(r.qty ?? ""),
      cal: Number(r.cal) || 0,
      p: Number(r.p) || 0,
      c: Number(r.c) || 0,
      f: Number(r.f) || 0,
      loggedAtMs: typeof r.loggedAtMs === "number" ? r.loggedAtMs : Date.now() - i,
    });
  }
  return out;
}

function nutritionLogFromPersist(p: unknown): LoggedFood[] {
  if (!p || typeof p !== "object") return [];
  const o = p as Record<string, unknown>;
  if (Array.isArray(o.nutritionLog)) return normalizeNutritionLog(o.nutritionLog);
  if (Array.isArray(o.meals)) return migrateLegacyMealsToLog(o.meals as LegacyMeal[]);
  return [];
}

function isValidPlanStartIso(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00`));
}

function normalizeProgressGoal(raw: unknown): ProgressGoalConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const low = Number(o.goalWeightLowLbs ?? o.goalWeightLow);
  const high = Number(o.goalWeightHighLbs ?? o.goalWeightHigh);
  const start = Number(o.progressStartWeightLbs ?? o.startingWeightLbs ?? o.startingWeight);
  if (![low, high, start].every((n) => Number.isFinite(n))) return null;
  if (low <= 0 || high <= 0 || start <= 0) return null;
  return {
    goalWeightLowLbs: low,
    goalWeightHighLbs: high,
    progressStartWeightLbs: start,
  };
}

function normalizeHabitTemplates(raw: unknown): HabitTemplate[] | null {
  if (!Array.isArray(raw)) return null;
  const out: HabitTemplate[] = [];
  const icons = new Set(["drop", "run", "bolt", "moon", "pill", "scale", "sun", "ban", "book"]);
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.name !== "string" || typeof o.icon !== "string") continue;
    const name = o.name.trim();
    if (!name) continue;
    let icon = o.icon;
    if (icon === "water" || icon === "droplet") icon = "drop";
    if (icon === "sleep") icon = "moon";
    if (!icons.has(icon)) icon = "bolt";
    const subtitle = typeof o.subtitle === "string" && o.subtitle.trim() ? o.subtitle.trim() : undefined;
    const type = o.type === "manual" || o.type === "action" ? o.type : undefined;
    const action = o.action === "openWeighIn" ? "openWeighIn" : undefined;
    out.push({
      id: o.id,
      name,
      icon,
      ...(subtitle ? { subtitle } : {}),
      ...(type ? { type } : {}),
      ...(action ? { action } : {}),
    });
  }
  return out.length ? out : null;
}

function resolveHabitTemplates(
  p: Partial<PersistedFitnessSlice> | null | undefined,
  onboardingComplete: boolean,
  hasLegacyFitnessData: boolean,
): HabitTemplate[] {
  const normalized = normalizeHabitTemplates(p?.habitTemplates);
  if (normalized != null) {
    if (onboardingComplete && isLegacyDefaultHabitTemplates(normalized)) {
      return defaultDailyHabitTemplates();
    }
    return dedupeHabitTemplates(normalized);
  }
  if (hasLegacyFitnessData || onboardingComplete) return defaultDailyHabitTemplates();
  return [];
}

function normalizeExercisePersonalBests(raw: unknown): Record<string, ExercisePersonalBest> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, ExercisePersonalBest> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!k.trim() || !v || typeof v !== "object" || Array.isArray(v)) continue;
    const o = v as Record<string, unknown>;
    const maxWeight = Number(o.maxWeight);
    const maxReps = Number(o.maxReps);
    if (!Number.isFinite(maxWeight) || !Number.isFinite(maxReps)) continue;
    if (maxWeight <= 0 && maxReps <= 0) continue;
    out[k.trim().toLowerCase()] = { maxWeight, maxReps };
  }
  return out;
}

function normalizeWorkoutsCompletedByDay(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v === true) out[k] = true;
  }
  return out;
}

function normalizeCustomExercises(raw: unknown): CustomExerciseTemplate[] {
  if (!Array.isArray(raw)) return [];
  const out: CustomExerciseTemplate[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.name !== "string") continue;
    const name = o.name.trim();
    if (!name) continue;
    const label = typeof o.label === "string" ? o.label.trim() : "";
    out.push({ id: o.id, name, label });
  }
  return out;
}

function normalizeHabitsDoneByDay(raw: unknown): Record<string, Record<string, boolean>> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, Record<string, boolean>> = {};
  for (const [day, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !v || typeof v !== "object" || Array.isArray(v)) continue;
    const inner: Record<string, boolean> = {};
    for (const [hid, b] of Object.entries(v as Record<string, unknown>)) {
      if (typeof hid === "string" && typeof b === "boolean") inner[hid] = b;
    }
    out[day] = inner;
  }
  return out;
}

function normalizeSubscriptionTier(raw: unknown): SubscriptionTier | null {
  return raw === "free" || raw === "pro" ? raw : null;
}

/** Build full app state from a persisted JSON blob (localStorage or Supabase). */
export function buildAppStateFromPersisted(p: Partial<PersistedFitnessSlice> | null | undefined): AppState {
  const { slice: migrated } = migratePersistedFitnessSlice(p);
  p = migrated;

  const nutritionTargets = p?.nutritionTargets ? { ...p.nutritionTargets } : { ...DEFAULT_NUTRITION_TARGETS };
  const lastAdj =
    typeof p?.lastAdjustmentSundayKey === "string" ? p.lastAdjustmentSundayKey : null;
  const reviewDone =
    typeof p?.sundayReviewCompletedKey === "string"
      ? p.sundayReviewCompletedKey
      : lastAdj;
  const displayName = typeof p?.displayName === "string" && p.displayName.trim() ? p.displayName.trim() : "";
  const planStartIso =
    typeof p?.planStartIso === "string" && isValidPlanStartIso(p.planStartIso) ? p.planStartIso : PLAN_START_ISO;
  const stepsTarget =
    typeof p?.stepsTarget === "number" && Number.isFinite(p.stepsTarget) && p.stepsTarget >= 1000 && p.stepsTarget <= 100_000
      ? Math.round(p.stepsTarget)
      : 10_000;
  const waterDailyTargetOz = normalizeWaterDailyTargetOz(p?.waterDailyTargetOz);
  const unitPreferences = normalizeUnitPreferences(p?.unitPreferences);
  const onboardingProfile = normalizeOnboardingProfile(p?.onboardingProfile) ?? { ...DEFAULT_ONBOARDING_PROFILE };
  const hasLegacyFitnessData =
    Object.keys(p?.workoutsCompletedByDay ?? {}).length > 0 || (p?.weightLog?.length ?? 0) > 0;
  const onboardingComplete = p?.onboardingComplete === true || hasLegacyFitnessData;
  const habitTemplates = ensureMobilityHabitTemplate(
    resolveHabitTemplates(p, onboardingComplete, hasLegacyFitnessData),
  );
  const habitsDoneByDay = migrateMobilityHabitCompletion(normalizeHabitsDoneByDay(p?.habitsDoneByDay));
  const todayKey = localDateKey(new Date());
  const weightLog = normalizeWeightLog(p?.weightLog);
  const { nutritionManualByDay, nutritionItemsByDay } = mergePersistedNutritionDays(
    p?.nutritionManualByDay,
    p?.nutritionItemsByDay,
  );
  const workoutTemplates = sanitizeWorkoutTemplates(
    p?.workoutTemplates === undefined || p?.workoutTemplates === null
      ? []
      : normalizeWorkoutTemplates(p.workoutTemplates),
    { onboardingComplete },
  );
  const onboardingDraft = onboardingComplete ? null : normalizeOnboardingDraft(p?.onboardingDraft);
  const subscriptionTier = normalizeSubscriptionTier(p?.subscriptionTier);
  const theme = p?.theme != null ? normalizeAppTheme(p.theme) : readStoredTheme();
  const workoutDaysPerWeek = onboardingProfile.workoutDaysPerWeek;

  const baseState: AppState = {
    displayName,
    habitTemplates,
    habitsDoneByDay,
    planStartIso,
    stepsTarget,
    nutritionLog: nutritionLogFromPersist(p ?? null),
    nutritionManualByDay,
    nutritionItemsByDay,
    nutritionPresets: normalizeNutritionPresets(p?.nutritionPresets),
    nutritionUserFoods: normalizeNutritionUserFoods(p?.nutritionUserFoods),
    nutritionMeals: normalizeNutritionMeals(p?.nutritionMeals),
    workout: normalizePersistedWorkout(p?.workout),
    customExercises: normalizeCustomExercises(p?.customExercises),
    exerciseNotesByKey: normalizeExerciseNotesByKey(p?.exerciseNotesByKey),
    workoutTemplates,
    workoutsCompletedByDay: normalizeWorkoutsCompletedByDay(p?.workoutsCompletedByDay),
    streakEligibleByDay: normalizeStreakEligibleByDay(p?.streakEligibleByDay),
    fitnessStreakSnapshot: normalizeFitnessStreakSnapshot(p?.fitnessStreakSnapshot),
    streakSessionBaseline: normalizeStreakSessionBaseline(p?.streakSessionBaseline),
    streakLossNoticeDismissedForKey:
      typeof p?.streakLossNoticeDismissedForKey === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(p.streakLossNoticeDismissedForKey)
        ? p.streakLossNoticeDismissedForKey
        : null,
    exercisePersonalBests: normalizeExercisePersonalBests(p?.exercisePersonalBests),
    exerciseSessionHistoryByKey: normalizeExerciseSessionHistoryByKey(p?.exerciseSessionHistoryByKey),
    workoutHistory: normalizeWorkoutHistory(p?.workoutHistory),
    workoutSummary: null,
    pendingTemplateOrderUpdatePrompt: null,
    habits: buildHabitsForDateKey(habitTemplates, habitsDoneByDay, todayKey, {
      weightLogged: weightLog.some((e) => e.dateKey === todayKey),
    }),
    dailyTasks: loadTasksForToday(nutritionTargets, planStartIso, stepsTarget, workoutTemplates, workoutDaysPerWeek),
    nutritionTargets,
    weightLog,
    lastAdjustmentSundayKey: lastAdj,
    sundayReviewCompletedKey: reviewDone,
    adjustmentHistory: normalizeAdjustmentHistory(p?.adjustmentHistory),
    nightlyStretchCompletedArizonaKey:
      typeof p?.nightlyStretchCompletedArizonaKey === "string"
        ? p.nightlyStretchCompletedArizonaKey
        : null,
    nightlyStretchBlockIdsByArizonaDay: normalizeStretchBlockCompletionMap(p?.nightlyStretchBlockIdsByArizonaDay),
    progressGoal: normalizeProgressGoal(p?.progressGoal),
    unitPreferences,
    unitPreferencesChosen:
      p?.unitPreferencesChosen === true ||
      Boolean(p?.unitPreferences) ||
      (p?.weightLog?.length ?? 0) > 0 ||
      p?.onboardingComplete === true,
    experienceLevel: normalizeExperienceLevel(p?.experienceLevel),
    experienceLevelChosen:
      p?.experienceLevelChosen === true || hasLegacyFitnessData || p?.onboardingComplete === true,
    equipmentSetup: normalizeEquipmentSetup(p?.equipmentSetup),
    equipmentSetupChosen:
      p?.equipmentSetupChosen === true || hasLegacyFitnessData || p?.onboardingComplete === true,
    restTimerDefaultSeconds:
      typeof p?.restTimerDefaultSeconds === "number"
        ? normalizeRestTimerDefaultSeconds(p.restTimerDefaultSeconds)
        : onboardingProfile.sessionDuration != null
          ? restSecondsFromTrainingDuration(onboardingProfile.sessionDuration)
          : normalizeRestTimerDefaultSeconds(undefined),
    restTimerSecondsByExerciseKey: normalizeRestTimerSecondsByExerciseKey(p?.restTimerSecondsByExerciseKey),
    onboardingProfile,
    onboardingComplete,
    onboardingDraft,
    theme,
    subscriptionTier,
    notificationPreferences: normalizeNotificationPreferences(p?.notificationPreferences),
    waterLogByDay: normalizeWaterLogByDay(p?.waterLogByDay),
    waterDailyTargetOz,
  };

  return applyStreakEligibility(baseState, todayKey);
}
