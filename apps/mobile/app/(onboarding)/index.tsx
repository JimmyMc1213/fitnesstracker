import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function OnboardingStubScreen() {
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
      testID="onboarding-stub"
    >
      <Text className="mb-2 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
        Welcome to New You AI
      </Text>
      <Text className="text-center text-base" style={{ color: colors.textSecondary }}>
        Onboarding ships in RN-4.
      </Text>
    </View>
  );
}
