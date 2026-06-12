import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useAppTheme } from "@/hooks/useAppTheme";

type ThemeShellProps = {
  children: ReactNode;
};

export function ThemeShell({ children }: ThemeShellProps) {
  const { scheme, colors } = useAppTheme();

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }} className="flex-1">
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        {children}
      </View>
    </SafeAreaProvider>
  );
}
