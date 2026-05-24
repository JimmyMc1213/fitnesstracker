import { buildWorkoutPlan, type WorkoutSession } from "./buildWorkoutPlan";
import type { Equipment } from "./exerciseLibrary";
import type { SessionLength } from "./splitTemplates";
import type {
  EquipmentSetup,
  ExperienceLevel,
  TrainingSessionDuration,
  WorkoutDaysPerWeek,
  WorkoutExercise,
  WorkoutRoutineTemplate,
} from "./types";
import { defaultTrainingWeekdaysForProfile, normalizeTrainingWeekdays } from "./workoutWeekCalendar";

export function equipmentSetupToEngine(setup: EquipmentSetup): Equipment {
  if (setup === "bodyweight_only") return "bodyweight";
  return setup;
}

export function sessionLengthFromDuration(raw?: TrainingSessionDuration | SessionLength): SessionLength {
  switch (raw) {
    case "under_30":
    case "30_or_less":
      return "under_30";
    case "30_45":
    case "30_to_45":
      return "30_45";
    case "45_60":
    case "45_to_60":
      return "45_60";
    case "60_90":
    case "60_to_90":
      return "60_90";
    case "90_plus":
      return "90_plus";
    default:
      return "45_60";
  }
}

export function sessionDurationFromSessionLength(length: SessionLength): TrainingSessionDuration {
  switch (length) {
    case "under_30":
      return "30_or_less";
    case "30_45":
      return "30_to_45";
    case "45_60":
      return "45_to_60";
    case "60_90":
      return "60_to_90";
    case "90_plus":
      return "90_plus";
  }
}

function templateId(session: WorkoutSession, idx: number): string {
  const slug = session.sessionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${session.dayLabel.toLowerCase()}-${slug || "session"}-${idx}`;
}

function mapExerciseToWorkoutExercise(ex: WorkoutSession["exercises"][number]): WorkoutExercise {
  const { sets, repsLow, repsHigh } = ex.sets;
  return {
    id: ex.id,
    name: ex.name,
    label: ex.muscleGroup,
    target: `${sets} × ${repsLow}-${repsHigh}`,
    sets: Array.from({ length: sets }, () => ({ w: 0, r: repsHigh, done: false })),
  };
}

export function workoutSessionToTemplate(session: WorkoutSession, idx: number): WorkoutRoutineTemplate {
  const preview = session.exercises.slice(0, 3).map((e) => e.name);
  const focus =
    session.exercises.length > 0
      ? preview.join(" · ") + (session.exercises.length > 3 ? ` · +${session.exercises.length - 3} more` : "")
      : "Rest / recovery";

  return {
    id: templateId(session, idx),
    name: session.sessionName,
    dayLabel: session.dayLabel,
    focus,
    estimatedMinutes: session.estimatedMinutes,
    exercises: session.exercises.map(mapExerciseToWorkoutExercise),
    sessionTip: session.exercises.find((e) => e.coachNote)?.coachNote,
  };
}

export function buildWorkoutTemplatesForDays(
  days: WorkoutDaysPerWeek,
  level: ExperienceLevel,
  equipment: EquipmentSetup,
  trainingWeekdays?: string[],
  sessionLength: SessionLength = "45_60",
): WorkoutRoutineTemplate[] {
  const weekdays = normalizeTrainingWeekdays(trainingWeekdays);
  const resolvedWeekdays = weekdays.length > 0 ? weekdays : defaultTrainingWeekdaysForProfile(days);
  const dayCount = (weekdays.length >= 3 && weekdays.length <= 6 ? weekdays.length : days) as WorkoutDaysPerWeek;
  const preferPPL = (level === "intermediate" || level === "advanced") && (dayCount === 3 || dayCount === 6);

  const plan = buildWorkoutPlan({
    days: dayCount,
    weekdays: resolvedWeekdays.slice(0, dayCount),
    equipment: equipmentSetupToEngine(equipment),
    experience: level,
    sessionLength,
    preferPPL,
  });

  return plan.sessions.map((session, idx) => workoutSessionToTemplate(session, idx));
}

export function workoutDaysLabel(days: WorkoutDaysPerWeek): string {
  return `${days} days per week`;
}
