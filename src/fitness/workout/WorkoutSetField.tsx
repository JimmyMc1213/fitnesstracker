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
  placeholderWeight = 0,
  placeholderReps = 0,
  weightUnit,
  secondFieldLabel = "Reps",
}: {
  exerciseId: string;
  setIndex: number;
  field: WorkoutKeypadField;
  weight: number;
  reps: number;
  placeholderWeight?: number;
  placeholderReps?: number;
  weightUnit: WeightUnit;
  secondFieldLabel?: "Reps" | "Sec";
}) {
  const { openField, isActive, draft, active } = useWorkoutKeypad();
  const target = { exerciseId, setIndex, field };
  const selected = isActive(target);

  const hasValue = field === "weight" ? weight > 0 : reps > 0;
  const prevValue = field === "weight" ? placeholderWeight : placeholderReps;
  const formattedPlaceholder =
    field === "weight"
      ? prevValue > 0
        ? formatSetWeight(prevValue, weightUnit)
        : null
      : prevValue > 0
        ? String(prevValue)
        : null;

  const display =
    selected && active?.field === field
      ? draft || formattedPlaceholder || "–"
      : hasValue
        ? field === "weight"
          ? formatSetWeight(weight, weightUnit)
          : String(reps)
        : formattedPlaceholder || "–";

  const showAsPlaceholder =
    !hasValue && formattedPlaceholder != null && (selected && active?.field === field ? !draft : true);

  return (
    <button
      id={fieldElementId(target)}
      type="button"
      className={`tap workout-set-field${selected ? " workout-set-field--active" : ""}${showAsPlaceholder ? " workout-set-field--placeholder" : ""}`}
      aria-label={field === "weight" ? `Weight for set ${setIndex + 1}` : `${secondFieldLabel} for set ${setIndex + 1}`}
      aria-pressed={selected}
      onClick={() => openField(target)}
      style={{
        ...workoutSetInputStyle,
        ...(showAsPlaceholder
          ? {
              color: "var(--workout-set-placeholder)",
              fontWeight: 400,
            }
          : null),
      }}
    >
      {display}
    </button>
  );
}
