import type { AppState, WorkoutSessionSummary } from "./types";
import { buildWorkoutSessionSummary, personalBestsAfterSession } from "./workoutSummary";

export type FinishWorkoutResult = {
  state: AppState;
  summary: WorkoutSessionSummary;
};

/** Complete the active workout: snapshot summary, update PRs, clear session, mark day done. */
export function finishWorkout(state: AppState, endedAtMs = Date.now()): FinishWorkoutResult | null {
  const w = state.workout;
  if (w.sessionPhase !== "lifting") return null;

  const summary = buildWorkoutSessionSummary(w, state.exercisePersonalBests, endedAtMs);
  const exercisePersonalBests = personalBestsAfterSession(w.exercises, state.exercisePersonalBests);
  const dayKey = w.sessionDayKey;
  const workoutsCompletedByDay =
    dayKey != null ? { ...state.workoutsCompletedByDay, [dayKey]: true } : state.workoutsCompletedByDay;

  const nextState: AppState = {
    ...state,
    exercisePersonalBests,
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
  };

  return { state: nextState, summary };
}

export function dismissWorkoutSummary(state: AppState): AppState {
  return { ...state, workoutSummary: null };
}
