import { Text, type StyleProp, type ViewStyle } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FUTURE_YOU_CALLOUT_BG, FUTURE_YOU_GOLD } from "@/lib/futureYouTokens";

type Props = {
  children: string;
  onPress?: () => void;
  disabled?: boolean;
  block?: boolean;
  tone?: "default" | "gold";
  /** Fire a subtle iOS selection haptic on press-in. Defaults to true. */
  haptic?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  children,
  onPress,
  disabled,
  block,
  tone = "default",
  haptic = true,
  testID,
  accessibilityLabel,
  style,
}: Props) {
  const { colors } = useAppTheme();

  const backgroundColor = disabled
    ? colors.border
    : tone === "gold"
      ? FUTURE_YOU_GOLD
      : colors.buttonPrimary;
  const textColor = disabled
    ? colors.textSecondary
    : tone === "gold"
      ? FUTURE_YOU_CALLOUT_BG
      : colors.buttonPrimaryText;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      haptic={haptic}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? children}
      style={[
        {
          minHeight: 44,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          width: block ? "100%" : undefined,
          backgroundColor,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text className="text-[15px] font-semibold" style={{ color: textColor }}>
        {children}
      </Text>
    </PressableScale>
  );
}
