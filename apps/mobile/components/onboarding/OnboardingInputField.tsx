import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";

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
    <View style={[styles.fieldShell, shellStyle]}>
      <TextInput {...props} style={[styles.fieldInput, inputStyle]} />
    </View>
  );
}

export function OnboardingFieldGroup({
  label,
  labelColor,
  children,
  style,
}: {
  label?: string;
  labelColor: string;
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.fieldGroup, style]}>
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
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.66,
    textTransform: "uppercase",
  },
  fieldShell: {
    height: ONBOARDING_INPUT_HEIGHT,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  fieldInput: {
    fontSize: ONBOARDING_INPUT_FONT_SIZE,
    fontWeight: "400",
    letterSpacing: -0.18,
    padding: 0,
    margin: 0,
    ...Platform.select({
      ios: { height: ONBOARDING_INPUT_FONT_SIZE + 2 },
      android: {
        paddingVertical: 0,
        textAlignVertical: "center",
        includeFontPadding: false,
      },
    }),
  },
});

const styles = onboardingInputStyles;
