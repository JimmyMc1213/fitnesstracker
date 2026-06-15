import { router, Tabs } from "expo-router";

import { AppShellErrorBoundary } from "@/components/AppShellErrorBoundary";
import { TabBarDock } from "@/components/TabBarDock";
import { WorkoutShellProvider } from "@/context/WorkoutShellContext";

export default function TabLayout() {
  return (
    <AppShellErrorBoundary onRetry={() => router.replace("/(tabs)/home")}>
      <WorkoutShellProvider>
      <Tabs
      initialRouteName="home"
      tabBar={(props) => (
        <TabBarDock state={props.state} descriptors={props.descriptors} navigation={props.navigation} />
      )}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: { flex: 1, backgroundColor: "transparent" },
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
      </WorkoutShellProvider>
    </AppShellErrorBoundary>
  );
}
