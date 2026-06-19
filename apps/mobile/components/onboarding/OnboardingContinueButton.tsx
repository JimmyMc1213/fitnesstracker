import type { ReactNode } from "react";
import { Text } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import {
  ONBOARDING_CONTINUE_HEIGHT,
  type OnboardingContinueTone,
  onboardingContinueColors,
  onboardingPillColors,
  ONBOARDING_PILL_MIN_HEIGHT,
} from "@/lib/onboardingTheme";

type ContinueProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: OnboardingContinueTone;
  testID?: string;
};

export function OnboardingContinueButton({
  label,
  onPress,
  disabled = false,
  tone = "default",
  testID = "onboarding-continue",
}: ContinueProps) {
  const { ob } = useOnboardingTheme();
  const continueStyle = onboardingContinueColors(ob, tone, disabled);
  const hasBorder = tone === "dark" && !disabled;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      style={{
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        paddingHorizontal: 24,
        minHeight: ONBOARDING_CONTINUE_HEIGHT,
        backgroundColor: continueStyle.backgroundColor,
        borderWidth: hasBorder ? 1 : 0,
        borderColor: continueStyle.borderColor,
      }}
    >
      <Text className="text-base font-semibold tracking-tight" style={{ color: continueStyle.color }}>
        {label}
      </Text>
    </PressableScale>
  );
}

export function OnboardingGhostFooterAction({
  label,
  onPress,
  testID = "onboarding-skip",
  compact = false,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
  compact?: boolean;
}) {
  const { ob } = useOnboardingTheme();
  return (
    <PressableScale
      onPress={onPress}
      testID={testID}
      style={{ alignItems: "center", paddingVertical: compact ? 4 : 8 }}
    >
      <Text
        className={compact ? "text-[13px] font-medium" : "text-base font-medium"}
        style={{ color: ob.ghostFg }}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

export function OnboardingPillPressable({
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
    <PressableScale
      onPress={onPress}
      testID={testID}
      style={{
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: ONBOARDING_PILL_MIN_HEIGHT,
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
    </PressableScale>
  );
}
