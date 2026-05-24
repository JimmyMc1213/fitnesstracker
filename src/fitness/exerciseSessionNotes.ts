/**
 * Rule-based per-exercise session coach notes (FTI-54).
 * Uses workoutHistory (per-set snapshots), same source as workoutAutofill.
 */
import { exerciseLibrary, type Exercise } from "./exerciseLibrary";
import { findLastLoggedExerciseSets } from "./workoutAutofill";
import type { CompletedWorkoutSession, TrainingStyle, WorkoutExercise } from "./types";

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

function formatSetPair(w: number, r: number): string {
  if (w > 0 && r > 0) return `${w}x${r}`;
  if (w > 0) return `${w} lb`;
  return "";
}

function muscleGroupPhrase(muscleGroup: string, secondary?: string[]): string {
  const primary = muscleGroup.replace(/_/g, " ");
  if (!secondary?.length) return primary;
  const extras = secondary.slice(0, 2).map((m) => m.replace(/_/g, " "));
  return `${primary}, ${extras.join(", ")}`;
}

function findLibraryExercise(name: string, label?: string): Exercise | undefined {
  const normalized = name.toLowerCase().trim();
  const labelNorm = label?.toLowerCase().trim();
  return exerciseLibrary.find((ex) => {
    const exName = ex.name.toLowerCase();
    if (exName === normalized) return true;
    if (labelNorm && exName.includes(labelNorm) && exName.includes(normalized.split(" ")[0] ?? "")) {
      return true;
    }
    return exName.includes(normalized) || normalized.includes(exName);
  });
}

function progressiveOverloadNote(exercise: WorkoutExercise, lastSets: { w: number; r: number }[]): string {
  const logged = lastSets.filter((s) => s.w > 0 || s.r > 0);
  const pairs = logged.map((s) => formatSetPair(s.w, s.r)).filter(Boolean).join(", ");
  const withWeightReps = logged.filter((s) => s.w > 0 && s.r > 0);
  if (withWeightReps.length > 0) {
    const top = Math.max(...withWeightReps.map((s) => s.w));
    const maxR = Math.max(...withWeightReps.map((s) => s.r));
    const historyBit = pairs ? `Last session: ${pairs}. ` : "";
    return `${historyBit}Match or beat ${top}x${maxR} lb, add ~5 lb when every set hits the top of the range with reps in reserve.`;
  }
  return genericExerciseSessionNote(exercise);
}

function genericExerciseSessionNote(exercise: WorkoutExercise): string {
  return `Lead with ${exercise.name}. Hit the listed rep range with 1-2 reps in reserve, chase clean reps before heavier loads.`;
}

function extractPerformanceTarget(note: string): string | null {
  const match = note.match(/Match or beat (\d+x\d+(?:\s*lb)?)/i);
  if (match) return match[1].replace(/\s*lb/i, "");
  const rirMatch = note.match(/(\d-\d reps in reserve)/i);
  if (rirMatch) return rirMatch[1];
  return null;
}

function applyTrainingStyleToNote(
  baseNote: string,
  exercise: WorkoutExercise,
  style: TrainingStyle | undefined,
): string {
  if (!style || style === "directive") {
    const meta = findLibraryExercise(exercise.name, exercise.label);
    if (meta?.coachNote && !baseNote.includes(meta.coachNote)) {
      return `${baseNote} Focus: ${meta.coachNote}.`;
    }
    return baseNote;
  }

  const target = extractPerformanceTarget(baseNote);
  const meta = findLibraryExercise(exercise.name, exercise.label);

  if (style === "accountable") {
    if (target) return `Beat ${target} on ${exercise.name}.`;
    return meta?.coachNote ?? `RIR 1-2 on ${exercise.name}.`;
  }

  if (style === "flexible") {
    if (target) {
      return `Primary: beat ${target} on ${exercise.name}. Alternative: same weight for an extra rep, or drop ~5 lb and finish the rep range.`;
    }
    return `${baseNote} Or swap to a close substitute if equipment is tied up.`;
  }

  // beginner_guided
  const muscles = meta
    ? muscleGroupPhrase(meta.muscleGroup, meta.secondaryMuscles)
    : "the target muscles for this movement";
  const whyBit = `${exercise.name} builds ${muscles}.`;
  const focusBit = meta?.coachNote ? ` Focus on ${meta.coachNote.toLowerCase()}.` : "";
  if (target) {
    return `${whyBit} Aim for ${target} with 1-2 reps in reserve.${focusBit}`;
  }
  return `${whyBit} ${baseNote}${focusBit}`;
}

/** Deterministic coach note for one exercise at session start. */
export function getExerciseSessionNote(
  ctx: ExerciseSessionNoteContext,
  exercise: WorkoutExercise,
): string {
  const lastSets = findLastLoggedExerciseSets(ctx.workoutHistory, exercise.name, exercise.label);
  const base =
    lastSets?.some((s) => s.w > 0 || s.r > 0)
      ? progressiveOverloadNote(exercise, lastSets)
      : genericExerciseSessionNote(exercise);
  return applyTrainingStyleToNote(base, exercise, ctx.trainingStyle);
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
