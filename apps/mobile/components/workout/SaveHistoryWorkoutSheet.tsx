import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import type { WorkoutRoutineTemplate } from "@newyouai/types";

type Props = {
  open?: boolean;
  sessionTitle: string;
  templates: WorkoutRoutineTemplate[];
  onSaveAsNew: () => void;
  onReplaceTemplate: (templateId: string) => void;
  onClose: () => void;
};

function ActionRow({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable onPress={onPress} className="rounded-xl px-3.5 py-3.5">
      <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-0.5 text-xs font-medium leading-[1.35]" style={{ color: colors.textTertiary }}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function SaveHistoryWorkoutSheet({
  open = true,
  sessionTitle,
  templates,
  onSaveAsNew,
  onReplaceTemplate,
  onClose,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onClose}>
        <Pressable
          testID="save-history-workout-sheet"
          className="max-h-[78%] w-full max-w-sm rounded-2xl px-3 py-4"
          style={{ backgroundColor: colors.card }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            className="mx-2 mb-2 mt-1 text-[13px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            Save workout
          </Text>
          <Text className="mx-2 mb-2.5 text-[13px] leading-[1.45]" style={{ color: colors.textSecondary }}>
            Save <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{sessionTitle}</Text> as a reusable
            workout.
          </Text>

          <ActionRow title="Save as new workout" subtitle="Add to your workouts list" onPress={onSaveAsNew} />

          {templates.length > 0 ? (
            <>
              <Text
                className="mx-2 mb-1 mt-2 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: colors.textTertiary }}
              >
                Replace existing workout
              </Text>
              <ScrollView className="max-h-64">
                {templates.map((tpl) => (
                  <ActionRow
                    key={tpl.id}
                    title={tpl.name}
                    subtitle={
                      tpl.dayLabel.trim()
                        ? `${tpl.dayLabel} · ${tpl.exercises.length} exercises`
                        : `${tpl.exercises.length} exercises`
                    }
                    onPress={() => onReplaceTemplate(tpl.id)}
                  />
                ))}
              </ScrollView>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
