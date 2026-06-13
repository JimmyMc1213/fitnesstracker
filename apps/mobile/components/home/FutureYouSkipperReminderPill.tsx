import { Pressable, Text, View } from "react-native";

import {
  FUTURE_YOU_SKIPPER_PILL_DISMISS_ARIA,
  FUTURE_YOU_SKIPPER_PILL_HEADLINE,
  FUTURE_YOU_SKIPPER_PILL_SUBLINE,
} from "@/lib/futureYouHomeEntryModel";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  onOpen: () => void;
  onDismiss: () => void;
};

export function FutureYouSkipperReminderPill({ onOpen, onDismiss }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      testID="future-you-skipper-pill"
      className="mt-2 flex-row items-stretch overflow-hidden rounded-xl border"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <Pressable onPress={onOpen} className="min-w-0 flex-1 px-3.5 py-3">
        <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
          {FUTURE_YOU_SKIPPER_PILL_HEADLINE}
        </Text>
        <Text className="mt-1 text-xs leading-[1.4]" style={{ color: colors.textSecondary }}>
          {FUTURE_YOU_SKIPPER_PILL_SUBLINE}
        </Text>
      </Pressable>
      <Pressable
        onPress={onDismiss}
        accessibilityLabel={FUTURE_YOU_SKIPPER_PILL_DISMISS_ARIA}
        testID="future-you-skipper-dismiss"
        className="items-center justify-center px-3"
        style={{ borderLeftWidth: 0.5, borderLeftColor: colors.border }}
      >
        <Text style={{ color: colors.textTertiary }}>✕</Text>
      </Pressable>
    </View>
  );
}
