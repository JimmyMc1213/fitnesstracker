import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export function ProgressSectionLabel({ children, right }: { children: string; right?: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View className="mb-3 mt-7 flex-row items-center justify-between">
      <Text
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: colors.textTertiary }}
      >
        {children}
      </Text>
      {right}
    </View>
  );
}
