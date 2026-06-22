import { Stack } from "expo-router";

import { fadeStackScreenOptions, pushStackScreenOptions } from "@/lib/navigationMotion";

export default function ProgressStackLayout() {
  return (
    <Stack screenOptions={pushStackScreenOptions}>
      <Stack.Screen name="gallery" options={fadeStackScreenOptions} />
    </Stack>
  );
}
