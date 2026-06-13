/**
 * Rule-based per-exercise session coach notes (FTI-54).
 * Uses workoutHistory (per-set snapshots), same source as workoutAutofill.
 */
import {
  REPS_ONLY_ADD_WEIGHT_THRESHOLD,
  TIME_PROGRESSION_STEP_SEC,
  TIME_STRUGGLE_DROP_SEC,
  carryUsesMeters,
  getExerciseProgressionKind,
} from "./exerciseProgressionProfile";
import { findBrowsableExercise } from "./exerciseLookup";
import { findLastLoggedExerciseSets } from "./workoutAutofill";
import type { CompletedWorkoutSession, TrainingStyle, WorkoutExercise } from "@newyouai/types";
import { describeExerciseRepRange, getExerciseRepBounds } from "./workoutTarget";

export type ExerciseSessionNoteContext = {
  workoutHistory: CompletedWorkoutSession[] | undefined;
  trainingStyle?: TrainingStyle;
};

/** Strip em/en dashes and multiplication signs from legacy or cached coach copy. */
export function sanitizeCoachCopy(text: string): string {
  return text
    .replace(/\u2014/g, ", ")
    .replace(/\u2013/g, "-")
    .replace(/(\d)\s*\u00d7\s*(\d)/g, "$1x$2")
    .replace(/\u00d7/g, "x")
    .replace(/\s+,/g, ",")
    .replace(/,\s+,/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

type TopSet = { w: number; r: number };

type SessionGoal = {
  weight: number | null;
  reps: number;
  repRangeLabel: string;
};

type CoachNoteParts = {
  focus: string | null;
  goal: string;
  struggle: string;
};

function getExerciseFocus(exercise: WorkoutExercise): string | null {
  const meta = findBrowsableExercise(exercise.name, exercise.label);
  return meta?.coachNote?.trim() ?? null;
}

function getTopWeightedSet(lastSets: { w: number; r: number }[]): TopSet | null {
  const logged = lastSets.filter((s) => s.w > 0 && s.r > 0);
  if (logged.length === 0) return null;
  const topWeight = Math.max(...logged.map((s) => s.w));
  const maxReps = Math.max(...logged.filter((s) => s.w === topWeight).map((s) => s.r));
  return { w: topWeight, r: maxReps };
}

function getTopTimeSet(lastSets: { w: number; r: number }[]): number | null {
  const logged = lastSets.filter((s) => s.r > 0);
  if (logged.length === 0) return null;
  return Math.max(...logged.map((s) => s.r));
}

function getTopRepsSet(lastSets: { w: number; r: number }[]): number | null {
  const logged = lastSets.filter((s) => s.r > 0);
  if (logged.length === 0) return null;
  return Math.max(...logged.map((s) => s.r));
}

function formatSet(weight: number, reps: number): string {
  return `${weight}x${reps}`;
}

function struggleDropWeight(goalWeight: number): number {
  return Math.max(goalWeight - 5, 5);
}

function computeWeightedSessionGoal(exercise: WorkoutExercise, top: TopSet | null): SessionGoal {
  const { low, high } = getExerciseRepBounds(exercise);
  const repRangeLabel = describeExerciseRepRange(exercise);

  if (!top) {
    return { weight: null, reps: low, repRangeLabel };
  }

  if (top.r >= high) {
    return { weight: top.w + 5, reps: low, repRangeLabel };
  }

  return { weight: top.w, reps: Math.min(top.r + 1, high), repRangeLabel };
}

function buildWeightRepsCoachNoteParts(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): CoachNoteParts {
  const focus = getExerciseFocus(exercise);
  const top = getTopWeightedSet(lastSets);
  const sessionGoal = computeWeightedSessionGoal(exercise, top);

  if (sessionGoal.weight != null) {
    const target = formatSet(sessionGoal.weight, sessionGoal.reps);
    const fallback = formatSet(struggleDropWeight(sessionGoal.weight), sessionGoal.reps);
    return {
      focus,
      goal: `Your goal: ${target} on every set.`,
      struggle: `If you miss reps, drop to ${fallback} and finish the sets.`,
    };
  }

  return {
    focus,
    goal: `Your goal: ${sessionGoal.reps} reps on every set. Lock in your working weight on set 1.`,
    struggle: "If you miss reps, drop 10 lb and finish the sets.",
  };
}

function buildTimeCoachNoteParts(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): CoachNoteParts {
  const focus = getExerciseFocus(exercise);
  const { low, high } = getExerciseRepBounds(exercise);
  const topSeconds = getTopTimeSet(lastSets);

  let goalSeconds = low;
  if (topSeconds != null) {
    goalSeconds =
      topSeconds >= high ? topSeconds + TIME_PROGRESSION_STEP_SEC : Math.min(topSeconds + TIME_PROGRESSION_STEP_SEC, high);
  }

  const fallbackSeconds = Math.max(goalSeconds - TIME_STRUGGLE_DROP_SEC, 5);

  return {
    focus,
    goal: `Your goal: ${goalSeconds} seconds on every set.`,
    struggle: `If you fall short, aim for ${fallbackSeconds} seconds and finish the sets.`,
  };
}

function buildCarryCoachNoteParts(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): CoachNoteParts {
  const focus = getExerciseFocus(exercise);
  const unit = carryUsesMeters(exercise) ? "meters" : "seconds";
  const unitShort = carryUsesMeters(exercise) ? "m" : "sec";
  const top = getTopWeightedSet(lastSets);
  const { low, high } = getExerciseRepBounds(exercise);

  if (!top) {
    return {
      focus,
      goal: `Your goal: ${low} ${unit} per set. Lock in your working weight on set 1.`,
      struggle: `If you fall short, reduce ${unit} or drop 10 lb and finish the sets.`,
    };
  }

  let goalWeight = top.w;
  let goalDuration = top.r;

  if (top.r >= high) {
    goalWeight = top.w + 5;
    goalDuration = low;
  } else {
    goalDuration = Math.min(top.r + TIME_PROGRESSION_STEP_SEC, high);
  }

  const fallbackWeight = struggleDropWeight(goalWeight);
  const fallbackDuration = Math.max(goalDuration - TIME_STRUGGLE_DROP_SEC, 5);

  return {
    focus,
    goal: `Your goal: ${goalWeight} lb × ${goalDuration} ${unitShort} on every set.`,
    struggle: `If you fall short, try ${fallbackWeight} lb × ${fallbackDuration} ${unitShort} and finish the sets.`,
  };
}

function buildRepsOnlyCoachNoteParts(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): CoachNoteParts {
  const focus = getExerciseFocus(exercise);
  const { low, high } = getExerciseRepBounds(exercise);
  const topReps = getTopRepsSet(lastSets);

  if (topReps == null) {
    return {
      focus,
      goal: `Your goal: ${low} reps on every set. Add weight when you can do ${REPS_ONLY_ADD_WEIGHT_THRESHOLD}+ clean.`,
      struggle: "If you miss reps, stop 1-2 reps short and finish the sets.",
    };
  }

  const nextReps = topReps >= high ? topReps + 1 : Math.min(topReps + 1, high);
  const addWeightCue =
    topReps >= REPS_ONLY_ADD_WEIGHT_THRESHOLD
      ? ` Add weight when you can do ${REPS_ONLY_ADD_WEIGHT_THRESHOLD}+ clean.`
      : "";

  return {
    focus,
    goal: `Your goal: ${nextReps} reps on every set.${addWeightCue}`,
    struggle: "If you miss reps, stop 1-2 reps short and finish the sets.",
  };
}

function buildNoTrackingCoachNoteParts(exercise: WorkoutExercise): CoachNoteParts {
  return {
    focus: getExerciseFocus(exercise),
    goal: "",
    struggle: "",
  };
}

function buildCoachNoteParts(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): CoachNoteParts {
  switch (getExerciseProgressionKind(exercise, lastSets)) {
    case "none":
      return buildNoTrackingCoachNoteParts(exercise);
    case "time_seconds":
      return buildTimeCoachNoteParts(exercise, lastSets);
    case "time_seconds_or_meters":
      return buildCarryCoachNoteParts(exercise, lastSets);
    case "reps_only":
      return buildRepsOnlyCoachNoteParts(exercise, lastSets);
    default:
      return buildWeightRepsCoachNoteParts(exercise, lastSets);
  }
}

function ensurePeriod(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function joinNoteParts(parts: CoachNoteParts, include: { focus: boolean; struggle: boolean }): string {
  const sentences: string[] = [];
  if (parts.goal.trim()) sentences.push(parts.goal);
  if (include.focus && parts.focus) sentences.push(ensurePeriod(parts.focus));
  if (include.struggle && parts.struggle.trim()) sentences.push(parts.struggle);
  if (sentences.length === 0) {
    return parts.focus ? ensurePeriod(parts.focus) : "Focus on form and control — logging optional.";
  }
  return sentences.join(" ");
}

function goalOnly(parts: CoachNoteParts): string {
  if (!parts.goal.trim()) {
    return parts.focus ? ensurePeriod(parts.focus) : "";
  }
  const match = parts.goal.match(/Your goal: (.+)\.$/);
  return match ? `${match[1]}.` : parts.goal;
}

function buildDirectiveNote(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): string {
  return joinNoteParts(buildCoachNoteParts(exercise, lastSets), { focus: true, struggle: true });
}

function buildAccountableNote(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): string {
  return goalOnly(buildCoachNoteParts(exercise, lastSets));
}

function buildFlexibleNote(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): string {
  const parts = buildCoachNoteParts(exercise, lastSets);
  const kind = getExerciseProgressionKind(exercise, lastSets);
  const struggle =
    kind === "weight_reps" && parts.focus && !getTopWeightedSet(lastSets)
      ? `${parts.struggle} Same rep target on a close substitute if equipment is tied up.`
      : parts.struggle;
  const sentences: string[] = [];
  if (parts.goal.trim()) sentences.push(parts.goal);
  if (parts.focus) sentences.push(ensurePeriod(parts.focus));
  if (struggle.trim()) sentences.push(struggle);
  if (sentences.length === 0) {
    return parts.focus ? ensurePeriod(parts.focus) : "Focus on form and control — logging optional.";
  }
  return sentences.join(" ");
}

function buildBeginnerGuidedNote(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): string {
  const parts = buildCoachNoteParts(exercise, lastSets);
  if (!parts.goal.trim()) {
    return joinNoteParts(parts, { focus: true, struggle: false });
  }
  const goal = parts.goal.replace(/\.$/, ", leaving 1-2 reps in the tank.");
  const sentences = [goal];
  if (parts.focus) sentences.push(ensurePeriod(parts.focus));
  if (parts.struggle.trim()) sentences.push(parts.struggle);
  return sentences.join(" ");
}

function applyTrainingStyleToNote(
  exercise: WorkoutExercise,
  lastSets: { w: number; r: number }[],
  style: TrainingStyle | undefined,
): string {
  switch (style) {
    case "accountable":
      return buildAccountableNote(exercise, lastSets);
    case "flexible":
      return buildFlexibleNote(exercise, lastSets);
    case "beginner_guided":
      return buildBeginnerGuidedNote(exercise, lastSets);
    default:
      return buildDirectiveNote(exercise, lastSets);
  }
}

/** Deterministic coach note for one exercise at session start. */
export function getExerciseSessionNote(
  ctx: ExerciseSessionNoteContext,
  exercise: WorkoutExercise,
): string {
  const lastSets = findLastLoggedExerciseSets(ctx.workoutHistory, exercise.name, exercise.label) ?? [];
  return applyTrainingStyleToNote(exercise, lastSets, ctx.trainingStyle);
}

export function buildSessionCoachNoteForExercise(
  history: CompletedWorkoutSession[] | undefined,
  exercise: WorkoutExercise,
  trainingStyle?: TrainingStyle,
): string {
  return getExerciseSessionNote({ workoutHistory: history, trainingStyle }, exercise);
}

/** Build once per session start / exercise add, keyed by exercise instance id. */
export function buildSessionCoachNotesByExerciseId(
  history: CompletedWorkoutSession[] | undefined,
  exercises: WorkoutExercise[],
  trainingStyle?: TrainingStyle,
): Record<string, string> {
  const notes: Record<string, string> = {};
  for (const ex of exercises) {
    notes[ex.id] = getExerciseSessionNote({ workoutHistory: history, trainingStyle }, ex);
  }
  return notes;
}
