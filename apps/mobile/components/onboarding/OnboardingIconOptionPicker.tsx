import { Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { onboardingPillColors, ONBOARDING_PILL_MIN_HEIGHT } from "@/lib/onboardingTheme";
import type { TablerIcon } from "@/lib/tablerIcon";

type Option<T extends string> = {
  id: T;
  label: string;
  icon: TablerIcon;
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
      {options.map(({ id, label, icon: Icon }) => {
        const on = isSelected(id);
        const pill = onboardingPillColors(ob, on);
        return (
          <PressableScale
            key={id}
            onPress={() => onToggle(id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            activeScale={0.97}
            style={{
              minHeight: ONBOARDING_PILL_MIN_HEIGHT + 4,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderRadius: 9999,
              borderWidth: 1,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderColor: pill.borderColor,
              backgroundColor: pill.backgroundColor,
            }}
          >
            <Icon size={22} color={pill.color} strokeWidth={2} />
            <Text className="flex-1 text-base font-medium" style={{ color: pill.color }}>
              {label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
