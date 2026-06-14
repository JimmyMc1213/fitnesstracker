import type { ReactNode } from "react";
import { View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export function SettingsRowIcon({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();

  return (
    <View
      className="mr-3 h-8 w-8 items-center justify-center rounded-lg"
      style={{ backgroundColor: colors.backgroundTertiary }}
    >
      {children}
    </View>
  );
}
