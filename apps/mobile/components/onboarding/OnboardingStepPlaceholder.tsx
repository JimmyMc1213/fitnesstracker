import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { stepTitleForPlaceholder } from "@/lib/onboardingWizardNavigation";

type OnboardingStepPlaceholderProps = {
  step: number;
  goal?: import("@newyouai/types").NutritionGoal;
};

export function OnboardingStepPlaceholder({ step, goal }: OnboardingStepPlaceholderProps) {
  const { colors } = useAppTheme();
  const title = stepTitleForPlaceholder(step, goal);

  return (
    <View
      className="flex-1 items-center justify-center rounded-2xl border px-4 py-8"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
      testID={`onboarding-step-${step}`}
    >
      <Text className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>
        Screen content ships in RN-4-02+.
      </Text>
    </View>
  );
}
