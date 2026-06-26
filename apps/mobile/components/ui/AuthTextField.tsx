import type { TextInputProps } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

import { AlignedTextInput } from "./AlignedTextInput";

/** Auth screen email/password/name fields — pill shape, caret-aligned. */
export function AuthTextField(props: TextInputProps) {
  const { colors } = useAppTheme();

  return (
    <AlignedTextInput
      size="auth"
      shellStyle={{ borderColor: colors.border, backgroundColor: colors.card }}
      inputStyle={{ color: colors.textPrimary }}
      placeholderTextColor={colors.textTertiary}
      {...props}
    />
  );
}
