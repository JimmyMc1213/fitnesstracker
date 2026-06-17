import { Stack } from "expo-router";

import { defaultStackScreenOptions } from "@/lib/navigationMotion";

export default function AuthLayout() {
  return (
    <Stack screenOptions={defaultStackScreenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
