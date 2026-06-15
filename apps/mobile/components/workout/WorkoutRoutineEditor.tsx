import { weekdayFullName } from "@newyouai/core";
import type { CustomExerciseTemplate, EquipmentSetup, WorkoutExercise, WorkoutRoutineTemplate } from "@newyouai/types";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBottomActionPadding } from "@/lib/screenInsets";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { DeleteExerciseConfirmSheet } from "@/components/workout/DeleteExerciseConfirmSheet";
import { ExerciseDragHandle, SortableExerciseList } from "@/components/workout/SortableExerciseList";
import { RoutineExerciseSearchSheet } from "@/components/workout/RoutineExerciseSearchSheet";
import { SaveWorkoutConfirmSheet } from "@/components/workout/SaveWorkoutConfirmSheet";
import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  defaultExerciseTarget,
  formatPrescriptionRepRange,
  usesSecFieldForExercise,
} from "@/lib/workout/exercisePrescriptionDefaults";
import { resolveRoutineFocusOnSave } from "@/lib/workout/routineTemplateFocus";
import { newTemplateExerciseLine, resizeWorkoutSets } from "@/lib/workout/templateExerciseUtils";
import {
  formatWorkoutTarget,
  parseRepRangeBounds,
  parseWorkoutTarget,
  syncTargetRepRange,
} from "@/lib/workout/workoutTarget";
import { COACH_BLUE_LABEL } from "@/lib/workoutUiTokens";

/** Pass as `editingRoutineId` to open the editor for a brand-new routine. */
export const NEW_ROUTINE_EDITOR_ID = "__new__";

const DAY_PRESETS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type SearchSheetMode = { kind: "add" } | { kind: "swap"; exerciseId: string };

type WorkoutRoutineEditorProps = {
  open?: boolean;
  template: WorkoutRoutineTemplate | null;
  customExercises: CustomExerciseTemplate[];
  equipmentSetup: EquipmentSetup;
  onSave: (t: WorkoutRoutineTemplate) => void;
  onSaveCustomExercise: (name: string, label: string) => void;
  onDelete: ((id: string) => void) | null;
  onClose: () => void;
  embedded?: boolean;
  saveLabel?: string;
  title?: string;
  progressLabel?: string;
};

function defaultWorkoutName(day: string): string {
  const tagged = day.trim();
  if (!tagged) return "Workout";
  return `${weekdayFullName(tagged)} Workout`;
}

function resolvedWorkoutName(rawName: string, day: string): string {
  const trimmed = rawName.trim();
  if (trimmed) return trimmed;
  return defaultWorkoutName(day);
}

function buildDraftTemplate(
  template: WorkoutRoutineTemplate | null,
  name: string,
  dayLabel: string,
  focus: string,
  exercises: WorkoutExercise[],
): WorkoutRoutineTemplate {
  const id = template?.id ?? `tpl_${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const trimmedDay = dayLabel.trim();
  return {
    id,
    name: resolvedWorkoutName(name, trimmedDay),
    dayLabel: trimmedDay,
    focus: focus.trim(),
    exercises: exercises.map((e) => ({
      ...e,
      sets: e.sets.map((s) => ({ ...s })),
    })),
    ...(template?.warmupItems?.length ? { warmupItems: template.warmupItems.map((w) => ({ ...w })) } : {}),
    ...(template?.warmupTip ? { warmupTip: template.warmupTip } : {}),
    ...(template?.sessionTip ? { sessionTip: template.sessionTip } : {}),
  };
}

function routineEditorSnapshot(t: WorkoutRoutineTemplate): string {
  return JSON.stringify({
    name: t.name,
    dayLabel: t.dayLabel,
    focus: t.focus,
    exercises: t.exercises.map((e) => ({
      id: e.id,
      name: e.name,
      label: e.label ?? "",
      target: e.target,
      setCount: e.sets.length,
    })),
  });
}

function isRoutineEditorDirty(
  template: WorkoutRoutineTemplate | null,
  name: string,
  dayLabel: string,
  focus: string,
  exercises: WorkoutExercise[],
): boolean {
  if (!template) return false;
  const draft = buildDraftTemplate(template, name, dayLabel, focus, exercises);
  return routineEditorSnapshot(draft) !== routineEditorSnapshot(template);
}

function StepperButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="h-8 w-8 items-center justify-center"
      style={{ opacity: disabled ? 0.35 : 1 }}
    >
      <Text className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SetCountStepper({
  count,
  onChange,
  disabled,
}: {
  count: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  const n = Math.min(Math.max(count, 1), 12);

  return (
    <View
      className="min-h-[42px] flex-row items-center justify-between rounded-[10px] border px-1.5 py-1"
      style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
    >
      <StepperButton label="−" disabled={disabled || n <= 1} onPress={() => onChange(n - 1)} />
      <Text className="text-[15px] font-semibold tabular-nums" style={{ color: colors.textPrimary }}>
        {n}
      </Text>
      <StepperButton label="+" disabled={disabled || n >= 12} onPress={() => onChange(n + 1)} />
    </View>
  );
}

function RepBoundStepper({
  boundLabel,
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  boundLabel: "Min" | "Max" | "Hold";
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  const n = Math.min(Math.max(value, min), max);

  return (
    <View
      className="min-h-[38px] flex-row items-center justify-between rounded-[10px] border px-1.5 py-1"
      style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
    >
      <Text className="w-7 text-[11px] font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
        {boundLabel}
      </Text>
      <StepperButton label="−" disabled={disabled || n <= min} onPress={() => onChange(n - 1)} />
      <Text className="text-[15px] font-semibold tabular-nums" style={{ color: colors.textPrimary }}>
        {n}
      </Text>
      <StepperButton label="+" disabled={disabled || n >= max} onPress={() => onChange(n + 1)} />
    </View>
  );
}

function RepRangeStepper({
  low,
  high,
  onChange,
  disabled,
}: {
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  disabled?: boolean;
}) {
  const lo = Math.min(Math.max(low, 1), 99);
  const hi = Math.min(Math.max(high, lo), 99);

  return (
    <View className="gap-1.5">
      <RepBoundStepper
        boundLabel="Min"
        value={lo}
        min={1}
        max={hi}
        disabled={disabled}
        onChange={(nextLow) => onChange(nextLow, Math.max(hi, nextLow))}
      />
      <RepBoundStepper
        boundLabel="Max"
        value={hi}
        min={lo}
        max={99}
        disabled={disabled}
        onChange={(nextHigh) => onChange(lo, nextHigh)}
      />
    </View>
  );
}

export function WorkoutRoutineEditor({
  open = true,
  template,
  customExercises,
  equipmentSetup,
  onSave,
  onSaveCustomExercise,
  onDelete,
  onClose,
  embedded = false,
  saveLabel = "Save workout",
  title,
  progressLabel,
}: WorkoutRoutineEditorProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomActionPadding = useBottomActionPadding();

  const [name, setName] = useState("");
  const [dayLabel, setDayLabel] = useState("");
  const [focus, setFocus] = useState("");
  const [focusDirty, setFocusDirty] = useState(false);
  const [focusExpanded, setFocusExpanded] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [searchSheet, setSearchSheet] = useState<SearchSheetMode | null>(null);
  const [pendingExerciseDelete, setPendingExerciseDelete] = useState<{
    id: string;
    name: string;
    label?: string;
  } | null>(null);
  const [pendingRoutineDelete, setPendingRoutineDelete] = useState(false);
  const [pendingSaveConfirm, setPendingSaveConfirm] = useState(false);

  const templateId = template?.id ?? null;

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDayLabel(template.dayLabel);
      setFocus(template.focus);
      setFocusDirty(false);
      setFocusExpanded(false);
      setExercises(template.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) })));
    } else {
      setName("");
      setDayLabel("");
      setFocus("");
      setFocusDirty(false);
      setFocusExpanded(false);
      setExercises([]);
    }
    setSearchSheet(null);
  }, [templateId]);

  function patchExercise(
    id: string,
    patch: Partial<WorkoutExercise> & { setCount?: number; repLow?: number; repHigh?: number; target?: string },
  ) {
    setExercises((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row;
        let sets = row.sets;
        let target = row.target;

        if (typeof patch.setCount === "number") {
          sets = resizeWorkoutSets(row.sets, patch.setCount);
          target = formatWorkoutTarget(sets.length, parseWorkoutTarget(row.target).repRange);
        }

        if (typeof patch.repLow === "number" || typeof patch.repHigh === "number") {
          const { low, high } = parseRepRangeBounds(parseWorkoutTarget(row.target).repRange);
          const nextLow = typeof patch.repLow === "number" ? patch.repLow : low;
          const nextHigh = typeof patch.repHigh === "number" ? patch.repHigh : high;
          const repRange = formatPrescriptionRepRange(row, nextLow, nextHigh);
          target = syncTargetRepRange(row.target, repRange, sets.length);
        }

        if (typeof patch.target === "string") {
          target = patch.target;
        }

        const next: WorkoutExercise = { ...row, sets, target };
        if (patch.name !== undefined) next.name = patch.name;
        if ("label" in patch) {
          const trimmed = typeof patch.label === "string" ? patch.label.trim() : "";
          if (trimmed) next.label = trimmed;
          else delete next.label;
        }
        return next;
      }),
    );
  }

  function removeExercise(id: string) {
    setExercises((rows) => rows.filter((r) => r.id !== id));
  }

  function handleExerciseSelect(exName: string, exLabel?: string) {
    if (searchSheet?.kind === "swap") {
      const row = exercises.find((e) => e.id === searchSheet.exerciseId);
      const setCount = row?.sets.length ?? 3;
      const fallback = row ? parseWorkoutTarget(row.target).repRange : "8-12";
      patchExercise(searchSheet.exerciseId, {
        name: exName,
        ...(exLabel ? { label: exLabel } : { label: "" }),
        target: defaultExerciseTarget(exName, exLabel, setCount, fallback),
      });
    } else {
      setExercises((rows) => [...rows, newTemplateExerciseLine(exName, { label: exLabel, setCount: 3 })]);
    }
    setSearchSheet(null);
  }

  function handleSaveCustomAndAdd(name: string, label: string) {
    onSaveCustomExercise(name, label);
    handleExerciseSelect(name, label.trim() || undefined);
  }

  function handleSave() {
    const resolvedFocus = resolveRoutineFocusOnSave(focus, focusDirty, exercises);
    onSave(buildDraftTemplate(template, name, dayLabel, resolvedFocus, exercises));
  }

  function handleSaveClick() {
    if (isRoutineEditorDirty(template, name, dayLabel, focus, exercises)) {
      setPendingSaveConfirm(true);
      return;
    }
    handleSave();
  }

  function confirmDeleteRoutine() {
    if (!template?.id || !onDelete) return;
    onDelete(template.id);
    setPendingRoutineDelete(false);
    onClose();
  }

  const headerTitle = title ?? (template ? "Edit workout" : "New workout");
  const namePlaceholder = dayLabel.trim() ? defaultWorkoutName(dayLabel) : headerTitle;

  const body = (
    <View
      testID="workout-routine-editor"
      className="flex-1"
      style={{ backgroundColor: colors.background, paddingTop: embedded ? 0 : insets.top }}
    >
      <View className="px-screen-x pb-3 pt-2">
        <Pressable onPress={onClose} className="self-start py-2">
          <Text className="text-[15px] font-semibold" style={{ color: COACH_BLUE_LABEL }}>
            ← Back
          </Text>
        </Pressable>

        <Text className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          {progressLabel ? `WORKOUT ${progressLabel}` : "WORKOUTS"}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={namePlaceholder}
          placeholderTextColor={colors.textTertiary}
          className="mt-1 text-[26px] font-bold tracking-tight"
          style={{ color: colors.textPrimary }}
        />

        <Text className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          Day tag
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {DAY_PRESETS.map((d) => {
            const selected = dayLabel === d;
            return (
              <Pressable
                key={d}
                onPress={() => setDayLabel(d)}
                className="rounded-lg px-3 py-1.5"
                style={{
                  backgroundColor: selected ? colors.accent : "transparent",
                  borderWidth: selected ? 0 : 0.5,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: selected ? "#fff" : colors.textSecondary }}
                >
                  {d}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {focusExpanded ? (
          <TextInput
            value={focus}
            onChangeText={(next) => {
              setFocus(next);
              setFocusDirty(true);
            }}
            onBlur={() => setFocusExpanded(false)}
            placeholder="Coach notes, session focus, reminders…"
            placeholderTextColor={colors.textTertiary}
            multiline
            autoFocus
            className="mt-3 min-h-[96px] rounded-[10px] border px-3 py-2.5 text-[13px] leading-[1.5]"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
              color: colors.textPrimary,
              textAlignVertical: "top",
            }}
          />
        ) : (
          <Pressable
            onPress={() => setFocusExpanded(true)}
            className="mt-3 rounded-[10px] border px-3 py-2.5"
            style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
          >
            <Text className="text-[13px] font-medium" style={{ color: focus.trim() ? colors.textSecondary : colors.textTertiary }}>
              {focus.trim()
                ? `Session focus: ${focus.trim().length > 48 ? `${focus.trim().slice(0, 48)}…` : focus.trim()}`
                : "Add session focus (optional)"}
            </Text>
          </Pressable>
        )}

        <View className="mb-2.5 mt-6 flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
            Exercises
          </Text>
          <Text className="text-xs" style={{ color: colors.textTertiary }}>
            {exercises.length} move{exercises.length === 1 ? "" : "s"} · hold grip to reorder
          </Text>
        </View>
      </View>

      <View className="min-h-0 flex-1 px-screen-x">
        <SortableExerciseList
          items={exercises}
          onReorder={setExercises}
          contentContainerStyle={{ paddingBottom: 12 }}
          renderItem={(row, ri, handle, ctx) => {
            const { repRange } = parseWorkoutTarget(row.target);
            const { low, high } = parseRepRangeBounds(repRange);
            const usesSec = usesSecFieldForExercise(row);

            return (
              <View
                className="rounded-[14px] border p-4"
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
              >
                <View className="mb-2.5 flex-row items-start gap-2">
                  <ExerciseDragHandle handle={handle} tapSize={44} />
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-[10px] font-semibold" style={{ color: colors.textTertiary }}>
                        #{ri + 1}
                      </Text>
                      <Text
                        className="flex-1 text-[15px] font-semibold tracking-tight"
                        numberOfLines={1}
                        style={{ color: row.name.trim() ? colors.textPrimary : colors.textTertiary }}
                      >
                        {row.name.trim() || "Choose exercise"}
                      </Text>
                      <Pressable
                        disabled={ctx.isListDragging}
                        onPress={() => setSearchSheet({ kind: "swap", exerciseId: row.id })}
                      >
                        <Text className="text-xs font-semibold" style={{ color: COACH_BLUE_LABEL }}>
                          Swap
                        </Text>
                      </Pressable>
                      <Pressable
                        disabled={ctx.isListDragging}
                        onPress={() =>
                          setPendingExerciseDelete({
                            id: row.id,
                            name: row.name.trim() || "Untitled exercise",
                            label: row.label,
                          })
                        }
                        className="h-9 w-9 items-center justify-center"
                      >
                        <Text style={{ color: "#FF6961", fontSize: 16 }}>🗑</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-2.5">
                  <View className="flex-1">
                    <Text className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
                      Sets
                    </Text>
                    <SetCountStepper
                      count={row.sets.length}
                      disabled={ctx.isListDragging}
                      onChange={(setCount) => patchExercise(row.id, { setCount })}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
                      {usesSec ? "Sec" : "Reps"}
                    </Text>
                    {usesSec ? (
                      <RepBoundStepper
                        boundLabel="Hold"
                        value={low}
                        min={5}
                        max={300}
                        disabled={ctx.isListDragging}
                        onChange={(sec) => patchExercise(row.id, { repLow: sec, repHigh: sec })}
                      />
                    ) : (
                      <RepRangeStepper
                        low={low}
                        high={high}
                        disabled={ctx.isListDragging}
                        onChange={(repLow, repHigh) => patchExercise(row.id, { repLow, repHigh })}
                      />
                    )}
                  </View>
                </View>

                <TextInput
                  value={row.label ?? ""}
                  onChangeText={(label) => patchExercise(row.id, { label })}
                  placeholder="Add note (optional)"
                  placeholderTextColor={colors.textTertiary}
                  className="mt-2 border-b py-2 text-[13px] font-medium"
                  style={{ borderColor: colors.border, color: colors.textSecondary }}
                />
              </View>
            );
          }}
        />
      </View>

      <View
        className="gap-2.5 border-t px-screen-x pt-3"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.background,
          paddingBottom: bottomActionPadding,
        }}
      >
        <Pressable
          onPress={() => setSearchSheet({ kind: "add" })}
          className="min-h-[48px] items-center justify-center rounded-[14px] border"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
            + Add exercise to workout
          </Text>
        </Pressable>
        <PrimaryButton block onPress={handleSaveClick}>
          {saveLabel}
        </PrimaryButton>
        {onDelete && template?.id ? (
          <Pressable onPress={() => setPendingRoutineDelete(true)} className="items-center py-2">
            <Text className="text-[13px] font-medium underline" style={{ color: colors.textTertiary }}>
              Delete workout
            </Text>
          </Pressable>
        ) : null}
      </View>

      {searchSheet ? (
        <RoutineExerciseSearchSheet
          open
          title={searchSheet.kind === "add" ? "Add exercise" : "Swap exercise"}
          equipmentSetup={equipmentSetup}
          customExercises={customExercises}
          onSelect={handleExerciseSelect}
          onSaveCustomAndAdd={handleSaveCustomAndAdd}
          onClose={() => setSearchSheet(null)}
        />
      ) : null}

      {pendingExerciseDelete ? (
        <DeleteExerciseConfirmSheet
          exerciseName={pendingExerciseDelete.name}
          exerciseLabel={pendingExerciseDelete.label}
          onCancel={() => setPendingExerciseDelete(null)}
          onConfirm={() => {
            removeExercise(pendingExerciseDelete.id);
            setPendingExerciseDelete(null);
          }}
        />
      ) : null}

      {pendingSaveConfirm ? (
        <SaveWorkoutConfirmSheet
          workoutName={resolvedWorkoutName(name, dayLabel.trim())}
          onCancel={() => setPendingSaveConfirm(false)}
          onSave={() => {
            setPendingSaveConfirm(false);
            handleSave();
          }}
        />
      ) : null}

      {pendingRoutineDelete ? (
        <WorkoutConfirmSheet
          sheetTestID="delete-routine-sheet"
          title="Delete workout?"
          message={`Delete ${name.trim() || template?.name.trim() || "this workout"}? This can't be undone.`}
          cancelLabel="Keep workout"
          confirmLabel="Delete workout"
          confirmDestructive
          onCancel={() => setPendingRoutineDelete(false)}
          onConfirm={confirmDeleteRoutine}
        />
      ) : null}
    </View>
  );

  if (embedded) {
    return body;
  }

  return (
    <Modal visible={open} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      {body}
    </Modal>
  );
}
