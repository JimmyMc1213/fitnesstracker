import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  name: string;
  label?: string;
  onPick: () => void;
};

export function ExerciseSearchResultRow({ name, label, onPick }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPick}
      className="flex-row items-center gap-2 rounded-xl px-3 py-3"
      style={{ backgroundColor: "transparent" }}
    >
      <View className="min-w-0 flex-1">
        <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
          {name}
        </Text>
        {label ? (
          <Text className="mt-0.5 text-xs font-medium uppercase tracking-wide" style={{ color: colors.textTertiary }}>
            {label}
          </Text>
        ) : null}
      </View>
    </Pressable>
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
