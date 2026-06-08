import { weekdayFullName } from "./trainingCalendar";
import type { WorkoutRoutineTemplate } from "./types";

const PREVIEW_EXERCISE_COUNT = 4;

export function OnboardingSplitReveal({ templates }: { templates: WorkoutRoutineTemplate[] }) {
  return (
    <div className="onboarding-split-reveal">
      {templates.map((routine) => {
        const preview = routine.exercises.slice(0, PREVIEW_EXERCISE_COUNT);
        const remaining = routine.exercises.length - preview.length;

        return (
          <div key={routine.id} className="onboarding-gradient-card onboarding-split-reveal__card">
            <div className="onboarding-split-reveal__title">
              {weekdayFullName(routine.dayLabel)} · {routine.name}
            </div>
            {routine.estimatedMinutes != null && routine.estimatedMinutes > 0 ? (
              <div className="onboarding-split-reveal__meta">~{routine.estimatedMinutes} min</div>
            ) : null}
            {preview.length > 0 ? (
              <ul className="onboarding-split-reveal__list">
                {preview.map((ex) => (
                  <li key={ex.id}>{ex.name}</li>
                ))}
              </ul>
            ) : null}
            {remaining > 0 ? (
              <div className="onboarding-split-reveal__more">+{remaining} more</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
