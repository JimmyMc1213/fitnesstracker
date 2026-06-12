import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

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
  const { colors } = useAppTheme();

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
        return (
          <Pressable
            key={id}
            onPress={() => onToggle(id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            className="flex-row items-center gap-3 rounded-2xl border px-4 py-3.5"
            style={{
              borderColor: on ? colors.accent : colors.border,
              backgroundColor: on ? `${colors.accent}22` : colors.card,
            }}
          >
            <Text className="text-xl">{emoji}</Text>
            <Text className="flex-1 text-base font-medium" style={{ color: colors.textPrimary }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
