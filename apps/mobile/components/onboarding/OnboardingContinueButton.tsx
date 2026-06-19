import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

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
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      className="items-center justify-center rounded-full px-6"
      style={{
        minHeight: ONBOARDING_CONTINUE_HEIGHT,
        backgroundColor: continueStyle.backgroundColor,
        borderWidth: hasBorder ? 1 : 0,
        borderColor: continueStyle.borderColor,
      }}
    >
      <Text className="text-base font-semibold tracking-tight" style={{ color: continueStyle.color }}>
        {label}
      </Text>
    </Pressable>
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
    <Pressable onPress={onPress} testID={testID} className={`items-center${compact ? " py-1" : " py-2"}`}>
      <Text
        className={compact ? "text-[13px] font-medium" : "text-base font-medium"}
        style={{ color: ob.ghostFg }}
      >
        {label}
      </Text>
    </Pressable>
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
    <Pressable
      onPress={onPress}
      testID={testID}
      className={`items-center justify-center rounded-full border px-4 py-3.5${
        layout === "inline" ? " flex-1" : ""
      }`}
      style={{
        minHeight: ONBOARDING_PILL_MIN_HEIGHT,
        borderColor: pill.borderColor,
        backgroundColor: pill.backgroundColor,
      }}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text className="text-base font-medium" style={{ color: pill.color }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
