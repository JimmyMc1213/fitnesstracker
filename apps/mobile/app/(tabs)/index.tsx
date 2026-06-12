import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function HomeScreen() {
  const { colors } = useAppTheme();

  return (
    <View
      className="px-screen-x"
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
      testID="home-screen"
    >
      <Text
        className="mb-3 text-[28px] font-bold"
        style={{ color: colors.textPrimary }}
        testID="home-title"
      >
        New You AI
      </Text>
      <Text className="mb-2 text-center text-base" style={{ color: colors.textSecondary }}>
        Native iOS app — auth gate + SecureStore session (RN-2-01)
      </Text>
      <Text className="text-center text-sm" style={{ color: colors.textTertiary }}>
        Light/dark tokens follow system appearance. PWA parity starts at RN-1.
      </Text>
    </View>
  );
}
