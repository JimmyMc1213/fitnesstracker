import { Stack } from "expo-router";

import { RequireSignedInSession } from "@/hooks/useRequireSignedInSession";
import { modalStackScreenOptions } from "@/lib/navigationMotion";

export default function ModalsLayout() {
  return (
    <RequireSignedInSession>
      <Stack screenOptions={modalStackScreenOptions} />
    </RequireSignedInSession>
  );
}
