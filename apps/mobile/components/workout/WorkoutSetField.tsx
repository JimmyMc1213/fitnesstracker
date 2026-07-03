import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";

import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { WORKOUT_SET_REJECT_COLOR } from "@/components/workout/useWorkoutSetRejectShake";
import { WORKOUT_ACCENT } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { WorkoutKeypadField } from "@/lib/workout/workoutKeypadLogic";
import { formatSetWeight } from "@newyouai/core";
import type { WeightUnit } from "@newyouai/types";

import { useWorkoutKeypad, useWorkoutKeypadDraft } from "./WorkoutKeypadContext";

type Props = {
  exerciseId: string;
  setIndex: number;
  field: WorkoutKeypadField;
  weight: number;
  reps: number;
  placeholderWeight?: number;
  placeholderReps?: number;
  weightUnit: WeightUnit;
  secondFieldLabel?: "Reps" | "Sec";
  rejecting?: boolean;
};

function WorkoutSetFieldDraftDisplay({
  textColor,
  reducedMotion,
  showCursor,
}: {
  textColor: string;
  reducedMotion: boolean;
  showCursor: boolean;
}) {
  const draft = useWorkoutKeypadDraft();

  return (
    <>
      {draft}
      <Text style={{ color: textColor, opacity: reducedMotion || showCursor ? 1 : 0 }}>|</Text>
    </>
  );
}

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
  rejecting = false,
}: Props) {
  const { colors } = useAppTheme();
  const { openField, isActive, active } = useWorkoutKeypad();
  const reducedMotion = useReducedMotion();
  const target = { exerciseId, setIndex, field };
  const selected = isActive(target);

  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!selected || reducedMotion) return;
    const interval = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(interval);
  }, [selected, reducedMotion]);

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

  const showDraft = selected && active?.field === field;

  const display = hasValue
    ? field === "weight"
      ? formatSetWeight(weight, weightUnit)
      : String(reps)
    : formattedPlaceholder ?? "–";

  const showAsPlaceholder = !selected && !hasValue && formattedPlaceholder != null;

  const textColor = rejecting
    ? WORKOUT_SET_REJECT_COLOR
    : showAsPlaceholder
      ? colors.textTertiary
      : colors.textPrimary;

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
      accessibilityState={{ selected }}
      onPress={() => openField(target)}
      className="min-h-9 items-center justify-center rounded-lg border px-1 py-2"
      style={{
        borderColor: rejecting ? WORKOUT_SET_REJECT_COLOR : selected ? WORKOUT_ACCENT : colors.border,
        backgroundColor: colors.backgroundSecondary,
      }}
    >
      <Text
        className="text-[13px] font-semibold tabular-nums"
        style={{
          color: textColor,
          fontWeight: showAsPlaceholder ? "400" : "600",
        }}
      >
        {showDraft ? (
          <WorkoutSetFieldDraftDisplay
            textColor={textColor}
            reducedMotion={reducedMotion}
            showCursor={showCursor}
          />
        ) : (
          display
        )}
      </Text>
    </Pressable>
  );
}
