import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { ScreenHeader } from "@/components/home/ScreenHeader";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { CreateWeeklyRoutineSheet } from "@/components/workout/CreateWeeklyRoutineSheet";
import { RenameRoutineSheet } from "@/components/workout/RenameRoutineSheet";
import { ReplaceActiveWorkoutConfirmSheet } from "@/components/workout/ReplaceActiveWorkoutConfirmSheet";
import { RoutinePreviewSheet } from "@/components/workout/RoutinePreviewSheet";
import { SaveWorkoutConfirmSheet } from "@/components/workout/SaveWorkoutConfirmSheet";
import {
  NEW_ROUTINE_EDITOR_ID,
  WorkoutRoutineEditor,
} from "@/components/workout/WorkoutRoutineEditor";
import { WorkoutRoutineActionSheet } from "@/components/workout/WorkoutRoutineActionSheet";
import { WorkoutStarterTemplatesSheet } from "@/components/workout/WorkoutStarterTemplatesSheet";
import {
  WeeklyRoutineBuilderFlow,
  type WeeklyRoutineBuilderMode,
} from "@/components/workout/WeeklyRoutineBuilderFlow";
import { useFitnessState } from "@/context/FitnessContext";
import { useWorkoutShell } from "@/context/WorkoutShellContext";
import { startEmptyWorkoutState, startTemplateWorkoutState } from "@/lib/workout/startWorkoutSession";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  buildPreWorkoutCoachBrief,
  buildRoutinePreviewCoachBrief,
  type PreWorkoutCoachBrief,
} from "@/lib/preWorkoutCoachBrief";
import {
  applyWeeklyRoutineToState,
  profilePatchFromRoutineInputs,
} from "@/lib/workout/buildWeeklyRoutine";
import { duplicateWorkoutTemplate } from "@/lib/workout/duplicateWorkoutTemplate";
import { COACH_BLUE_LABEL, coachCardColors } from "@/lib/workoutUiTokens";
import type { WorkoutRoutineTemplate } from "@newyouai/types";

function WorkoutHeaderActions({
  onBrowseTemplates,
  onShowHistory,
}: {
  onBrowseTemplates: () => void;
  onShowHistory: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={onBrowseTemplates}
        testID="workout-templates-button"
        className="h-10 items-center justify-center rounded-[10px] border px-3.5"
        style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
      >
        <Text className="text-sm font-semibold tracking-tight" style={{ color: COACH_BLUE_LABEL }}>
          Templates
        </Text>
      </Pressable>
      <Pressable
        onPress={onShowHistory}
        testID="workout-history-button"
        accessibilityLabel="Workout history"
        className="h-12 w-12 items-center justify-center rounded-[10px] border"
        style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 22 }}>⏱</Text>
      </Pressable>
    </View>
  );
}

function SecondaryButton({
  children,
  onPress,
  block,
  testID,
}: {
  children: string;
  onPress?: () => void;
  block?: boolean;
  testID?: string;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      className="min-h-[44px] items-center justify-center rounded-xl border px-4 py-3"
      style={{
        width: block ? "100%" : undefined,
        borderColor: colors.border,
        backgroundColor: colors.backgroundSecondary,
      }}
    >
      <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
        {children}
      </Text>
    </Pressable>
  );
}

export function WorkoutIdleDashboard() {
  const { colors, theme } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();
  const { setRoutineEditorOpen, setWorkoutSessionExpanded } = useWorkoutShell();
  const coachCard = coachCardColors(theme);

  const [previewRoutineId, setPreviewRoutineId] = useState<string | null>(null);
  const [menuRoutineId, setMenuRoutineId] = useState<string | null>(null);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [showStarterTemplatesSheet, setShowStarterTemplatesSheet] = useState(false);
  const [showCreateWeeklyRoutineSheet, setShowCreateWeeklyRoutineSheet] = useState(false);
  const [weeklyRoutineBuilderMode, setWeeklyRoutineBuilderMode] = useState<WeeklyRoutineBuilderMode | null>(null);
  const [renameRoutineId, setRenameRoutineId] = useState<string | null>(null);
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);
  const [pendingStart, setPendingStart] = useState<{ kind: "empty" } | { kind: "template"; templateId: string; title: string } | null>(null);

  const workoutOverlayOpen =
    editingRoutineId !== null ||
    weeklyRoutineBuilderMode !== null ||
    showCreateWeeklyRoutineSheet ||
    showStarterTemplatesSheet;

  useEffect(() => {
    setRoutineEditorOpen(workoutOverlayOpen);
    return () => setRoutineEditorOpen(false);
  }, [workoutOverlayOpen, setRoutineEditorOpen]);

  const preWorkoutCoach = useMemo(
    () => (state ? buildPreWorkoutCoachBrief(state) : null),
    [state],
  );

  if (!state) return null;

  const idleCoachSubtitle = preWorkoutCoach?.brief.headline;
  const todayTemplateId = preWorkoutCoach?.todayTemplateId ?? null;

  const previewTpl = previewRoutineId ? state.workoutTemplates.find((t) => t.id === previewRoutineId) : null;
  const menuTpl = menuRoutineId ? state.workoutTemplates.find((t) => t.id === menuRoutineId) : null;

  const previewCoachBrief: PreWorkoutCoachBrief | undefined = previewTpl
    ? buildRoutinePreviewCoachBrief(previewTpl, {
        isTodayWorkout: previewTpl.id === todayTemplateId,
        todayHeadline: preWorkoutCoach?.brief.headline,
      })
    : undefined;

  const editTemplate =
    editingRoutineId === NEW_ROUTINE_EDITOR_ID
      ? null
      : state.workoutTemplates.find((t) => t.id === editingRoutineId) ?? null;
  const showRoutineEditor =
    editingRoutineId !== null &&
    (editingRoutineId === NEW_ROUTINE_EDITOR_ID || editTemplate != null);

  const sessionActive = state.workout.sessionPhase !== "idle";

  function openRoutineEditor(templateId: string) {
    if (templateId === NEW_ROUTINE_EDITOR_ID) {
      setPreviewRoutineId(null);
    } else {
      setPreviewRoutineId((prev) => (prev === templateId ? prev : null));
    }
    setMenuRoutineId(null);
    setEditingRoutineId(templateId);
  }

  function saveCustomExercise(name: string, label: string) {
    const n = name.trim();
    if (!n) return;
    const lb = label.trim();
    setFitnessState((prev) => ({
      ...prev,
      customExercises: [
        ...prev.customExercises,
        { id: `c${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: n, label: lb },
      ],
    }));
  }

  function addStarterTemplateDays(templates: WorkoutRoutineTemplate[]) {
    if (templates.length === 0) return;
    setFitnessState((prev) => ({
      ...prev,
      workoutTemplates: [...prev.workoutTemplates, ...templates],
    }));
  }

  function useStarterTemplateProgram(templates: WorkoutRoutineTemplate[]) {
    if (templates.length === 0) return;
    const trainingWeekdays = templates.map((t) => t.dayLabel.trim()).filter(Boolean);
    const patch = profilePatchFromRoutineInputs(trainingWeekdays);
    setFitnessState((prev) => applyWeeklyRoutineToState(prev, templates, patch));
  }

  function requestStartEmptyWorkout() {
    if (sessionActive) {
      setPendingStart({ kind: "empty" });
      return;
    }
    setFitnessState((prev) => startEmptyWorkoutState(prev));
  }

  function requestStartTemplateWorkout(templateId: string, title: string) {
    if (sessionActive) {
      setPendingStart({ kind: "template", templateId, title });
      return;
    }
    setFitnessState((prev) => startTemplateWorkoutState(prev, templateId));
  }

  function confirmReplaceActiveWorkout() {
    if (!pendingStart) return;
    if (pendingStart.kind === "empty") {
      setFitnessState((prev) => startEmptyWorkoutState(prev));
    } else {
      setFitnessState((prev) => startTemplateWorkoutState(prev, pendingStart.templateId));
    }
    setPendingStart(null);
    setPreviewRoutineId(null);
    setWorkoutSessionExpanded(true);
  }

  function duplicateRoutine(templateId: string) {
    setMenuRoutineId(null);
    setFitnessState((prev) => {
      const tpl = prev.workoutTemplates.find((t) => t.id === templateId);
      if (!tpl) return prev;
      return { ...prev, workoutTemplates: [...prev.workoutTemplates, duplicateWorkoutTemplate(tpl)] };
    });
  }

  function renameRoutine(templateId: string, name: string) {
    setFitnessState((prev) => ({
      ...prev,
      workoutTemplates: prev.workoutTemplates.map((t) => (t.id === templateId ? { ...t, name: name.trim() } : t)),
    }));
  }

  function deleteRoutine(templateId: string) {
    setFitnessState((prev) => ({
      ...prev,
      workoutTemplates: prev.workoutTemplates.filter((t) => t.id !== templateId),
    }));
    setPreviewRoutineId((prev) => (prev === templateId ? null : prev));
    setEditingRoutineId((prev) => (prev === templateId ? null : prev));
    setDeleteRoutineId(null);
  }

  const renameTpl = renameRoutineId ? state.workoutTemplates.find((t) => t.id === renameRoutineId) : null;
  const deleteTpl = deleteRoutineId ? state.workoutTemplates.find((t) => t.id === deleteRoutineId) : null;

  return (
    <>
      <View testID="workout-idle" className="pb-6">
        <ScreenHeader
          eyebrow="TRAINING"
          title="Start Workout"
          titleTestID="workout-idle-title"
          right={
            <WorkoutHeaderActions
              onBrowseTemplates={() => setShowStarterTemplatesSheet(true)}
              onShowHistory={() => router.push("/workout/history")}
            />
          }
        />

        {idleCoachSubtitle ? (
          <Text className="mt-1 text-sm font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
            {idleCoachSubtitle}
          </Text>
        ) : null}

        <PrimaryButton block onPress={requestStartEmptyWorkout} style={{ marginTop: 20 }}>
          Start an empty workout
        </PrimaryButton>

        <View className="mb-3 mt-7 flex-row items-start justify-between">
          <View className="min-w-0 flex-1">
            <Text className="text-xl font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
              Workouts
            </Text>
            {state.workoutTemplates.length > 0 ? (
              <Pressable
                onPress={() => openRoutineEditor(NEW_ROUTINE_EDITOR_ID)}
                className="mt-1.5 self-start flex-row items-center gap-1"
              >
                <Text className="text-[13px] font-semibold" style={{ color: colors.textTertiary }}>
                  + Add day
                </Text>
              </Pressable>
            ) : null}
          </View>
          {state.workoutTemplates.length > 0 ? (
            <Pressable
              onPress={() => setShowCreateWeeklyRoutineSheet(true)}
              className="shrink-0 py-1.5 pl-2.5"
            >
              <Text className="text-[13px] font-semibold" style={{ color: COACH_BLUE_LABEL }}>
                + New weekly routine
              </Text>
            </Pressable>
          ) : null}
        </View>

        {state.workoutTemplates.length === 0 ? (
          <View
            className="rounded-xl border p-6"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text
              className="mb-4 text-center text-sm font-medium leading-[1.5]"
              style={{ color: colors.textSecondary }}
            >
              No workouts yet. Create a weekly routine to get started.
            </Text>
            <PrimaryButton block onPress={() => setShowCreateWeeklyRoutineSheet(true)}>
              New weekly routine
            </PrimaryButton>
            <View className="mt-3">
              <SecondaryButton block onPress={() => openRoutineEditor(NEW_ROUTINE_EDITOR_ID)}>
                Add a single workout day
              </SecondaryButton>
            </View>
          </View>
        ) : (
          <View className="gap-3">
            {state.workoutTemplates.map((tpl) => {
              const preview = tpl.exercises.slice(0, 4).map((e) => e.name);
              const more = tpl.exercises.length - preview.length;
              const isTodayWorkout = tpl.id === todayTemplateId;

              return (
                <View
                  key={tpl.id}
                  testID={`workout-routine-${tpl.id}`}
                  className="flex-row overflow-hidden rounded-[14px] border"
                  style={{
                    borderColor: isTodayWorkout ? coachCard.border : colors.border,
                    backgroundColor: isTodayWorkout ? coachCard.background : colors.card,
                    shadowColor: isTodayWorkout ? COACH_BLUE_LABEL : undefined,
                    shadowOpacity: isTodayWorkout ? 0.25 : 0,
                    shadowRadius: isTodayWorkout ? 12 : 0,
                    shadowOffset: isTodayWorkout ? { width: 0, height: 0 } : undefined,
                  }}
                >
                  <Pressable
                    onPress={() => setPreviewRoutineId(tpl.id)}
                    className="min-w-0 flex-1 p-4"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <View className="mb-1.5 flex-row items-center gap-2">
                      <Text
                        className="text-[11px] font-semibold uppercase tracking-widest"
                        style={{ color: colors.textTertiary }}
                      >
                        {tpl.dayLabel.trim() || "Workout"}
                      </Text>
                      {isTodayWorkout ? (
                        <Text
                          className="text-[11px] font-semibold uppercase tracking-widest"
                          style={{ color: COACH_BLUE_LABEL }}
                        >
                          Today
                        </Text>
                      ) : null}
                    </View>
                    <Text className="mb-1.5 text-base font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                      {tpl.name}
                    </Text>
                    {tpl.focus.trim() ? (
                      <Text className="mb-2.5 text-xs leading-[1.4]" style={{ color: colors.textSecondary }}>
                        {tpl.focus}
                      </Text>
                    ) : null}
                    {preview.map((name, i) => (
                      <Text
                        key={`${tpl.id}-p${i}`}
                        className="text-[13px] font-medium leading-[1.5]"
                        style={{ color: colors.textSecondary }}
                      >
                        • {name}
                      </Text>
                    ))}
                    {more > 0 ? (
                      <Text className="mt-2 text-xs font-medium" style={{ color: colors.textTertiary }}>
                        +{more} more
                      </Text>
                    ) : null}
                  </Pressable>
                  <Pressable
                    onPress={() => setMenuRoutineId(tpl.id)}
                    accessibilityLabel={`Options for ${tpl.name}`}
                    className="items-center justify-center px-3.5 py-4"
                    style={{
                      borderLeftWidth: 0.5,
                      borderLeftColor: isTodayWorkout ? coachCard.border : colors.border,
                      backgroundColor: isTodayWorkout ? coachCard.background : colors.backgroundSecondary,
                    }}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 20 }}>⋮</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {previewTpl ? (
        <RoutinePreviewSheet
          open
          template={previewTpl}
          coachBrief={previewCoachBrief}
          onClose={() => setPreviewRoutineId(null)}
          onOpenMenu={() => {
            setPreviewRoutineId(null);
            setMenuRoutineId(previewTpl.id);
          }}
          onStart={() => {
            requestStartTemplateWorkout(previewTpl.id, previewTpl.name);
            setPreviewRoutineId(null);
          }}
        />
      ) : null}

      {menuTpl ? (
        <WorkoutRoutineActionSheet
          open
          template={menuTpl}
          onClose={() => setMenuRoutineId(null)}
          onEdit={() => openRoutineEditor(menuTpl.id)}
          onRename={() => setRenameRoutineId(menuTpl.id)}
          onDuplicate={() => duplicateRoutine(menuTpl.id)}
          onDelete={() => setDeleteRoutineId(menuTpl.id)}
        />
      ) : null}

      {showStarterTemplatesSheet ? (
        <WorkoutStarterTemplatesSheet
          open
          onClose={() => setShowStarterTemplatesSheet(false)}
          onAddDays={addStarterTemplateDays}
          onUseProgram={useStarterTemplateProgram}
        />
      ) : null}

      {showCreateWeeklyRoutineSheet ? (
        <CreateWeeklyRoutineSheet
          onClose={() => setShowCreateWeeklyRoutineSheet(false)}
          onGenerate={() => {
            setShowCreateWeeklyRoutineSheet(false);
            setWeeklyRoutineBuilderMode("generate");
          }}
          onManual={() => {
            setShowCreateWeeklyRoutineSheet(false);
            setWeeklyRoutineBuilderMode("manual");
          }}
        />
      ) : null}

      {weeklyRoutineBuilderMode ? (
        <WeeklyRoutineBuilderFlow
          mode={weeklyRoutineBuilderMode}
          state={state}
          onApply={(next) => setFitnessState(next)}
          onSaveCustomExercise={saveCustomExercise}
          onClose={() => setWeeklyRoutineBuilderMode(null)}
        />
      ) : null}

      {showRoutineEditor ? (
        <WorkoutRoutineEditor
          key={editingRoutineId}
          open
          template={editTemplate}
          customExercises={state.customExercises}
          equipmentSetup={state.equipmentSetup ?? "full_gym"}
          onSaveCustomExercise={saveCustomExercise}
          onSave={(saved) => {
            setFitnessState((prev) => {
              const i = prev.workoutTemplates.findIndex((t) => t.id === saved.id);
              const next = [...prev.workoutTemplates];
              if (i >= 0) next[i] = saved;
              else next.push(saved);
              return { ...prev, workoutTemplates: next };
            });
            setEditingRoutineId(null);
          }}
          onDelete={
            editingRoutineId !== NEW_ROUTINE_EDITOR_ID
              ? (id) => {
                  setFitnessState((prev) => ({
                    ...prev,
                    workoutTemplates: prev.workoutTemplates.filter((t) => t.id !== id),
                  }));
                }
              : null
          }
          onClose={() => setEditingRoutineId(null)}
        />
      ) : null}

      {pendingStart ? (
        <ReplaceActiveWorkoutConfirmSheet
          open
          pendingWorkoutTitle={pendingStart.kind === "empty" ? "an empty workout" : pendingStart.title}
          currentWorkoutTitle={state.workout.sessionTitle}
          onResume={() => {
            setPendingStart(null);
            setWorkoutSessionExpanded(true);
          }}
          onDiscardAndStart={confirmReplaceActiveWorkout}
          onCancel={() => setPendingStart(null)}
        />
      ) : null}

      {renameTpl ? (
        <RenameRoutineSheet
          open
          template={renameTpl}
          onSave={(name) => renameRoutine(renameTpl.id, name)}
          onClose={() => setRenameRoutineId(null)}
        />
      ) : null}

      {deleteTpl ? (
        <SaveWorkoutConfirmSheet
          open
          title="Delete workout?"
          workoutName={deleteTpl.name}
          cancelLabel="Keep workout"
          confirmLabel="Delete"
          message={`Delete ${deleteTpl.name}? This can't be undone.`}
          onCancel={() => setDeleteRoutineId(null)}
          onSave={() => deleteRoutine(deleteTpl.id)}
        />
      ) : null}
    </>
  );
}
