import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { onboardingPillColors, ONBOARDING_PILL_MIN_HEIGHT } from "@/lib/onboardingTheme";

export function OnboardingSegment({
  selected,
  onPress,
  children,
  layout = "stack",
  testID,
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  layout?: "stack" | "inline";
  testID?: string;
}) {
  const { ob } = useOnboardingTheme();
  const pill = onboardingPillColors(ob, selected);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        minHeight: ONBOARDING_PILL_MIN_HEIGHT,
        borderWidth: 1.5,
        borderRadius: 9999,
        paddingHorizontal: 16,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        borderColor: pill.borderColor,
        backgroundColor: pill.backgroundColor,
        ...(layout === "inline" ? { flex: 1 } : null),
      }}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text className="text-base font-medium" style={{ color: pill.color }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function OnboardingPillStack({ children }: { children: ReactNode }) {
  return <View className="gap-3">{children}</View>;
}

export function OnboardingPillRow({ children }: { children: ReactNode }) {
  return <View className="flex-row gap-2">{children}</View>;
}
