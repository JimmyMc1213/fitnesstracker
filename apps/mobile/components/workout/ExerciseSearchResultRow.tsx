import { StyleSheet, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FUTURE_YOU_GOLD } from "@/lib/futureYouTokens";

type Props = {
  name: string;
  label?: string;
  onPick: () => void;
  selected?: boolean;
  divider?: boolean;
};

export function ExerciseSearchResultRow({ name, label, onPick, selected = false, divider = false }: Props) {
  const { colors } = useAppTheme();

  return (
    <View>
      <Pressable
        onPress={onPick}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        className="flex-row items-center gap-2 rounded-xl px-3 py-3"
        style={{ backgroundColor: selected ? "rgba(201,168,118,0.14)" : "transparent" }}
      >
        <View className="min-w-0 flex-1">
          <Text
            className="text-[15px] font-semibold"
            style={{ color: selected ? FUTURE_YOU_GOLD : colors.textPrimary }}
          >
            {name}
          </Text>
          {label ? (
            <Text className="mt-0.5 text-xs font-medium uppercase tracking-wide" style={{ color: colors.textTertiary }}>
              {label}
            </Text>
          ) : null}
        </View>
        {selected ? (
          <Text className="text-base font-bold" style={{ color: FUTURE_YOU_GOLD }}>
            ✓
          </Text>
        ) : null}
      </Pressable>
      {divider ? (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            marginHorizontal: 16,
            backgroundColor: colors.border,
          }}
        />
      ) : null}
    </View>
  );
}

export function ExerciseSearchSectionHeader({ title }: { title: string }) {
  const { colors } = useAppTheme();

  return (
    <Text
      className="mb-1 mt-2 px-1 text-[11px] font-bold uppercase tracking-widest"
      style={{ color: colors.textTertiary }}
    >
      {title}
    </Text>
  );
}
