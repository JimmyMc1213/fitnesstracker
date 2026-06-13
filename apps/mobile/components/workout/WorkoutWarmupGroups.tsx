import type { WorkoutWarmupDrill, WorkoutWarmupGroup } from "@/lib/workout/workoutWarmup";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Text, View } from "react-native";

type Props = {
  groups: readonly WorkoutWarmupGroup[];
  footerTip?: string;
};

export function WorkoutWarmupGroups({ groups, footerTip }: Props) {
  const { colors } = useAppTheme();

  if (groups.length === 0) return null;

  function renderDrill(groupLabel: string, drill: WorkoutWarmupDrill, index: number) {
    return (
      <View
        key={`${groupLabel}-${drill.name}-${drill.prescription ?? ""}`}
        className={index > 0 ? "mt-2 border-t pt-2" : undefined}
        style={index > 0 ? { borderColor: colors.border } : undefined}
      >
        <Text className="text-[13px] font-semibold leading-[1.35]" style={{ color: colors.textPrimary }}>
          {drill.name}
        </Text>
        {drill.prescription ? (
          <Text className="mt-0.5 text-xs font-semibold tabular-nums" style={{ color: colors.textTertiary }}>
            {drill.prescription}
          </Text>
        ) : null}
        {drill.note ? (
          <Text className="mt-0.5 text-[11px] font-medium leading-[1.35]" style={{ color: colors.textSecondary }}>
            {drill.note}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-2.5">
      {groups.map((group) => (
        <View
          key={group.label}
          className="rounded-[10px] border p-3"
          style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
        >
          <Text
            className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            {group.label}
          </Text>
          {group.drills.map((drill, index) => renderDrill(group.label, drill, index))}
        </View>
      ))}
      {footerTip ? (
        <Text className="text-[11px] font-medium leading-[1.4]" style={{ color: colors.textSecondary }}>
          {footerTip}
        </Text>
      ) : null}
    </View>
  );
}
