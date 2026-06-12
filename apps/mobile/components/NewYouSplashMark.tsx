import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

function BrandIcon({ color }: { color: string }) {
  return (
    <View className="h-[22px] w-[22px] flex-row items-center justify-center" accessibilityElementsHidden>
      <View className="h-8 w-[3px] rounded-sm" style={{ backgroundColor: color }} />
      <View className="mx-0.5 h-5 w-[2.5px] rounded-sm" style={{ backgroundColor: color }} />
      <View className="h-0.5 w-6 rounded-sm" style={{ backgroundColor: color }} />
      <View className="mx-0.5 h-5 w-[2.5px] rounded-sm" style={{ backgroundColor: color }} />
      <View className="h-8 w-[3px] rounded-sm" style={{ backgroundColor: color }} />
    </View>
  );
}

export function NewYouSplashMark() {
  const { colors } = useAppTheme();

  return (
    <View className="items-center" testID="splash-mark">
      <View
        className="mb-4 h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.accent }}
      >
        <BrandIcon color={colors.accentText} />
      </View>
      <Text className="text-[28px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
        NewYou
      </Text>
    </View>
  );
}
