import { Redirect, router, Tabs } from "expo-router";
import { View } from "react-native";

import { AppAtmosphere } from "@/components/AppAtmosphere";
import { AppShellErrorBoundary } from "@/components/AppShellErrorBoundary";
import { TabBarDock } from "@/components/TabBarDock";
import { RequireSignedInSession } from "@/hooks/useRequireSignedInSession";
import { useAuth } from "@/context/AuthContext";
import { hasAuthenticatedUser } from "@/lib/authSession";
import { useAppTheme } from "@/hooks/useAppTheme";
import { tabScreenOptions } from "@/lib/navigationMotion";

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { session } = useAuth();

  return (
    <RequireSignedInSession>
    <AppShellErrorBoundary
      onRetry={() => {
        router.replace(hasAuthenticatedUser(session) ? "/(tabs)/home" : "/(auth)");
      }}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppAtmosphere />
      <Tabs
      initialRouteName="home"
      tabBar={(props) => (
        <TabBarDock state={props.state} descriptors={props.descriptors} navigation={props.navigation} />
      )}
      screenOptions={{
        ...tabScreenOptions,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="nutrition" options={{ title: "Nutrition" }} />
      <Tabs.Screen name="workout" options={{ title: "Workout" }} />
      <Tabs.Screen name="progress" options={{ title: "Progress" }} />
      <Tabs.Screen name="settings" options={{ href: null, title: "Settings" }} />
      <Tabs.Screen name="future-you" options={{ href: null, title: "NewYou" }} />
    </Tabs>
      </View>
    </AppShellErrorBoundary>
    </RequireSignedInSession>
  );
}
