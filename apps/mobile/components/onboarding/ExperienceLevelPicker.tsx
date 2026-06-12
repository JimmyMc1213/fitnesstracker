import type { ExperienceLevel } from "@newyouai/types";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import {
  EXPERIENCE_LEVEL_DESCRIPTIONS,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVEL_OPTIONS,
} from "@/lib/experienceLevel";

import { OnboardingPillStack, OnboardingSegment } from "./OnboardingSegment";

export function ExperienceLevelPicker({
  value,
  onChange,
}: {
  value?: ExperienceLevel;
  onChange: (next: ExperienceLevel) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <OnboardingPillStack>
      {EXPERIENCE_LEVEL_OPTIONS.map((level) => (
        <OnboardingSegment key={level} selected={value === level} onPress={() => onChange(level)}>
          <View className="w-full items-start gap-1">
            <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>
              {EXPERIENCE_LEVEL_LABELS[level]}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {EXPERIENCE_LEVEL_DESCRIPTIONS[level]}
            </Text>
          </View>
        </OnboardingSegment>
      ))}
    </OnboardingPillStack>
  );
}
