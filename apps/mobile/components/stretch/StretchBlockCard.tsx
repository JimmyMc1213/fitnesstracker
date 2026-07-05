import { useState } from "react";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { IconCheck, IconChevR } from "@/components/icons/FitnessIcons";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { StretchBlock } from "@/lib/stretchRoutine";
import { mobilityColors } from "@/lib/workoutUiTokens";

type Props = {
  block: StretchBlock;
  blockIndex: number;
  isDone: boolean;
  onToggleDone: () => void;
};

export function StretchBlockCard({ block, blockIndex, isDone, onToggleDone }: Props) {
  const { colors, theme } = useAppTheme();
  const mobility = mobilityColors(theme);
  const [cuesOpen, setCuesOpen] = useState(false);

  return (
    <View
      className="rounded-xl border px-3.5 py-3.5"
      style={{
        borderColor: isDone ? mobility.borderDone : colors.border,
        backgroundColor: colors.backgroundSecondary,
        opacity: isDone ? 0.88 : 1,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View className="min-w-0 flex-1">
          <Text className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
            Move {blockIndex + 1}
          </Text>
          <Text
            className="text-[17px] font-bold leading-[1.25] tracking-tight"
            style={{
              color: isDone ? colors.textSecondary : colors.textPrimary,
              textDecorationLine: isDone ? "line-through" : "none",
            }}
          >
            {block.title}
          </Text>
          {block.minutes ? (
            <Text className="mt-2 text-xs font-medium" style={{ color: mobility.accent }}>
              {block.minutes}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onToggleDone}
          accessibilityLabel={isDone ? `Mark ${block.title} incomplete` : `Mark ${block.title} complete`}
          className="h-9 w-9 items-center justify-center rounded-[10px] border"
          style={{
            borderColor: isDone ? colors.accent : colors.border,
            backgroundColor: isDone ? colors.accent : colors.background,
          }}
        >
          {isDone ? <IconCheck size={16} stroke={2.8} color={colors.accentText} /> : null}
        </Pressable>
      </View>

      <Pressable
        onPress={() => setCuesOpen((open) => !open)}
        className="mt-3.5 flex-row items-center justify-between rounded-[10px] border px-3 py-2.5"
        style={{ borderColor: colors.border, backgroundColor: colors.background }}
      >
        <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
          {cuesOpen ? "Hide cues" : "View cues"}
        </Text>
        <View style={{ transform: [{ rotate: cuesOpen ? "90deg" : "0deg" }] }}>
          <IconChevR size={16} stroke={2} color={colors.textTertiary} />
        </View>
      </Pressable>

      {cuesOpen ? (
        <View className="mt-3 gap-2.5 pl-1">
          {block.cues.map((cue, idx) => (
            <Text key={idx} className="text-sm leading-[1.55]" style={{ color: colors.textSecondary }}>
              • {cue}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
