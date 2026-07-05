import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { useAppTheme } from "@/hooks/useAppTheme";

type AppShellErrorFallbackProps = {
  onRetry: () => void;
};

export function AppShellErrorFallback({ onRetry }: AppShellErrorFallbackProps) {
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
      testID="app-shell-error"
    >
      <Text className="mb-2 text-[22px] font-bold" style={{ color: colors.textPrimary }}>
        Something went wrong
      </Text>
      <Text className="mb-6 text-center text-base" style={{ color: colors.textSecondary }}>
        We hit an unexpected error. Try again and the screen should recover.
      </Text>
      <Pressable
        onPress={onRetry}
        testID="app-shell-error-retry"
        className="rounded-full border px-6 py-3"
        style={{ borderColor: colors.border }}
      >
        <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}
