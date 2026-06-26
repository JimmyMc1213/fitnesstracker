import { FUTURE_YOU_PAGE_NEW_CHIP_ARIA_LABEL, FUTURE_YOU_PAGE_NEW_CHIP_LABEL } from "@newyouai/core";
import { Pressable, Text } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { FUTURE_YOU_CALLOUT_BG, FUTURE_YOU_GOLD } from "@/lib/futureYouTokens";

type Props = {
  canRedo: boolean;
  onPress: () => void;
};

export function FutureYouNewChip({ canRedo, onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={FUTURE_YOU_PAGE_NEW_CHIP_ARIA_LABEL}
      accessibilityState={{ disabled: !canRedo }}
      disabled={!canRedo}
      onPress={onPress}
      className="rounded-[10px] px-[18px] py-[9px]"
      style={{
        backgroundColor: canRedo ? FUTURE_YOU_GOLD : colors.border,
      }}
    >
      <Text
        className="text-[15px] font-bold tracking-tight"
        style={{ color: canRedo ? FUTURE_YOU_CALLOUT_BG : colors.textTertiary }}
      >
        {FUTURE_YOU_PAGE_NEW_CHIP_LABEL}
      </Text>
    </Pressable>
  );
}
