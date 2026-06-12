import type { AppTheme } from "@newyouai/types";
import { Pressable, Text, View } from "react-native";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  step: number;
  value: AppTheme;
  onChange: (theme: AppTheme) => void;
  onBack: () => void;
  onContinue: () => void;
};

function ThemeOption({
  label,
  hint,
  selected,
  onPress,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center rounded-2xl border px-4 py-5"
      style={{
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: selected ? `${colors.accent}22` : colors.card,
      }}
    >
      <Text className="text-lg font-semibold" style={{ color: selected ? colors.accent : colors.textPrimary }}>
        {label}
      </Text>
      <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
        {hint}
      </Text>
    </Pressable>
  );
}

export function OnboardingThemePicker({ step, value, onChange, onBack, onContinue }: Props) {
  const isLight = value === "light";

  return (
    <OnboardingShell
      step={step}
      title="Choose your look"
      subtitle="You can change this anytime in Settings"
      onBack={onBack}
      onContinue={onContinue}
      hideProgress
      testID="onboarding-step-1"
    >
      <View className="flex-1 justify-center">
        <View className="flex-row gap-3">
          <ThemeOption
            label="Light"
            hint="Clean and bright"
            selected={isLight}
            onPress={() => onChange("light")}
          />
          <ThemeOption
            label="Dark"
            hint="Easy on the eyes"
            selected={!isLight}
            onPress={() => onChange("dark")}
          />
        </View>
      </View>
    </OnboardingShell>
  );
}
