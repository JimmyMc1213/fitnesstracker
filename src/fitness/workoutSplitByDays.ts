import { SPLIT, workoutTemplateForSplitId } from "./data";
import { adaptExerciseForEquipment } from "./exerciseEquipment";
import { normalizeTrainingWeekdays } from "./workoutWeekCalendar";
import { workoutTemplatesForExperience } from "./workoutTemplatesForExperience";
import type { EquipmentSetup, ExperienceLevel, WorkoutDaysPerWeek, WorkoutRoutineTemplate } from "./types";

const THREE_DAY_IDS = ["mon-upper", "tue-lower", "thu-pull"] as const;
const FOUR_DAY_IDS = ["mon-upper", "tue-lower", "wed-push", "thu-pull"] as const;
const SAT_TEMPLATE = {
  id: "sat-upper",
  day: "Sat",
  name: "Upper pump",
  focus: "Chest · Back · Delts · Arms",
};

function splitMetaForDays(days: WorkoutDaysPerWeek): { id: string; day: string; name: string; focus: string }[] {
  if (days === 3) return SPLIT.filter((s) => (THREE_DAY_IDS as readonly string[]).includes(s.id));
  if (days === 4) return SPLIT.filter((s) => (FOUR_DAY_IDS as readonly string[]).includes(s.id));
  if (days === 5) return [...SPLIT];
  return [
    ...SPLIT,
    SAT_TEMPLATE,
  ];
}

export function buildWorkoutTemplatesForDays(
  days: WorkoutDaysPerWeek,
  level: ExperienceLevel,
  equipment: EquipmentSetup,
  trainingWeekdays?: string[],
): WorkoutRoutineTemplate[] {
  const weekdays = normalizeTrainingWeekdays(trainingWeekdays);
  const experienced = workoutTemplatesForExperience(level);
  const byId = new Map(experienced.map((t) => [t.id, t]));
  const meta = splitMetaForDays(days);

  if (days === 6) {
    const satExercises = workoutTemplateForSplitId("mon-upper")
      .slice(0, 6)
      .map((e) => adaptExerciseForEquipment(e, equipment));
    byId.set("sat-upper", {
      id: "sat-upper",
      name: SAT_TEMPLATE.name,
      dayLabel: SAT_TEMPLATE.day,
      focus: SAT_TEMPLATE.focus,
      exercises: satExercises,
    });
  }

  return meta.map((s, i) => {
    const dayLabel = weekdays[i] ?? s.day;
    const base = byId.get(s.id);
    if (base) {
      return {
        ...base,
        dayLabel,
        exercises: base.exercises.map((e) => adaptExerciseForEquipment(e, equipment)),
      };
    }
    return {
      id: s.id,
      name: s.name,
      dayLabel,
      focus: s.focus,
      exercises: workoutTemplateForSplitId(s.id).map((e) => adaptExerciseForEquipment(e, equipment)),
    };
  });
}

export function workoutDaysLabel(days: WorkoutDaysPerWeek): string {
  return `${days} days per week`;
}
