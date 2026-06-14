import {
  applyStreakEligibility,
  createEmptyPersistedSlice,
  dedupeHabitTemplates,
  localDateKey,
  mergePersistedFitnessSlices,
  normalizeProgressPics,
  normalizeProgressPicsLock,
  normalizeSundayCheckInHistory,
  sanitizeWorkoutTemplates,
  stripNutritionProgrammingHabits,
} from "@newyouai/core";
import type { AppState, HabitTemplate, PersistedFitnessSlice } from "@newyouai/types";

import { buildHabitsForDateKey } from "@/lib/habits";
import { defaultHabitTemplatesFromOnboarding } from "@/lib/habitTemplates";
import { ensureMobilityHabitTemplate } from "@/lib/mobilityHabit";

function resolveHabitTemplates(
  templates: HabitTemplate[],
  onboardingComplete: boolean,
  hasLegacyFitnessData: boolean,
): HabitTemplate[] {
  const normalized = stripNutritionProgrammingHabits(dedupeHabitTemplates(templates));
  if (normalized.length > 0) return normalized;
  if (hasLegacyFitnessData || onboardingComplete) return defaultHabitTemplatesFromOnboarding();
  return [];
}

function normalizePersistedSlice(raw: Partial<PersistedFitnessSlice> | null | undefined): PersistedFitnessSlice {
  const empty = createEmptyPersistedSlice();
  if (!raw || Object.keys(raw).length === 0) return empty;

  const merged = mergePersistedFitnessSlices(empty, { ...empty, ...raw });
  const hasLegacyFitnessData =
    Object.keys(merged.workoutsCompletedByDay ?? {}).length > 0 || (merged.weightLog?.length ?? 0) > 0;
  const habitTemplates = ensureMobilityHabitTemplate(
    resolveHabitTemplates(merged.habitTemplates, merged.onboardingComplete, hasLegacyFitnessData),
  );
  const workoutTemplates = sanitizeWorkoutTemplates(merged.workoutTemplates, {
    onboardingComplete: merged.onboardingComplete,
  });

  return {
    ...merged,
    habitTemplates,
    workoutTemplates,
    progressPics: normalizeProgressPics(merged.progressPics),
    progressPicsLock: normalizeProgressPicsLock(merged.progressPicsLock),
    sundayCheckInHistory: normalizeSundayCheckInHistory(merged.sundayCheckInHistory),
  };
}

/** Hydrate runtime AppState from a persisted fitness slice. */
export function buildFitnessAppState(slice: Partial<PersistedFitnessSlice> | null | undefined): AppState {
  const base = normalizePersistedSlice(slice);
  const todayKey = localDateKey(new Date());
  const state: AppState = {
    ...base,
    workoutSummary: null,
    pendingTemplateOrderUpdatePrompt: null,
    habits: buildHabitsForDateKey(base.habitTemplates, base.habitsDoneByDay, todayKey, {
      weightLogged: base.weightLog.some((e) => e.dateKey === todayKey),
    }),
  };
  return applyStreakEligibility(state, todayKey);
}
