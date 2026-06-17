import { Stack } from "expo-router";

import { pushStackScreenOptions } from "@/lib/navigationMotion";

export default function LogFoodStackLayout() {
  return <Stack screenOptions={pushStackScreenOptions} />;
}
