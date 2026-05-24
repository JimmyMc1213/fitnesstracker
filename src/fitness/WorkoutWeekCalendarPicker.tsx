import type { CSSProperties } from "react";

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

const dayBtn = (selected: boolean): CSSProperties => ({
  flex: 1,
  minWidth: 0,
  aspectRatio: "1",
  maxWidth: 48,
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 13,
  border: selected ? "1px solid rgba(255,255,255,0.55)" : "0.5px solid var(--border)",
  background: selected ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.04)",
  color: selected ? "#fff" : "rgba(255,255,255,0.55)",
});

export function WorkoutWeekCalendarPicker({
  profile,
  onChange,
}: {
  profile: Pick<OnboardingProfile, "workoutDaysPerWeek" | "trainingWeekdays">;
  onChange: (next: Pick<OnboardingProfile, "workoutDaysPerWeek" | "trainingWeekdays">) => void;
}) {
  const selected = profile.trainingWeekdays ?? [];

  function applyWeekdays(weekdays: string[]) {
    onChange(profileWithTrainingWeekdays(profile, weekdays));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        role="group"
        aria-label="Training days of the week"
        style={{ display: "flex", gap: 8, justifyContent: "space-between" }}
      >
        {TRAINING_WEEKDAY_ORDER.map((day) => {
          const on = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              className="tap"
              aria-pressed={on}
              aria-label={`${day}${on ? ", selected" : ""}`}
              style={dayBtn(on)}
              onClick={() => applyWeekdays(toggleTrainingWeekday(selected, day))}
            >
              {TRAINING_WEEKDAY_SHORT[day]}
            </button>
          );
        })}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 500,
          color: isValidTrainingWeekdaySelection(selected) ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.4)",
          textAlign: "center",
        }}
      >
        {trainingWeekdaySelectionHint(selected)}
      </p>

      <button
        type="button"
        className="tap"
        onClick={() => applyWeekdays(pickTrainingWeekdaysForMe(selected))}
        style={{
          alignSelf: "center",
          padding: "10px 18px",
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 14,
          border: "0.5px solid var(--border)",
          background: "rgba(255,255,255,0.06)",
          color: "#fff",
        }}
      >
        Pick for me
      </button>
    </div>
  );
}

export function isTrainingScheduleValid(profile: Pick<OnboardingProfile, "trainingWeekdays">): boolean {
  return isValidTrainingWeekdaySelection(profile.trainingWeekdays);
}
