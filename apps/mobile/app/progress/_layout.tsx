import { Stack } from "expo-router";

import { RequireSignedInSession } from "@/hooks/useRequireSignedInSession";
import { fadeStackScreenOptions, pushStackScreenOptions } from "@/lib/navigationMotion";

export default function ProgressStackLayout() {
  return (
    <RequireSignedInSession>
      <Stack screenOptions={pushStackScreenOptions}>
        <Stack.Screen name="gallery" options={fadeStackScreenOptions} />
      </Stack>
    </RequireSignedInSession>
  );
}
