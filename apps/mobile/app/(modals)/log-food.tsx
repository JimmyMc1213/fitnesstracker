import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function LogFoodModalScreen() {
  const { colors } = useAppTheme();

  return (
    <View
      className="px-screen-x"
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: 24 }}
      testID="modal-log-food"
    >
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-[22px] font-bold" style={{ color: colors.textPrimary }}>
          Log food
        </Text>
        <Pressable
          onPress={() => router.back()}
          testID="modal-close"
          accessibilityLabel="Close"
          className="rounded-full border px-4 py-2"
          style={{ borderColor: colors.border }}
        >
          <Text style={{ color: colors.textPrimary }}>Close</Text>
        </Pressable>
      </View>
      <Text style={{ color: colors.textSecondary }}>Nutrition log UI ships in RN-7.</Text>
    </View>
  );
}
