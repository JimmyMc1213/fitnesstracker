import { appendExerciseSessionHistory } from "./exerciseSessionHistory";
import { applyStreakEligibility } from "./dailyStreak";
import type { AppState, WorkoutSessionSummary } from "./types";
import { appendWorkoutHistory, buildCompletedWorkoutSession } from "./workoutHistory";
import { buildWorkoutSessionSummary, personalBestsAfterSession } from "./workoutSummary";

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

  const nextState: AppState = applyStreakEligibility({
    ...state,
    exercisePersonalBests,
    exerciseSessionHistoryByKey,
    workoutHistory,
    workoutsCompletedByDay,
    workoutSummary: summary,
    workout: {
      ...w,
      sessionPhase: "idle",
      startedAt: "—",
      sessionDayKey: null,
      sessionStartedAtMs: null,
      sessionTitle: "Workout",
      exercises: [],
    },
  });

  return { state: nextState, summary };
}

export function dismissWorkoutSummary(state: AppState): AppState {
  return { ...state, workoutSummary: null };
}
