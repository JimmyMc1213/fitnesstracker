import { darkThemeColors, lightThemeColors } from "@newyouai/config/tokens";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import "../global.css";

import { BootSplash } from "@/components/BootSplash";
import { ThemeShell } from "@/components/ThemeShell";
import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useAppTheme } from "@/hooks/useAppTheme";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Auth-first when Supabase is configured (AC1); tabs-first for unconfigured smoke (AC6).
  initialRouteName: isSupabaseConfigured() ? "(auth)" : "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function navigationTheme(scheme: "light" | "dark") {
  const palette = scheme === "dark" ? darkThemeColors : lightThemeColors;
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.accent,
      background: palette.background,
      card: palette.card,
      text: palette.textPrimary,
      border: palette.border,
      notification: palette.accent,
    },
  };
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [bootSplashVisible, setBootSplashVisible] = useState(true);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeShell>
      <AuthProvider>
        <View style={{ flex: 1 }}>
          <RootLayoutNav />
          {bootSplashVisible ? <BootSplash onComplete={() => setBootSplashVisible(false)} /> : null}
        </View>
      </AuthProvider>
    </ThemeShell>
  );
}

function SessionLoadingGate({ children }: { children: ReactNode }) {
  const { configured, sessionResolved } = useAuth();
  const { colors } = useAppTheme();

  if (configured && !sessionResolved) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}
        testID="auth-session-loading"
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return children;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  useAuthGate();

  return (
    <ThemeProvider value={navigationTheme(colorScheme)}>
      <SessionLoadingGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: "modal", headerShown: true, title: "Info" }} />
        </Stack>
      </SessionLoadingGate>
    </ThemeProvider>
  );
}
