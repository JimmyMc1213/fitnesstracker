import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { useBottomActionPadding } from "@/lib/screenInsets";

type Props = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  bordered?: boolean;
  borderColor?: string;
};

export function BottomActionBar({
  children,
  className = "px-screen-x pt-2",
  style,
  bordered,
  borderColor,
}: Props) {
  const paddingBottom = useBottomActionPadding();

  return (
    <View
      className={className}
      style={[
        { paddingBottom },
        bordered ? { borderTopWidth: 1, borderTopColor: borderColor } : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}
