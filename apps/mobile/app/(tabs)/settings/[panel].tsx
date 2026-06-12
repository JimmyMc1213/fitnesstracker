import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function SettingsPanelScreen() {
  const { colors } = useAppTheme();
  const { panel } = useLocalSearchParams<{ panel: string }>();
  const panelName = typeof panel === "string" ? panel : "panel";
  const title = panelName.charAt(0).toUpperCase() + panelName.slice(1);

  return (
    <View
      className="px-screen-x"
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: 24 }}
      testID={`settings-panel-${panelName}`}
    >
      <Pressable
        onPress={() => router.back()}
        className="mb-4 self-start rounded-full border px-4 py-2"
        style={{ borderColor: colors.border }}
        testID="settings-panel-back"
      >
        <Text style={{ color: colors.textPrimary }}>Back</Text>
      </Pressable>
      <Text className="mb-2 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
        {title}
      </Text>
      <Text style={{ color: colors.textSecondary }}>Settings panel content ships in RN-10.</Text>
    </View>
  );
}
