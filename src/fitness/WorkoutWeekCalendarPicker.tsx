import {
  isValidTrainingWeekdaySelection,
  pickTrainingWeekdaysForMe,
  profileWithTrainingWeekdays,
  TRAINING_WEEKDAY_ORDER,
  TRAINING_WEEKDAY_SHORT,
  trainingWeekdaySelectionHint,
  toggleTrainingWeekday,
} from "./workoutWeekCalendar";
import type { OnboardingProfile } from "./types";

export function WorkoutWeekCalendarPicker({
  profile,
  onChange,
}: {
  profile: Pick<OnboardingProfile, "workoutDaysPerWeek" | "trainingWeekdays">;
  onChange: (next: Pick<OnboardingProfile, "workoutDaysPerWeek" | "trainingWeekdays">) => void;
}) {
  const selected = profile.trainingWeekdays ?? [];
  const valid = isValidTrainingWeekdaySelection(selected);

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
              onClick={() => applyWeekdays(toggleTrainingWeekday(selected, day))}
            >
              {TRAINING_WEEKDAY_SHORT[day]}
            </button>
          );
        })}
      </div>

      <p className={`workout-week-picker__hint${valid ? "" : " workout-week-picker__hint--invalid"}`}>
        {trainingWeekdaySelectionHint(selected)}
      </p>

      <button type="button" className="tap workout-week-picker__ghost" onClick={() => applyWeekdays(pickTrainingWeekdaysForMe(selected))}>
        Pick for me
      </button>
    </div>
  );
}

export function isTrainingScheduleValid(profile: Pick<OnboardingProfile, "trainingWeekdays">): boolean {
  return isValidTrainingWeekdaySelection(profile.trainingWeekdays);
}
