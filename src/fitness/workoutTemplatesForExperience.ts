import {
  adjustWorkoutTargetForExperience,
  DEFAULT_EXPERIENCE_LEVEL,
  experienceWeightMultiplier,
} from "./experienceLevel";
import { defaultWorkoutRoutineTemplates } from "./data";
import type { ExperienceLevel, WorkoutExercise, WorkoutRoutineTemplate } from "./types";

/** Intermediate baseline starting weights (lbs) keyed by normalized exercise name. */
const BASELINE_START_WEIGHTS_LBS: Record<string, number> = {
  "bench press": 95,
  "pull-up or lat pulldown": 80,
  "incline dumbbell press": 30,
  "seated cable row": 70,
  "dumbbell shoulder press": 25,
  "lateral raise": 10,
  "triceps pushdown": 40,
  "dumbbell curl": 20,
  "goblet squat or hack squat": 40,
  "romanian deadlift (light/moderate)": 95,
  "leg press": 180,
  "leg curl": 50,
  "calf raise": 80,
  "cable crunch": 50,
  plank: 0,
  "incline bench press": 95,
  "machine chest press": 90,
  "cable fly": 25,
  "seated dumbbell shoulder press": 30,
  "rear delt fly": 10,
  "overhead triceps extension": 30,
  "push-up": 0,
  "lat pulldown": 80,
  "chest-supported row": 70,
  "single-arm cable row": 40,
  "straight-arm pulldown": 40,
  "face pull": 25,
  "incline dumbbell curl": 20,
  "hammer curl": 20,
  "back extension": 0,
  "front squat, goblet squat, or hack squat": 40,
  "bulgarian split squat": 25,
  "leg extension": 60,
  "hanging knee raise": 0,
  "farmer carry": 50,
};

function normalizeExerciseKey(name: string): string {
  return name.trim().toLowerCase();
}

function startingWeightForExercise(name: string, level: ExperienceLevel): number {
  const key = normalizeExerciseKey(name);
  const baseline = BASELINE_START_WEIGHTS_LBS[key] ?? 0;
  if (baseline <= 0) return 0;
  const scaled = baseline * experienceWeightMultiplier(level);
  return Math.round(scaled / 5) * 5;
}

function applyExperienceToExercise(exercise: WorkoutExercise, level: ExperienceLevel): WorkoutExercise {
  const target = adjustWorkoutTargetForExperience(exercise.target, level);
  const startW = startingWeightForExercise(exercise.name, level);
  return {
    ...exercise,
    target,
    sets: exercise.sets.map((s) => ({
      ...s,
      w: startW > 0 ? startW : s.w,
      r: 0,
      done: false,
    })),
  };
}

export function workoutTemplatesForExperience(
  level: ExperienceLevel = DEFAULT_EXPERIENCE_LEVEL,
): WorkoutRoutineTemplate[] {
  return defaultWorkoutRoutineTemplates().map((tpl) => ({
    ...tpl,
    exercises: tpl.exercises.map((e) => applyExperienceToExercise(e, level)),
  }));
}
