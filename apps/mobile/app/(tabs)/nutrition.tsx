import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { TabPlaceholderScreen } from "@/components/TabPlaceholderScreen";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function NutritionScreen() {
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabPlaceholderScreen
        testID="tab-nutrition"
        title="Nutrition"
        subtitle="Nutrition OS ships in RN-7."
      />
      <View className="absolute bottom-28 left-0 right-0 items-center px-screen-x">
        <Pressable
          className="min-w-[220px] items-center rounded-full border px-6 py-3"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
          onPress={() => router.push("/(modals)/log-food")}
          testID="open-log-food"
        >
          <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            Log food
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
