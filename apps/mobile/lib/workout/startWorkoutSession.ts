import {
  autofillExerciseSets,
  buildSessionCoachNotesByExerciseId,
  exerciseNoteKey,
  localDateKey,
} from "@newyouai/core";
import type { AppState } from "@newyouai/types";

import { cloneExercisesForNewSession } from "./cloneExercisesForNewSession";
import { formatSessionClock } from "./formatSessionClock";

export function startEmptyWorkoutState(prev: AppState): AppState {
  return {
    ...prev,
    workout: {
      ...prev.workout,
      splitId: "",
      startedAt: formatSessionClock(new Date()),
      sessionDayKey: localDateKey(new Date()),
      sessionPhase: "lifting",
      sessionStartedAtMs: Date.now(),
      sessionTitle: "Workout",
      exercises: [],
      sessionCoachNotesByExerciseId: {},
      sessionBaselineExerciseOrder: undefined,
    },
  };
}

export function startTemplateWorkoutState(prev: AppState, templateId: string): AppState {
  const tpl = prev.workoutTemplates.find((t) => t.id === templateId);
  if (!tpl) return prev;

  const exercises = cloneExercisesForNewSession(tpl.exercises).map((ex) =>
    autofillExerciseSets(ex, prev.workoutHistory),
  );

  return {
    ...prev,
    workout: {
      ...prev.workout,
      splitId: templateId,
      exercises,
      startedAt: formatSessionClock(new Date()),
      sessionDayKey: localDateKey(new Date()),
      sessionPhase: "lifting",
      sessionStartedAtMs: Date.now(),
      sessionTitle: tpl.name,
      sessionCoachNotesByExerciseId: buildSessionCoachNotesByExerciseId(
        prev.workoutHistory,
        exercises,
        prev.onboardingProfile?.trainingStyle,
      ),
      sessionBaselineExerciseOrder: tpl.exercises.map((e) => exerciseNoteKey(e.name, e.label)),
    },
  };
}
