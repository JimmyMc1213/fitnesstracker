import { Pressable, Text } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { formatSetWeight } from "@newyouai/core";
import type { WeightUnit } from "@newyouai/types";

export type WorkoutSetFieldKind = "weight" | "reps";

type Props = {
  exerciseId: string;
  setIndex: number;
  field: WorkoutSetFieldKind;
  weight: number;
  reps: number;
  placeholderWeight?: number;
  placeholderReps?: number;
  weightUnit: WeightUnit;
  secondFieldLabel?: "Reps" | "Sec";
  onPress?: () => void;
};

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
  onPress,
}: Props) {
  const { colors } = useAppTheme();

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

  const display = hasValue
    ? field === "weight"
      ? formatSetWeight(weight, weightUnit)
      : String(reps)
    : formattedPlaceholder ?? "–";

  const showAsPlaceholder = !hasValue && formattedPlaceholder != null;

  const testID =
    field === "weight"
      ? `workout-set-${exerciseId}-${setIndex}-weight`
      : `workout-set-${exerciseId}-${setIndex}-reps`;

  const accessibilityLabel =
    field === "weight" ? `Weight for set ${setIndex + 1}` : `${secondFieldLabel} for set ${setIndex + 1}`;

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="min-h-9 items-center justify-center rounded-lg border px-1 py-2"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.backgroundSecondary,
      }}
    >
      <Text
        className="text-[13px] font-semibold tabular-nums"
        style={{
          color: showAsPlaceholder ? colors.textTertiary : colors.textPrimary,
          fontWeight: showAsPlaceholder ? "400" : "600",
        }}
      >
        {display}
      </Text>
    </Pressable>
  );
}
