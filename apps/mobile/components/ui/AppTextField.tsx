import type { TextInputProps } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

import {
  AlignedTextInput,
  type AlignedTextInputShellStyle,
  type AlignedTextInputSize,
} from "./AlignedTextInput";

type Props = TextInputProps & {
  size?: AlignedTextInputSize;
  backgroundColor?: string;
  shellStyle?: AlignedTextInputShellStyle;
  multilineMinHeight?: number;
  inline?: boolean;
};

/** Theme-aware single or multiline field — use instead of raw TextInput with py-* padding. */
export function AppTextField({
  size = "field",
  backgroundColor,
  shellStyle,
  multilineMinHeight,
  inline,
  style,
  placeholderTextColor,
  ...props
}: Props) {
  const { colors } = useAppTheme();

  return (
    <AlignedTextInput
      size={size}
      inline={inline}
      multilineMinHeight={multilineMinHeight}
      shellStyle={{
        borderColor: colors.border,
        backgroundColor: backgroundColor ?? colors.backgroundSecondary,
        ...shellStyle,
      }}
      inputStyle={{ color: colors.textPrimary }}
      placeholderTextColor={placeholderTextColor ?? colors.textTertiary}
      style={style}
      {...props}
    />
  );
}
