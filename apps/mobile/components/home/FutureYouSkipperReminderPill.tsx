import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import {
  FUTURE_YOU_SKIPPER_PILL_DISMISS_ARIA,
  FUTURE_YOU_SKIPPER_PILL_HEADLINE,
  FUTURE_YOU_SKIPPER_PILL_SUBLINE,
} from "@/lib/futureYouHomeEntryModel";
import {
  FUTURE_YOU_CALLOUT_BG,
  FUTURE_YOU_CALLOUT_SUBLINE,
  FUTURE_YOU_GOLD,
  FUTURE_YOU_GOLD_MID,
} from "@/lib/futureYouTokens";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  onOpen: () => void;
  onDismiss: () => void;
};

export function FutureYouSkipperReminderPill({ onOpen, onDismiss }: Props) {
  const { colors } = useAppTheme();

  return (
    <View testID="future-you-skipper-pill" className="relative mt-[18px] mb-2.5">
      <Pressable
        onPress={onOpen}
        className="w-full rounded-full border py-2.5 pl-5 pr-11"
        style={{
          borderColor: FUTURE_YOU_GOLD,
          backgroundColor: FUTURE_YOU_CALLOUT_BG,
          shadowColor: FUTURE_YOU_GOLD,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.32,
          shadowRadius: 16,
          elevation: 4,
        }}
      >
        <Text className="text-[13px] font-semibold tracking-tight" style={{ color: FUTURE_YOU_GOLD_MID }}>
          {FUTURE_YOU_SKIPPER_PILL_HEADLINE}
        </Text>
        <Text className="mt-0.5 text-xs font-medium leading-[1.3]" style={{ color: FUTURE_YOU_CALLOUT_SUBLINE }}>
          {FUTURE_YOU_SKIPPER_PILL_SUBLINE}
        </Text>
      </Pressable>
      <Pressable
        onPress={onDismiss}
        accessibilityLabel={FUTURE_YOU_SKIPPER_PILL_DISMISS_ARIA}
        testID="future-you-skipper-dismiss"
        className="absolute right-2 h-7 w-7 items-center justify-center rounded-full"
        style={{ top: "50%", marginTop: -14 }}
      >
        <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} tintColor={colors.textTertiary} size={14} />
      </Pressable>
    </View>
  );
}
