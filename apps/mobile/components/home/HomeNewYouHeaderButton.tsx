import { Pressable, Text } from "react-native";

import { FUTURE_YOU_HOME_HEADER_ARIA, FUTURE_YOU_HOME_HEADER_LABEL } from "@/lib/futureYouHomeEntryModel";
import {
  FUTURE_YOU_CALLOUT_BG,
  FUTURE_YOU_GOLD,
  FUTURE_YOU_GOLD_MID,
} from "@/lib/futureYouTokens";

type Props = {
  onPress: () => void;
};

export function HomeNewYouHeaderButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      testID="home-newyou-header-button"
      accessibilityLabel={FUTURE_YOU_HOME_HEADER_ARIA}
      className="h-9 items-center justify-center rounded-full border px-3"
      style={{
        borderColor: FUTURE_YOU_GOLD,
        backgroundColor: FUTURE_YOU_CALLOUT_BG,
        shadowColor: FUTURE_YOU_GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.32,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <Text className="text-[13px] font-bold tracking-tight" style={{ color: FUTURE_YOU_GOLD_MID }}>
        {FUTURE_YOU_HOME_HEADER_LABEL}
      </Text>
    </Pressable>
  );
}
