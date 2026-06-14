import "react-native-gesture-handler";
import "../global.css";

import { darkThemeColors, lightThemeColors } from "@newyouai/config/tokens";
import { isAppShellLoading } from "@newyouai/core";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, type ReactNode } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AppShellErrorFallback } from "@/components/AppShellErrorFallback";
import { AppShellLoading } from "@/components/AppShellLoading";
import { BootSplash } from "@/components/BootSplash";
import { ThemeShell } from "@/components/ThemeShell";
import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FitnessProvider } from "@/context/FitnessContext";
import { FitnessSyncProvider } from "@/context/FitnessSyncContext";
import { NotificationSchedulerProvider } from "@/context/NotificationSchedulerContext";
import { useAppShellGate, useAppShellRoutingInput } from "@/hooks/useAppShellGate";
import { useDeepLinkHandler } from "@/hooks/useDeepLinkHandler";
import { useOnboardingStub } from "@/hooks/useOnboardingStub";
import { initLocalNotifications } from "@/lib/localNotifications";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { isVisualParityMode, isVisualParityWebFrame } from "@/lib/visualParity";

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <AppShellErrorFallback onRetry={retry} />;
}

export const unstable_settings = {
  // Auth-first when Supabase is configured (AC1); tabs-first for unconfigured smoke (AC6).
  initialRouteName:
    isVisualParityMode() ? "(tabs)" : isSupabaseConfigured() ? "(auth)" : "(tabs)",
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

  useEffect(() => {
    void initLocalNotifications().catch(() => {
      /* expo-notifications unavailable in this dev client */
    });
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        ...(isVisualParityWebFrame()
          ? { maxWidth: 393, width: "100%", alignSelf: "center", backgroundColor: "#0a0a0a" }
          : null),
      }}
    >
      <ThemeShell>
        <AuthProvider>
          <FitnessProvider>
            <FitnessSyncProvider>
              <NotificationSchedulerProvider>
                <View style={{ flex: 1 }}>
                  <RootLayoutNav />
                  {bootSplashVisible && !isVisualParityWebFrame() ? (
                    <BootSplash onComplete={() => setBootSplashVisible(false)} />
                  ) : null}
                </View>
              </NotificationSchedulerProvider>
            </FitnessSyncProvider>
          </FitnessProvider>
        </AuthProvider>
      </ThemeShell>
    </GestureHandlerRootView>
  );
}

function AppShellLoadingGate({ children }: { children: ReactNode }) {
  const { configured, sessionEmail } = useAuth();
  const shellInput = useAppShellRoutingInput();
  const { onboardingStubHydrated } = useOnboardingStub();

  if (isVisualParityWebFrame()) {
    return children;
  }

  const awaitingOnboardingStub =
    configured && sessionEmail != null && !onboardingStubHydrated;

  if (awaitingOnboardingStub || (configured && isAppShellLoading(shellInput))) {
    return <AppShellLoading />;
  }

  return children;
}

function DeepLinkListener() {
  const { completeOAuthFromUrl } = useAuth();
  useDeepLinkHandler(completeOAuthFromUrl);
  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  useAppShellGate();

  return (
    <ThemeProvider value={navigationTheme(colorScheme)}>
      <AppShellLoadingGate>
        <DeepLinkListener />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(modals)" options={{ presentation: "modal", headerShown: false }} />
          <Stack.Screen name="workout" options={{ headerShown: false }} />
          <Stack.Screen name="progress" options={{ headerShown: false }} />
        </Stack>
      </AppShellLoadingGate>
    </ThemeProvider>
  );
}
