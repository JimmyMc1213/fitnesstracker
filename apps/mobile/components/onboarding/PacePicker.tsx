import type { GoalPace } from "@newyouai/types";
import { Text, View } from "react-native";

import { OnboardingPillStack, OnboardingSegment } from "@/components/onboarding/OnboardingSegment";
import { useAppTheme } from "@/hooks/useAppTheme";
import { GOAL_PACE_OPTIONS } from "@/lib/goalWeight";

export function PacePicker({
  value,
  onChange,
}: {
  value?: GoalPace;
  onChange: (pace: GoalPace) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <OnboardingPillStack>
      {GOAL_PACE_OPTIONS.map(({ value: paceValue, label, hint }) => (
        <View key={paceValue}>
          <OnboardingSegment selected={value === paceValue} onPress={() => onChange(paceValue)}>
            {label}
          </OnboardingSegment>
          {hint && value === paceValue ? (
            <Text className="mt-2 px-4 text-xs" style={{ color: colors.textSecondary }}>
              {hint}
            </Text>
          ) : null}
        </View>
      ))}
    </OnboardingPillStack>
  );
}
