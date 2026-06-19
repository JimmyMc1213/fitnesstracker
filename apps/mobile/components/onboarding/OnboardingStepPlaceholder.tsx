import { Text, View } from "react-native";

import { GradientCard } from "@/components/ui/GradientCard";
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
    <View style={{ flex: 1 }} testID={`onboarding-step-${step}`}>
      <GradientCard
        style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 32 }}
      >
        <Text className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
          {title}
        </Text>
        <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>
          Screen content ships in RN-4-02+.
        </Text>
      </GradientCard>
    </View>
  );
}
