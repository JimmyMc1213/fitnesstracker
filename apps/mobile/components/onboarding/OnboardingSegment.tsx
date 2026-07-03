import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { useLargeTextEnabled } from "@/lib/fontScale";
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
  const largeText = useLargeTextEnabled();
  const pill = onboardingPillColors(ob, selected);

  const inline = layout === "inline";

  return (
    <PressableScale
      onPress={onPress}
      testID={testID}
      activeScale={0.97}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        minHeight: inline ? 48 : ONBOARDING_PILL_MIN_HEIGHT,
        borderWidth: 1.5,
        borderRadius: 9999,
        paddingHorizontal: inline ? 12 : 16,
        paddingVertical: inline ? 10 : 14,
        alignItems: inline ? "center" : "flex-start",
        justifyContent: inline ? "center" : "flex-start",
        borderColor: pill.borderColor,
        backgroundColor: pill.backgroundColor,
        ...(inline ? { flex: 1, minWidth: 0 } : null),
      }}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          className={inline ? "text-[15px] font-medium" : "text-base font-medium"}
          style={{ color: pill.color }}
          numberOfLines={largeText ? undefined : 1}
          adjustsFontSizeToFit={inline && !largeText}
          minimumFontScale={inline && !largeText ? 0.85 : 1}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </PressableScale>
  );
}

export function OnboardingPillStack({ children }: { children: ReactNode }) {
  return <View className="gap-3">{children}</View>;
}

export function OnboardingPillRow({ children }: { children: ReactNode }) {
  return <View className="flex-row gap-2">{children}</View>;
}
