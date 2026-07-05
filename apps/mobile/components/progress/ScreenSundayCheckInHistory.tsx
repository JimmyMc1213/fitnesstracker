import type { AppState } from "@newyouai/types";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/home/ScreenHeader";
import { SundayCheckInHistoryList } from "@/components/progress/SundayCheckInHistorySection";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  state: AppState;
  onBack: () => void;
};

export function ScreenSundayCheckInHistory({ state, onBack }: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const history = state.sundayCheckInHistory ?? [];
  const count = history.length;

  return (
    <View
      testID="sunday-history-page"
      className="flex-1 px-screen-x"
      style={{ backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <PressableBack onBack={onBack} />

      <ScreenHeader eyebrow="PROGRESS" title="Weekly check-ins" />

      <Text className="mb-4 mt-1 text-[13px] font-medium" style={{ color: colors.textTertiary }}>
        {count > 0
          ? `${count} saved recap${count === 1 ? "" : "s"} · newest first`
          : "Complete a Sunday check-in to see recaps here."}
      </Text>

      {count === 0 ? (
        <View
          className="items-center rounded-[14px] border p-7"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Text className="text-sm leading-[1.5]" style={{ color: colors.textTertiary }}>
            No check-ins saved yet.
          </Text>
        </View>
      ) : (
        <SundayCheckInHistoryList history={history} unitPreferences={state.unitPreferences} />
      )}
    </View>
  );
}

function PressableBack({ onBack }: { onBack: () => void }) {
  const { colors } = useAppTheme();

  return (
    <View className="mb-2 mt-1">
      <Pressable
        testID="sunday-history-back"
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back to progress"
        className="self-start py-2"
      >
        <Text className="text-[15px] font-semibold" style={{ color: colors.accent }}>
          ← Back
        </Text>
      </Pressable>
    </View>
  );
}
