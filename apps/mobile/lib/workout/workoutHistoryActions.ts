import {
  autofillExerciseSets,
  buildSessionCoachNotesByExerciseId,
  localDateKey,
} from "@newyouai/core";
import type {
  AppState,
  CompletedWorkoutSession,
  WorkoutExercise,
  WorkoutRoutineTemplate,
} from "@newyouai/types";

import { cloneExercisesForNewSession } from "@/lib/workout/cloneExercisesForNewSession";
import { defaultExerciseTarget } from "@/lib/workout/exercisePrescriptionDefaults";
import { formatSessionClock } from "@/lib/workout/formatSessionClock";
import { templateFocusFromExercises } from "@/lib/workout/routineTemplateFocus";

/** Template-style exercises from a logged session (blank sets, fresh ids). */
export function completedSessionToTemplateExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  const t = Date.now();
  return exercises.map((e, i) => {
    const setCount = Math.max(e.sets.length, 1);
    const label = e.label?.trim();
    return {
      id: `te${t}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      name: e.name,
      ...(label ? { label } : {}),
      target: e.target.trim() || defaultExerciseTarget(e.name, label, setCount),
      sets: Array.from({ length: setCount }, () => ({ w: 0, r: 0, done: false })),
    };
  });
}

export function templateFromCompletedSession(
  session: CompletedWorkoutSession,
  opts?: { id?: string; name?: string; dayLabel?: string; focus?: string },
): WorkoutRoutineTemplate {
  const exercises = completedSessionToTemplateExercises(session.exercises);
  return {
    id: opts?.id ?? `tpl_${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: opts?.name?.trim() || session.title.trim() || "Workout",
    dayLabel: opts?.dayLabel?.trim() ?? "",
    focus: opts?.focus?.trim() || templateFocusFromExercises(exercises),
    exercises,
  };
}

export function appendTemplateFromHistory(state: AppState, session: CompletedWorkoutSession): AppState {
  const next = templateFromCompletedSession(session);
  return {
    ...state,
    workoutTemplates: [...state.workoutTemplates, next],
  };
}

export function replaceTemplateFromHistory(
  state: AppState,
  session: CompletedWorkoutSession,
  templateId: string,
): AppState {
  const existing = state.workoutTemplates.find((t) => t.id === templateId);
  if (!existing) return state;
  const exercises = completedSessionToTemplateExercises(session.exercises);
  const nextTemplate: WorkoutRoutineTemplate = {
    ...existing,
    focus: templateFocusFromExercises(exercises),
    exercises,
  };
  return {
    ...state,
    workoutTemplates: state.workoutTemplates.map((t) => (t.id === templateId ? nextTemplate : t)),
  };
}

export function startWorkoutFromHistory(state: AppState, session: CompletedWorkoutSession): AppState {
  const now = new Date();
  const exercises = cloneExercisesForNewSession(session.exercises).map((ex) =>
    autofillExerciseSets(ex, state.workoutHistory),
  );
  return {
    ...state,
    workout: {
      splitId: "",
      exercises,
      startedAt: formatSessionClock(now),
      sessionDayKey: localDateKey(now),
      sessionPhase: "lifting",
      sessionStartedAtMs: Date.now(),
      sessionTitle: session.title.trim() || "Workout",
      sessionCoachNotesByExerciseId: buildSessionCoachNotesByExerciseId(
        state.workoutHistory,
        exercises,
        state.onboardingProfile?.trainingStyle,
      ),
      sessionBaselineExerciseOrder: undefined,
    },
  };
}

export function hasActiveWorkoutSession(state: AppState): boolean {
  return state.workout.sessionPhase === "lifting";
}
