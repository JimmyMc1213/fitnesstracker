import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { BottomSheet } from "@/components/motion";
import { AppTextField } from "@/components/ui/AppTextField";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useBottomActionPadding } from "@/lib/screenInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { COACH_BLUE_LABEL } from "@/lib/workoutUiTokens";
import {
  buildRoutineTemplatesFromStarter,
  findWorkoutStarterTemplate,
  isMultiDayStarter,
  workoutStarterTemplatesByCategory,
  type WorkoutStarterTemplate,
} from "@/lib/workout/workoutStarterTemplates";
import type { WorkoutRoutineTemplate } from "@newyouai/types";

type WorkoutStarterTemplatesSheetProps = {
  open: boolean;
  onClose: () => void;
  onAddDays: (templates: WorkoutRoutineTemplate[]) => void;
  onUseProgram: (templates: WorkoutRoutineTemplate[]) => void;
};

function TemplateCard({ template, onPress }: { template: WorkoutStarterTemplate; onPress: () => void }) {
  const { colors } = useAppTheme();
  const dayCount = template.days.length;
  const exercisePreview = template.days[0]?.exercises.slice(0, 3).map((e) => e.name) ?? [];
  const moreExercises = (template.days[0]?.exercises.length ?? 0) - exercisePreview.length;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-[14px] border p-3.5"
      style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
    >
      <View className="flex-row items-start justify-between gap-2.5">
        <Text className="flex-1 text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
          {template.name}
        </Text>
        <Text className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          {dayCount === 1 ? "1 day" : `${dayCount} days`}
        </Text>
      </View>
      <Text className="mt-1.5 text-[13px] leading-[1.45] font-medium" style={{ color: colors.textSecondary }}>
        {template.description}
      </Text>
      {exercisePreview.length > 0 ? (
        <Text className="mt-2.5 text-xs font-medium leading-[1.5]" style={{ color: colors.textTertiary }}>
          {exercisePreview.join(" · ")}
          {moreExercises > 0 ? ` · +${moreExercises} more` : null}
        </Text>
      ) : null}
    </Pressable>
  );
}

function TemplateDetail({
  template,
  onBack,
  onAddDays,
  onUseProgram,
}: {
  template: WorkoutStarterTemplate;
  onBack: () => void;
  onAddDays: (templates: WorkoutRoutineTemplate[]) => void;
  onUseProgram: (templates: WorkoutRoutineTemplate[]) => void;
}) {
  const { colors } = useAppTheme();
  const built = useMemo(() => buildRoutineTemplatesFromStarter(template), [template]);
  const multiDay = isMultiDayStarter(template);

  return (
    <>
      <Pressable onPress={onBack} className="mb-1 py-1">
        <Text className="text-sm font-semibold" style={{ color: COACH_BLUE_LABEL }}>
          ← All templates
        </Text>
      </Pressable>
      <Text className="text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
        {template.name}
      </Text>
      <Text className="mt-1.5 text-sm leading-[1.5] font-medium" style={{ color: colors.textSecondary }}>
        {template.description}
      </Text>
      <View className="my-4 gap-3">
        {built.map((day) => (
          <View
            key={day.id}
            className="rounded-xl border p-3.5"
            style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
          >
            <Text className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
              {day.name}
            </Text>
            {day.focus.trim() ? (
              <Text className="mt-1 text-xs font-medium" style={{ color: colors.textSecondary }}>
                {day.focus}
              </Text>
            ) : null}
            <View className="mt-2.5 gap-1">
              {day.exercises.map((ex) => (
                <Text key={ex.id} className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>
                  • {ex.name}
                  <Text style={{ color: colors.textTertiary }}> {ex.target}</Text>
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
      {multiDay ? (
        <>
          <PrimaryButton block onPress={() => onUseProgram(built)} style={{ marginBottom: 10 }}>
            Use as my program
          </PrimaryButton>
          <Pressable
            onPress={() => onAddDays(built)}
            className="min-h-[44px] items-center justify-center rounded-xl border px-4 py-3"
            style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
              Add all days to my workouts
            </Text>
          </Pressable>
        </>
      ) : (
        <PrimaryButton block onPress={() => onAddDays(built)}>
          Add to my workouts
        </PrimaryButton>
      )}
    </>
  );
}

export function WorkoutStarterTemplatesSheet({
  open,
  onClose,
  onAddDays,
  onUseProgram,
}: WorkoutStarterTemplatesSheetProps) {
  const { colors } = useAppTheme();
  const bottomActionPadding = useBottomActionPadding();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? findWorkoutStarterTemplate(selectedId) : null;

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = workoutStarterTemplatesByCategory();
    if (!q) return base;
    return base
      .map((group) => ({
        ...group,
        templates: group.templates.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.days.some((d) => d.focus.toLowerCase().includes(q) || d.exercises.some((e) => e.name.toLowerCase().includes(q))),
        ),
      }))
      .filter((group) => group.templates.length > 0);
  }, [query]);

  function reset() {
    setQuery("");
    setSelectedId(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleAddDays(templates: WorkoutRoutineTemplate[]) {
    onAddDays(templates);
    handleClose();
  }

  function handleUseProgram(templates: WorkoutRoutineTemplate[]) {
    onUseProgram(templates);
    handleClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      panelStyle={{ paddingHorizontal: 0, paddingBottom: bottomActionPadding, maxHeight: "86%" }}
    >
      <View testID="workout-starter-templates-sheet" className="max-h-[86%] rounded-t-2xl px-4 pt-5">
          <Text className="text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            Workout templates
          </Text>
          <Text className="mt-1.5 text-sm leading-[1.5] font-medium" style={{ color: colors.textSecondary }}>
            Pre-built routines you can add to your workouts or use as a full program.
          </Text>

          {!selected ? (
            <AppTextField
              value={query}
              onChangeText={setQuery}
              placeholder="Search templates…"
              shellStyle={{ marginTop: 14 }}
            />
          ) : null}

          <ScrollView className="mt-3.5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {selected ? (
              <TemplateDetail
                template={selected}
                onBack={() => setSelectedId(null)}
                onAddDays={handleAddDays}
                onUseProgram={handleUseProgram}
              />
            ) : groups.length === 0 ? (
              <Text className="py-6 text-center text-sm font-medium" style={{ color: colors.textSecondary }}>
                No templates match your search.
              </Text>
            ) : (
              groups.map((group) => (
                <View key={group.category} className="mb-5">
                  <Text
                    className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: colors.textTertiary }}
                  >
                    {group.label}
                  </Text>
                  <View className="gap-2">
                    {group.templates.map((template) => (
                      <TemplateCard key={template.id} template={template} onPress={() => setSelectedId(template.id)} />
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
      </View>
    </BottomSheet>
  );
}
