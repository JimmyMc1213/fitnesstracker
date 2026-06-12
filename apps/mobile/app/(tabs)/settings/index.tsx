import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

const PANELS = [
  { id: "account", label: "Account", testID: "settings-panel-account" },
  { id: "notifications", label: "Notifications", testID: "settings-panel-notifications" },
] as const;

export default function SettingsHubScreen() {
  const { colors } = useAppTheme();

  return (
    <View
      className="px-screen-x"
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: 24 }}
      testID="settings-hub"
    >
      <Text className="mb-6 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
        Settings
      </Text>
      {PANELS.map((panel) => (
        <Pressable
          key={panel.id}
          testID={panel.testID}
          onPress={() => router.push(`/(tabs)/settings/${panel.id}`)}
          className="mb-3 rounded-xl border px-4 py-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            {panel.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
