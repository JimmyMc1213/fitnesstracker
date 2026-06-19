import { Pressable, Text, View } from "react-native";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { onboardingPillColors, ONBOARDING_PILL_MIN_HEIGHT } from "@/lib/onboardingTheme";

type Option<T extends string> = {
  id: T;
  label: string;
  emoji: string;
};

export function OnboardingIconOptionPicker<T extends string>({
  options,
  selected,
  onToggle,
  multi = false,
}: {
  options: Option<T>[];
  selected: T | T[] | undefined;
  onToggle: (id: T) => void;
  multi?: boolean;
}) {
  const { ob } = useOnboardingTheme();

  function isSelected(id: T): boolean {
    if (multi) {
      return Array.isArray(selected) && selected.includes(id);
    }
    return selected === id;
  }

  return (
    <View className="gap-2">
      {options.map(({ id, label, emoji }) => {
        const on = isSelected(id);
        const pill = onboardingPillColors(ob, on);
        return (
          <Pressable
            key={id}
            onPress={() => onToggle(id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            className="min-h-[56px] flex-row items-center gap-3 rounded-full border px-4 py-3.5"
            style={{
              borderColor: pill.borderColor,
              backgroundColor: pill.backgroundColor,
            }}
          >
            <Text className="text-xl">{emoji}</Text>
            <Text className="flex-1 text-base font-medium" style={{ color: pill.color }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
