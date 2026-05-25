import { formatSetWeight } from "../unitPreferences";
import type { WeightUnit } from "../types";
import { workoutSetInputStyle } from "../workoutUiTokens";
import { fieldElementId, useWorkoutKeypad } from "./WorkoutKeypadContext";
import type { WorkoutKeypadField } from "./workoutKeypadLogic";

export function WorkoutSetField({
  exerciseId,
  setIndex,
  field,
  weight,
  reps,
  weightUnit,
}: {
  exerciseId: string;
  setIndex: number;
  field: WorkoutKeypadField;
  weight: number;
  reps: number;
  weightUnit: WeightUnit;
}) {
  const { openField, isActive, draft, active } = useWorkoutKeypad();
  const target = { exerciseId, setIndex, field };
  const selected = isActive(target);

  const display =
    selected && active?.field === field
      ? draft || "–"
      : field === "weight"
        ? weight > 0
          ? formatSetWeight(weight, weightUnit)
          : "–"
        : reps > 0
          ? String(reps)
          : "–";

  return (
    <button
      id={fieldElementId(target)}
      type="button"
      className={`tap workout-set-field${selected ? " workout-set-field--active" : ""}`}
      aria-label={field === "weight" ? `Weight for set ${setIndex + 1}` : `Reps for set ${setIndex + 1}`}
      aria-pressed={selected}
      onClick={() => openField(target)}
      style={workoutSetInputStyle}
    >
      {display}
    </button>
  );
}
