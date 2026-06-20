import type { ExperienceLevel } from "@newyouai/types";
import { Text, View } from "react-native";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import {
  EXPERIENCE_LEVEL_DESCRIPTIONS,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVEL_OPTIONS,
} from "@/lib/experienceLevel";
import { onboardingPillColors, onboardingPillSubtextColor } from "@/lib/onboardingTheme";

import { OnboardingPillStack, OnboardingSegment } from "./OnboardingSegment";

export function ExperienceLevelPicker({
  value,
  onChange,
}: {
  value?: ExperienceLevel;
  onChange: (next: ExperienceLevel) => void;
}) {
  const { ob } = useOnboardingTheme();

  return (
    <OnboardingPillStack>
      {EXPERIENCE_LEVEL_OPTIONS.map((level) => {
        const selected = value === level;
        const pill = onboardingPillColors(ob, selected);
        const subtitleColor = onboardingPillSubtextColor(ob, selected);
        return (
          <OnboardingSegment key={level} selected={selected} onPress={() => onChange(level)}>
            <View className="w-full items-start gap-1">
              <Text className="text-base font-medium" style={{ color: pill.color }}>
                {EXPERIENCE_LEVEL_LABELS[level]}
              </Text>
              <Text className="text-sm" style={{ color: subtitleColor }}>
                {EXPERIENCE_LEVEL_DESCRIPTIONS[level]}
              </Text>
            </View>
          </OnboardingSegment>
        );
      })}
    </OnboardingPillStack>
  );
}
