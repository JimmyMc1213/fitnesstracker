import { Stack } from "expo-router";

import { modalStackScreenOptions } from "@/lib/navigationMotion";

export default function ModalsLayout() {
  return <Stack screenOptions={modalStackScreenOptions} />;
}
