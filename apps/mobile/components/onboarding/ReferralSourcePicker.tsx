import type { ReferralSource } from "@newyouai/types";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { REFERRAL_SOURCES, referralSourceEmoji, referralSourceLabel } from "@/lib/referralSource";

export function ReferralSourcePicker({
  value,
  onChange,
}: {
  value?: ReferralSource;
  onChange: (source: ReferralSource) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View className="gap-2">
      {REFERRAL_SOURCES.map((source) => {
        const selected = value === source;
        return (
          <Pressable
            key={source}
            onPress={() => onChange(source)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className="flex-row items-center gap-3 rounded-2xl border px-4 py-3.5"
            style={{
              borderColor: selected ? colors.accent : colors.border,
              backgroundColor: selected ? `${colors.accent}22` : colors.card,
            }}
          >
            <Text className="text-xl">{referralSourceEmoji(source)}</Text>
            <Text className="flex-1 text-base font-medium" style={{ color: colors.textPrimary }}>
              {referralSourceLabel(source)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
