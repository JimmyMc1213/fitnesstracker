import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWorkoutKeypad } from "@/components/workout/WorkoutKeypadContext";
import { keypadIncrementStep } from "@/lib/workout/workoutKeypadLogic";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { WeightUnit } from "@newyouai/types";

const DIGIT_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
] as const;

function KeypadKey({
  label,
  onPress,
  disabled,
  testID,
  action,
  accent,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  action?: boolean;
  accent?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      className="min-h-[52px] flex-1 items-center justify-center rounded-xl"
      style={{
        backgroundColor: accent ? colors.accent : action ? colors.backgroundSecondary : colors.card,
        borderWidth: 0.5,
        borderColor: colors.border,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Text
        className="text-lg font-semibold"
        style={{ color: accent ? colors.background : colors.textPrimary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function WorkoutNumericKeypad({ weightUnit }: { weightUnit: WeightUnit }) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { open, active, close, append, backspace, increment, next } = useWorkoutKeypad();

  if (!open || !active) return null;

  const step = keypadIncrementStep(active.field, weightUnit);
  const allowDecimal = active.field === "weight";

  return (
    <View
      testID="workout-keypad"
      className="absolute bottom-0 left-0 right-0 border-t px-2 pt-2"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 8),
      }}
    >
      {DIGIT_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} className="mb-1.5 flex-row gap-1.5">
          {row.map((digit) => (
            <KeypadKey
              key={digit}
              testID={`workout-keypad-digit-${digit}`}
              label={digit}
              onPress={() => append(digit)}
            />
          ))}
          {rowIndex === 0 ? (
            <KeypadKey label="⌨" onPress={close} action />
          ) : null}
          {rowIndex === 1 ? (
            <KeypadKey label="+" onPress={() => increment(step)} action />
          ) : null}
          {rowIndex === 2 ? (
            <View className="flex-1 flex-row gap-1.5">
              <KeypadKey label="−" onPress={() => increment(-step)} action />
              <KeypadKey label="+" onPress={() => increment(step)} action />
            </View>
          ) : null}
        </View>
      ))}

      <View className="flex-row gap-1.5">
        <KeypadKey label="." onPress={() => append(".")} disabled={!allowDecimal} />
        <KeypadKey testID="workout-keypad-digit-0" label="0" onPress={() => append("0")} />
        <KeypadKey label="⌫" onPress={backspace} action />
        <KeypadKey testID="workout-keypad-done" label="Next" onPress={next} accent />
      </View>
    </View>
  );
}
