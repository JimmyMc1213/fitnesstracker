import { StyleSheet, Text, View, type TextInputProps, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { AlignedTextInput } from "@/components/ui/AlignedTextInput";

/** Mirrors PWA `.onboarding-input-pill` — fixed height, horizontal padding only. */
export const ONBOARDING_INPUT_HEIGHT = 56;
export const ONBOARDING_INPUT_FONT_SIZE = 18;

export type OnboardingInputShellStyle = Pick<ViewStyle, "borderColor" | "backgroundColor">;

export function OnboardingInputField({
  shellStyle,
  inputStyle,
  ...props
}: TextInputProps & {
  shellStyle: OnboardingInputShellStyle;
  inputStyle: { color: string };
}) {
  return (
    <AlignedTextInput size="onboarding" shellStyle={shellStyle} inputStyle={inputStyle} {...props} />
  );
}

export function OnboardingFieldGroup({
  label,
  labelColor,
  children,
  style,
  fill = false,
}: {
  label?: string;
  labelColor: string;
  children: ReactNode;
  style?: ViewStyle;
  /** When true, expands in a horizontal row (e.g. ft + in). Off in vertical stacks like Units. */
  fill?: boolean;
}) {
  return (
    <View style={[styles.fieldGroup, fill ? styles.fieldGroupFill : null, style]}>
      {label ? <Text style={[styles.label, { color: labelColor }]}>{label}</Text> : null}
      {children}
    </View>
  );
}

export function acceptsOnboardingWeightText(raw: string): boolean {
  if (raw === "") return true;
  if (!/^\d*\.?\d*$/.test(raw)) return false;
  return raw.replace(/\D/g, "").length <= 3;
}

export const onboardingInputStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldGroupFill: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.66,
    lineHeight: 14,
    textTransform: "uppercase",
  },
});

const styles = onboardingInputStyles;
