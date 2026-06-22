import { Stack } from "expo-router";

import { fadeStackScreenOptions, pushStackScreenOptions } from "@/lib/navigationMotion";

export default function WorkoutStackLayout() {
  return (
    <Stack screenOptions={pushStackScreenOptions}>
      <Stack.Screen name="history" options={fadeStackScreenOptions} />
    </Stack>
  );
}
