import { buildAppStateFromPersisted } from "./buildAppState";
import { loadTasksForToday, localDateKey } from "./dailyPlan";
import { buildHabitsForDateKey, defaultHabitTemplates } from "./data";
import { isJimmySummerPlanTemplates } from "./jimmy-seed-data";
import { calculateMacroTargets } from "./nutritionCalculator";
import { buildWorkoutTemplatesForSplit, primarySplitIdForTemplates } from "./workoutSplitTemplates";
import { sliceFromAppState, type PersistedFitnessSlice } from "./persistFitnessSlice";
import type { AppState, OnboardingProfile } from "./types";

export const PENDING_DISPLAY_NAME_KEY = "fitcoach:pending-display-name";

const LEGACY_EMAILS = (import.meta.env.VITE_LEGACY_USER_EMAILS ?? "jimmy.mccarthy@nodoublesgolfco.com")
  .split(",")
  .map((s: string) => s.trim().toLowerCase())
  .filter(Boolean);

export function isLegacyEmail(email: string | null): boolean {
  if (!email) return false;
  return LEGACY_EMAILS.includes(email.trim().toLowerCase());
}

/** Remote snapshot from before onboarding existed — mark complete so we do not re-prompt. */
export function hasExistingFitnessData(p: Partial<PersistedFitnessSlice> | null | undefined): boolean {
  if (!p) return false;
  if ((p.workoutHistory?.length ?? 0) > 0) return true;
  if ((p.weightLog?.length ?? 0) > 0) return true;
  if (Object.keys(p.workoutsCompletedByDay ?? {}).length > 0) return true;
  if (Object.keys(p.nutritionItemsByDay ?? {}).length > 0) return true;
  if (Object.keys(p.nutritionManualByDay ?? {}).length > 0) return true;
  if (isJimmySummerPlanTemplates(p.workoutTemplates ?? [])) return true;
  return false;
}

export function needsOnboarding(
  email: string | null,
  p: Partial<PersistedFitnessSlice> | null | undefined,
  supabaseConfigured: boolean,
): boolean {
  if (!supabaseConfigured) return false;
  if (isLegacyEmail(email)) return false;
  return p?.onboardingCompleted !== true;
}

/** Blank slate for a brand-new cloud account (no remote row yet). */
export function buildFreshOnboardingSlice(displayName = ""): PersistedFitnessSlice {
  const neutral = buildAppStateFromPersisted(null);
  return sliceFromAppState({
    ...neutral,
    displayName,
    onboardingCompleted: false,
    onboardingProfile: null,
    workoutHistory: [],
    weightLog: [],
    nutritionItemsByDay: {},
    nutritionManualByDay: {},
    workoutsCompletedByDay: {},
    exercisePersonalBests: {},
    exerciseSessionHistoryByKey: {},
    adjustmentHistory: [],
  });
}

export function consumePendingDisplayName(): string | null {
  try {
    const name = sessionStorage.getItem(PENDING_DISPLAY_NAME_KEY)?.trim();
    if (name) sessionStorage.removeItem(PENDING_DISPLAY_NAME_KEY);
    return name || null;
  } catch {
    return null;
  }
}

export function applyOnboardingToState(state: AppState, profile: OnboardingProfile, displayName: string): AppState {
  const nutritionTargets = calculateMacroTargets(
    profile.weightLbs,
    profile.heightIn,
    profile.age,
    profile.gender,
    profile.activityLevel,
    profile.goal,
  );
  const workoutTemplates = buildWorkoutTemplatesForSplit(profile.splitKey);
  const splitId = primarySplitIdForTemplates(workoutTemplates);
  const todayKey = localDateKey(new Date());
  const habitTemplates = state.habitTemplates.length ? state.habitTemplates : defaultHabitTemplates();
  const planStartIso = new Date().toISOString().split("T")[0];

  return {
    ...state,
    displayName: displayName.trim() || state.displayName || "Athlete",
    nutritionTargets,
    workoutTemplates,
    onboardingCompleted: true,
    onboardingProfile: profile,
    planStartIso,
    habitTemplates,
    habits: buildHabitsForDateKey(habitTemplates, state.habitsDoneByDay, todayKey),
    dailyTasks: loadTasksForToday(nutritionTargets, planStartIso, state.stepsTarget, workoutTemplates),
    workout: {
      ...state.workout,
      splitId,
      sessionPhase: "idle",
      startedAt: "—",
      sessionDayKey: null,
      sessionStartedAtMs: null,
      exercises: [],
      sessionTitle: "Workout",
    },
  };
}

export function markOnboardingCompleteSlice(slice: PersistedFitnessSlice): PersistedFitnessSlice {
  return { ...slice, onboardingCompleted: true };
}
