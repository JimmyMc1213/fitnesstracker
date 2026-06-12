import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export function OnboardingSegment({
  selected,
  onPress,
  children,
  layout = "stack",
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  layout?: "stack" | "inline";
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className={`items-center justify-center rounded-2xl border px-4 py-3.5${layout === "inline" ? " flex-1" : ""}`}
      style={{
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: selected ? `${colors.accent}22` : colors.card,
      }}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text className="text-base font-medium" style={{ color: selected ? colors.accent : colors.textPrimary }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function OnboardingPillStack({ children }: { children: ReactNode }) {
  return <View className="gap-3">{children}</View>;
}

export function OnboardingPillRow({ children }: { children: ReactNode }) {
  return <View className="flex-row gap-2">{children}</View>;
}
