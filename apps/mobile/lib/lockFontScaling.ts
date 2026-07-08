import { Text, TextInput, type TextProps } from "react-native";
import Animated from "react-native-reanimated";

type TextLikeComponent = {
  defaultProps?: Partial<TextProps>;
};

/** Keep typography and layout fixed regardless of iOS Dynamic Type / Android font size. */
function lockTextComponent(Component: TextLikeComponent): void {
  Component.defaultProps = {
    ...Component.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };
}

lockTextComponent(Text as unknown as TextLikeComponent);
lockTextComponent(TextInput as unknown as TextLikeComponent);
lockTextComponent(Animated.Text as unknown as TextLikeComponent);

export function isFontScalingLocked(): boolean {
  const text = Text as unknown as TextLikeComponent;
  return text.defaultProps?.allowFontScaling === false;
}
