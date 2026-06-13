import { Stack } from "expo-router";

export default function WorkoutStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="history" options={{ title: "History", headerShown: false }} />
    </Stack>
  );
}
