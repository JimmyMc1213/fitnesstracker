import { Stack } from "expo-router";

import { defaultStackScreenOptions } from "@/lib/navigationMotion";

export default function LogFoodStackLayout() {
  return <Stack screenOptions={defaultStackScreenOptions} />;
}
