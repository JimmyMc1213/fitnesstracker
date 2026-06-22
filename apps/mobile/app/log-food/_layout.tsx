import { Stack } from "expo-router";

import { RequireSignedInSession } from "@/hooks/useRequireSignedInSession";
import { defaultStackScreenOptions } from "@/lib/navigationMotion";

export default function LogFoodStackLayout() {
  return (
    <RequireSignedInSession>
      <Stack screenOptions={defaultStackScreenOptions} />
    </RequireSignedInSession>
  );
}
