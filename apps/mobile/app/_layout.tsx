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

import { AuthSessionRedirect } from "@/components/AuthSessionRedirect";
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
import {
  defaultStackScreenOptions,
  modalStackScreenOptions,
  pushStackScreenOptions,
} from "@/lib/navigationMotion";
import { initLocalNotifications } from "@/lib/localNotifications";
import { hasAuthenticatedUser } from "@/lib/authSession";
import { isVisualParityMode, isVisualParityWebFrame } from "@/lib/visualParity";

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <AppShellErrorFallback onRetry={retry} />;
}

export const unstable_settings = {
  initialRouteName: isVisualParityMode() ? "(tabs)" : "(auth)",
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

function AppShellLoadingGate({
  children,
  signedOut = false,
}: {
  children: ReactNode;
  signedOut?: boolean;
}) {
  const { sessionEmail } = useAuth();
  const shellInput = useAppShellRoutingInput();
  const { onboardingStubHydrated } = useOnboardingStub();

  if (isVisualParityWebFrame() || signedOut) {
    return children;
  }

  const awaitingOnboardingStub = sessionEmail != null && !onboardingStubHydrated;

  if (awaitingOnboardingStub || isAppShellLoading(shellInput)) {
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
  const { session, sessionResolved } = useAuth();
  const bypassAuth = isVisualParityWebFrame();
  const signedOut = !bypassAuth && sessionResolved && !hasAuthenticatedUser(session);

  useAppShellGate();

  if (!bypassAuth && !sessionResolved) {
    return (
      <ThemeProvider value={navigationTheme(colorScheme)}>
        <AppShellLoading />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={navigationTheme(colorScheme)}>
      <AppShellLoadingGate signedOut={signedOut}>
        <AuthSessionRedirect />
        <DeepLinkListener />
        <Stack screenOptions={defaultStackScreenOptions}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(modals)" options={modalStackScreenOptions} />
          <Stack.Screen name="log-food" options={pushStackScreenOptions} />
          <Stack.Screen name="workout" options={pushStackScreenOptions} />
          <Stack.Screen name="progress" options={pushStackScreenOptions} />
        </Stack>
      </AppShellLoadingGate>
    </ThemeProvider>
  );
}
