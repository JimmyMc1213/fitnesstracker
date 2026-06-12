import exerciseLibrary, { Exercise, Equipment, Experience, MovementPattern } from './exerciseLibrary';
// Plan builder only pulls from exerciseLibrary — browse-only exercises live in exerciseExpansion.ts.
import type { ExerciseEquipmentLabel } from './exerciseLabels';
import { splitTemplates as splits, SessionLength, SplitType, REP_RANGES } from './splitTemplates';
import { fitSessionVolume } from './fitSessionVolume';
import { roundEstimatedSessionMinutes } from './sessionLengthConfig';

export interface WorkoutSet {
  sets: number;
  repsLow: number;
  repsHigh: number;
  weightNote: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  label: ExerciseEquipmentLabel;
  muscleGroup: string;
  movementPattern: MovementPattern;
  coachNote?: string;
  sets: WorkoutSet;
}

export interface WorkoutSession {
  dayLabel: string;
  sessionName: string;
  exercises: WorkoutExercise[];
  estimatedMinutes: number;
}

export interface WorkoutPlan {
  splitType: SplitType;
  days: number;
  experience: Experience;
  equipment: Equipment;
  sessionLength: SessionLength;
  weekdays: string[];
  sessions: WorkoutSession[];
}

export interface BuildPlanInput {
  days: number;
  weekdays: string[];
  equipment: Equipment;
  experience: Experience;
  sessionLength: SessionLength;
  preferPPL?: boolean;
}

// Weight guidance by experience
const WEIGHT_NOTES: Record<Experience, string> = {
  beginner:     'Start light. Focus on form before adding weight',
  intermediate: 'Choose a weight where the last 2 reps are challenging',
  advanced:     'Work at 75–85% of your estimated 1RM'
};

function getSplitType(days: number, preferPPL: boolean): SplitType {
  switch (days) {
    case 1: return '1_fullbody';
    case 2: return '2_fullbody_ab';
    case 3: return preferPPL ? '3_ppl' : '3_fullbody_abc';
    case 4: return '4_upper_lower';
    case 5: return '5_pplul';
    case 6: return preferPPL ? '6_ppl' : '6_pplrul';
    default: return '4_upper_lower';
  }
}

function getExerciseForPattern(
  pattern: MovementPattern,
  equipment: Equipment,
  experience: Experience,
  usedIds: Set<string>
): Exercise | null {
  // Filter by pattern, equipment, and experience
  const candidates = exerciseLibrary.filter(ex =>
    ex.movementPattern === pattern &&
    ex.equipment.includes(equipment) &&
    ex.experience.includes(experience) &&
    !usedIds.has(ex.id)
  );

  if (candidates.length === 0) {
    // Fallback: relax experience filter
    const fallback = exerciseLibrary.filter(ex =>
      ex.movementPattern === pattern &&
      ex.equipment.includes(equipment) &&
      !usedIds.has(ex.id)
    );
    if (fallback.length === 0) return null;
    return fallback[0];
  }

  // Pick first candidate (deterministic; can randomize or score later)
  return candidates[0];
}

export function buildWorkoutPlan(input: BuildPlanInput): WorkoutPlan {
  const { days, weekdays, equipment, experience, sessionLength, preferPPL = false } = input;

  const splitType = getSplitType(days, preferPPL);
  const splitTemplate = splits.find(s => s.splitType === splitType);

  if (!splitTemplate) throw new Error(`No template found for split type: ${splitType}`);

  const repRange = REP_RANGES[experience];

  const sessions: WorkoutSession[] = splitTemplate.sessions
    .filter(s => s.movementPatterns.length > 0)
    .map((sessionTemplate, idx) => {
      const usedIds = new Set<string>();
      const exercises: WorkoutExercise[] = [];

      const { exerciseCount, setCount, estimatedSeconds } = fitSessionVolume(
        sessionTemplate.movementPatterns.length,
        sessionLength,
        repRange.sets,
      );

      const patterns = sessionTemplate.movementPatterns.slice(0, exerciseCount);

      for (const pattern of patterns) {
        const exercise = getExerciseForPattern(pattern, equipment, experience, usedIds);
        if (!exercise) continue;

        usedIds.add(exercise.id);

        exercises.push({
          id: exercise.id,
          name: exercise.name,
          label: exercise.label,
          muscleGroup: exercise.muscleGroup,
          movementPattern: exercise.movementPattern,
          coachNote: exercise.coachNote,
          sets: {
            sets: setCount,
            repsLow: repRange.repsLow,
            repsHigh: repRange.repsHigh,
            weightNote: WEIGHT_NOTES[experience]
          }
        });
      }

      // Map weekday label to session
      const weekdayLabel = weekdays[idx] ?? sessionTemplate.dayLabel;

      return {
        dayLabel: weekdayLabel,
        sessionName: sessionTemplate.sessionName,
        exercises,
        estimatedMinutes: roundEstimatedSessionMinutes(estimatedSeconds),
      };
    });

  return {
    splitType,
    days,
    experience,
    equipment,
    sessionLength,
    weekdays,
    sessions
  };
}
