import { Pressable, Text, type StyleProp, type ViewStyle } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  children: string;
  onPress?: () => void;
  disabled?: boolean;
  block?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  children,
  onPress,
  disabled,
  block,
  testID,
  accessibilityLabel,
  style,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? children}
      className="min-h-[44px] items-center justify-center rounded-xl px-4 py-3"
      style={[
        {
          width: block ? "100%" : undefined,
          backgroundColor: disabled ? colors.border : colors.accent,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text className="text-[15px] font-semibold" style={{ color: colors.accentText }}>
        {children}
      </Text>
    </Pressable>
  );
}
