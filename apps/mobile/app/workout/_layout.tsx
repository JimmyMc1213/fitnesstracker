import { Stack } from "expo-router";

import { defaultStackScreenOptions, pushStackScreenOptions } from "@/lib/navigationMotion";

export default function WorkoutStackLayout() {
  return (
    <Stack screenOptions={pushStackScreenOptions}>
      <Stack.Screen name="history" options={defaultStackScreenOptions} />
    </Stack>
  );
}
