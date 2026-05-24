import {
  GENERATED_TRAINING_DAY_LIMITS,
  isValidTrainingWeekdaySelection,
  pickTrainingWeekdaysForMe,
  profileWithTrainingWeekdays,
  TRAINING_WEEKDAY_ORDER,
  TRAINING_WEEKDAY_SHORT,
  trainingWeekdaySelectionHint,
  toggleTrainingWeekday,
  type TrainingWeekdaySelectionLimits,
} from "./workoutWeekCalendar";
import type { OnboardingProfile } from "./types";

export function WorkoutWeekCalendarPicker({
  profile,
  onChange,
  showPickForMe = true,
  includeSplitInHint = true,
  selectionLimits = GENERATED_TRAINING_DAY_LIMITS,
  emptyHint,
}: {
  profile: Pick<OnboardingProfile, "workoutDaysPerWeek" | "trainingWeekdays">;
  onChange: (next: Pick<OnboardingProfile, "workoutDaysPerWeek" | "trainingWeekdays">) => void;
  showPickForMe?: boolean;
  includeSplitInHint?: boolean;
  selectionLimits?: TrainingWeekdaySelectionLimits;
  emptyHint?: string;
}) {
  const selected = profile.trainingWeekdays ?? [];
  const valid = isValidTrainingWeekdaySelection(selected, selectionLimits);

  function applyWeekdays(weekdays: string[]) {
    onChange(profileWithTrainingWeekdays(profile, weekdays));
  }

  return (
    <div className="workout-week-picker">
      <div role="group" aria-label="Training days of the week" className="workout-week-picker__days">
        {TRAINING_WEEKDAY_ORDER.map((day) => {
          const on = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              className={`tap workout-week-picker__day${on ? " workout-week-picker__day--selected" : ""}`}
              aria-pressed={on}
              aria-label={`${day}${on ? ", selected" : ""}`}
              onClick={() => applyWeekdays(toggleTrainingWeekday(selected, day, selectionLimits))}
            >
              {TRAINING_WEEKDAY_SHORT[day]}
            </button>
          );
        })}
      </div>

      <p className={`workout-week-picker__hint${valid ? "" : " workout-week-picker__hint--invalid"}`}>
        {trainingWeekdaySelectionHint(selected, {
          includeSplitLabel: includeSplitInHint,
          limits: selectionLimits,
          emptyHint,
        })}
      </p>

      {showPickForMe ? (
        <button type="button" className="tap workout-week-picker__ghost" onClick={() => applyWeekdays(pickTrainingWeekdaysForMe(selected))}>
          Pick for me
        </button>
      ) : null}
    </div>
  );
}

export function isTrainingScheduleValid(
  profile: Pick<OnboardingProfile, "trainingWeekdays">,
  limits: TrainingWeekdaySelectionLimits = GENERATED_TRAINING_DAY_LIMITS,
): boolean {
  return isValidTrainingWeekdaySelection(profile.trainingWeekdays, limits);
}
