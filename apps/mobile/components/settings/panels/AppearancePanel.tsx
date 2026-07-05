import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { SettingsDetailCard, SettingsHelper } from "@/components/settings/SettingsLayout";
import { useAppTheme } from "@/hooks/useAppTheme";

export function AppearancePanel() {
  const { colors, theme, setTheme } = useAppTheme();

  return (
    <View>
      <SettingsHelper>Choose light or dark mode for the app interface.</SettingsHelper>
      <SettingsDetailCard>
        <View className="flex-row" style={{ gap: 8 }}>
          {(["light", "dark"] as const).map((option) => {
            const active = theme === option;
            return (
              <Pressable
                key={option}
                testID={option === "light" ? "settings-appearance-light" : "settings-appearance-dark"}
                onPress={() => setTheme(option)}
                className="flex-1 items-center rounded-xl border px-4 py-3"
                style={{
                  borderColor: active ? colors.textPrimary : colors.border,
                  backgroundColor: active ? colors.backgroundTertiary : colors.backgroundSecondary,
                }}
              >
                <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>
                  {option === "dark" ? "Dark" : "Light"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SettingsDetailCard>
    </View>
  );
}
