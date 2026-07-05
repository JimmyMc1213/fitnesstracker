import type { CoachTask, HomeCoachPlan } from "@newyouai/core";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { coachTaskCtaLabel, coachTaskHasAction } from "@/lib/coachTaskActions";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  plan: HomeCoachPlan;
  onTaskAction: (task: CoachTask) => void;
};

export function TodaysCoachPlanCard({ plan, onTaskAction }: Props) {
  const { colors } = useAppTheme();
  const primaryActionIndex = plan.tasks.findIndex((task) => coachTaskHasAction(task));

  return (
    <View
      testID="coach-plan-card"
      className="mt-[18px] rounded-xl border p-4"
      style={{
        borderColor: colors.cardBorder,
        backgroundColor: colors.card,
      }}
    >
      <View style={{ marginBottom: plan.subline ? 6 : 12 }}>
        <Text
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "rgba(74,222,128,0.85)" }}
        >
          Today's plan
        </Text>
        {plan.subline ? (
          <Text className="mt-1 text-[11px] font-medium" style={{ color: colors.textTertiary }}>
            {plan.subline}
          </Text>
        ) : null}
      </View>

      <View style={{ gap: 14 }}>
        {plan.tasks.map((task, index) => (
          <CoachTaskRow
            key={`${task.kind}-${index}`}
            task={task}
            isPrimaryAction={index === primaryActionIndex}
            onAction={() => onTaskAction(task)}
          />
        ))}
      </View>

      {plan.insightStrip ? (
        <Text
          className="mt-3.5 border-t pt-3 text-[11px] leading-[1.45] font-medium"
          style={{ borderColor: colors.border, color: colors.textTertiary }}
        >
          {plan.insightStrip}
        </Text>
      ) : null}
    </View>
  );
}

function CoachTaskRow({
  task,
  isPrimaryAction,
  onAction,
}: {
  task: CoachTask;
  isPrimaryAction: boolean;
  onAction: () => void;
}) {
  const { colors } = useAppTheme();
  const ctaLabel = coachTaskCtaLabel(task);
  const showCta = ctaLabel !== null;
  const completed = task.completed;
  const taskTestId = `coach-task-${task.kind}`;

  return (
    <View
      style={{
        opacity: completed ? 0.55 : 1,
        ...(isPrimaryAction && showCta && !completed
          ? {
              padding: 12,
              borderRadius: 12,
              borderWidth: 0.5,
              borderColor: "rgba(74,222,128,0.22)",
              backgroundColor: "rgba(74,222,128,0.06)",
            }
          : undefined),
      }}
    >
      <Text
        className="text-[13px] font-semibold tracking-tight"
        style={{
          color: colors.textPrimary,
          textDecorationLine: completed ? "line-through" : "none",
        }}
      >
        {task.label}
      </Text>
      {task.rationale ? (
        <Text className="mt-1 text-[11px] leading-[1.4] font-medium" style={{ color: colors.textTertiary }}>
          {task.rationale}
        </Text>
      ) : null}

      {showCta && !completed ? (
        isPrimaryAction ? (
          <PrimaryButton
            block
            onPress={onAction}
            testID={taskTestId}
            accessibilityLabel={`${ctaLabel}: ${task.label}`}
            style={{ marginTop: 12, paddingVertical: 14 }}
          >
            {ctaLabel}
          </PrimaryButton>
        ) : (
          <Pressable onPress={onAction} testID={taskTestId} accessibilityLabel={`${ctaLabel}: ${task.label}`}>
            <Text className="mt-2.5 text-xs font-semibold" style={{ color: colors.textSecondary }}>
              {ctaLabel} →
            </Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}
