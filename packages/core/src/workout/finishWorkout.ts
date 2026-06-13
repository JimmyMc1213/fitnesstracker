import type { AppState, PendingTemplateOrderUpdatePrompt, WorkoutSessionSummary } from "@newyouai/types";

import { applyStreakEligibility } from "../streak/dailyStreak";
import { appendExerciseSessionHistory } from "./exerciseSessionHistoryAppend";
import { appendWorkoutHistory, buildCompletedWorkoutSession } from "./workoutHistorySession";
import { buildWorkoutSessionSummary, personalBestsAfterSession } from "./workoutSummarySession";
import {
  applyOrderToTemplate,
  detectExerciseOrderChange,
  exerciseOrderKeys,
} from "./workoutTemplateOrder";

export type FinishWorkoutResult = {
  state: AppState;
  summary: WorkoutSessionSummary;
};

function loggedSetCount(workout: AppState["workout"]): number {
  return workout.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
}

/** Complete the active workout: snapshot summary, update PRs, clear session, mark day done. */
export function finishWorkout(state: AppState, endedAtMs = Date.now()): FinishWorkoutResult | null {
  const w = state.workout;
  if (w.sessionPhase !== "lifting") return null;
  if (loggedSetCount(w) === 0) return null;

  const summary = buildWorkoutSessionSummary(w, state.exercisePersonalBests, endedAtMs, state.unitPreferences.weightUnit);
  const exercisePersonalBests = personalBestsAfterSession(w.exercises, state.exercisePersonalBests);
  const exerciseSessionHistoryByKey = appendExerciseSessionHistory(
    state.exerciseSessionHistoryByKey ?? {},
    w,
    endedAtMs,
  );
  const completedSession = buildCompletedWorkoutSession(w, endedAtMs, summary.durationSec);
  const workoutHistory = completedSession
    ? appendWorkoutHistory(state.workoutHistory ?? [], completedSession)
    : state.workoutHistory ?? [];
  const dayKey = w.sessionDayKey;
  const workoutsCompletedByDay =
    dayKey != null ? { ...state.workoutsCompletedByDay, [dayKey]: true } : state.workoutsCompletedByDay;

  const currentOrderKeys = exerciseOrderKeys(w.exercises);
  const orderChanged =
    w.splitId !== "" && detectExerciseOrderChange(w.sessionBaselineExerciseOrder, currentOrderKeys);
  let pendingTemplateOrderUpdatePrompt: PendingTemplateOrderUpdatePrompt | null = null;
  if (orderChanged) {
    const tpl = state.workoutTemplates.find((t) => t.id === w.splitId);
    pendingTemplateOrderUpdatePrompt = {
      templateId: w.splitId,
      templateName: tpl?.name ?? w.sessionTitle,
      exerciseOrderKeys: currentOrderKeys,
    };
  }

  const nextState: AppState = applyStreakEligibility({
    ...state,
    exercisePersonalBests,
    exerciseSessionHistoryByKey,
    workoutHistory,
    workoutsCompletedByDay,
    workoutSummary: summary,
    pendingTemplateOrderUpdatePrompt,
    workout: {
      ...w,
      sessionPhase: "idle",
      startedAt: "-",
      sessionDayKey: null,
      sessionStartedAtMs: null,
      sessionTitle: "Workout",
      exercises: [],
      sessionCoachNotesByExerciseId: undefined,
      sessionBaselineExerciseOrder: undefined,
    },
  });

  return { state: nextState, summary };
}

export function applyTemplateOrderUpdate(state: AppState): AppState {
  const prompt = state.pendingTemplateOrderUpdatePrompt;
  if (!prompt) return state;

  const index = state.workoutTemplates.findIndex((t) => t.id === prompt.templateId);
  if (index < 0) {
    return { ...state, pendingTemplateOrderUpdatePrompt: null };
  }

  const template = state.workoutTemplates[index]!;
  const nextTemplates = [...state.workoutTemplates];
  nextTemplates[index] = applyOrderToTemplate(template, prompt.exerciseOrderKeys);

  return {
    ...state,
    workoutTemplates: nextTemplates,
    pendingTemplateOrderUpdatePrompt: null,
  };
}

export function dismissTemplateOrderUpdatePrompt(state: AppState): AppState {
  return { ...state, pendingTemplateOrderUpdatePrompt: null };
}

export function dismissWorkoutSummary(state: AppState): AppState {
  return {
    ...state,
    workoutSummary: null,
    pendingTemplateOrderUpdatePrompt: null,
  };
}
