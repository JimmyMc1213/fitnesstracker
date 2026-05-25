/**
 * Rule-based per-exercise session coach notes (FTI-54).
 * Uses workoutHistory (per-set snapshots), same source as workoutAutofill.
 */
import { exerciseLibrary, type Exercise } from "./exerciseLibrary";
import { findLastLoggedExerciseSets } from "./workoutAutofill";
import type { CompletedWorkoutSession, TrainingStyle, WorkoutExercise } from "./types";
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

function findLibraryExercise(name: string, label?: string): Exercise | undefined {
  const normalized = name.toLowerCase().trim();
  const labelNorm = label?.toLowerCase().trim();
  const exact = exerciseLibrary.find((ex) => {
    if (ex.name.toLowerCase() !== normalized) return false;
    if (labelNorm) return ex.label.toLowerCase() === labelNorm;
    return true;
  });
  if (exact) return exact;
  return exerciseLibrary.find((ex) => {
    const exName = ex.name.toLowerCase();
    if (exName === normalized) return true;
    if (labelNorm && exName.includes(labelNorm) && exName.includes(normalized.split(" ")[0] ?? "")) {
      return true;
    }
    return exName.includes(normalized) || normalized.includes(exName);
  });
}

function getExerciseFocus(exercise: WorkoutExercise): string | null {
  const meta = findLibraryExercise(exercise.name, exercise.label);
  return meta?.coachNote?.trim() ?? null;
}

function getTopSet(lastSets: { w: number; r: number }[]): TopSet | null {
  const logged = lastSets.filter((s) => s.w > 0 && s.r > 0);
  if (logged.length === 0) return null;
  const topWeight = Math.max(...logged.map((s) => s.w));
  const maxReps = Math.max(...logged.filter((s) => s.w === topWeight).map((s) => s.r));
  return { w: topWeight, r: maxReps };
}

function formatSet(weight: number, reps: number): string {
  return `${weight}x${reps}`;
}

function struggleDropWeight(goalWeight: number): number {
  return Math.max(goalWeight - 5, 5);
}

function computeSessionGoal(exercise: WorkoutExercise, top: TopSet | null): SessionGoal {
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

function buildCoachNoteParts(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): CoachNoteParts {
  const focus = getExerciseFocus(exercise);
  const top = getTopSet(lastSets);
  const sessionGoal = computeSessionGoal(exercise, top);

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

function ensurePeriod(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function joinNoteParts(parts: CoachNoteParts, include: { focus: boolean; struggle: boolean }): string {
  const sentences = [parts.goal];
  if (include.focus && parts.focus) sentences.push(ensurePeriod(parts.focus));
  if (include.struggle) sentences.push(parts.struggle);
  return sentences.join(" ");
}

function goalOnly(parts: CoachNoteParts): string {
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
  const struggle =
    parts.focus && !getTopSet(lastSets)
      ? `${parts.struggle} Same rep target on a close substitute if equipment is tied up.`
      : parts.struggle;
  const sentences = [parts.goal];
  if (parts.focus) sentences.push(ensurePeriod(parts.focus));
  sentences.push(struggle);
  return sentences.join(" ");
}

function buildBeginnerGuidedNote(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): string {
  const parts = buildCoachNoteParts(exercise, lastSets);
  const goal = parts.goal.replace(/\.$/, ", leaving 1-2 reps in the tank.");
  const sentences = [goal];
  if (parts.focus) sentences.push(ensurePeriod(parts.focus));
  sentences.push(parts.struggle);
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
