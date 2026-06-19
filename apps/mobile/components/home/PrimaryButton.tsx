import { Text, type StyleProp, type ViewStyle } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
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
    <PressableScale
      onPress={onPress}
      disabled={disabled}
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
          backgroundColor: disabled ? colors.border : colors.buttonPrimary,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text className="text-[15px] font-semibold" style={{ color: colors.buttonPrimaryText }}>
        {children}
      </Text>
    </PressableScale>
  );
}
