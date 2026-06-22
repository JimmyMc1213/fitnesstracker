import { Stack } from "expo-router";

import { RequireSignedInSession } from "@/hooks/useRequireSignedInSession";
import { fadeStackScreenOptions, pushStackScreenOptions } from "@/lib/navigationMotion";

export default function WorkoutStackLayout() {
  return (
    <RequireSignedInSession>
      <Stack screenOptions={pushStackScreenOptions}>
        <Stack.Screen name="history" options={fadeStackScreenOptions} />
      </Stack>
    </RequireSignedInSession>
  );
}
