import { Stack } from "expo-router";

import { pushStackScreenOptions } from "@/lib/navigationMotion";

export default function ProgressStackLayout() {
  return (
    <Stack screenOptions={pushStackScreenOptions}>
      <Stack.Screen name="gallery" />
    </Stack>
  );
}
