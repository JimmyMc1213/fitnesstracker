import type { TextInputProps } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { isMaestroE2eAuthInput } from "@/lib/e2e/maestroAuthInput";

import { AlignedTextInput } from "./AlignedTextInput";

/** Auth screen email/password/name fields — pill shape, caret-aligned. */
export function AuthTextField({ secureTextEntry, ...props }: TextInputProps) {
  const { colors } = useAppTheme();
  const maestroE2e = isMaestroE2eAuthInput();

  return (
    <AlignedTextInput
      size="auth"
      shellStyle={{ borderColor: colors.border, backgroundColor: colors.card }}
      inputStyle={{ color: colors.textPrimary }}
      placeholderTextColor={colors.textTertiary}
      secureTextEntry={secureTextEntry && !maestroE2e}
      {...props}
    />
  );
}
