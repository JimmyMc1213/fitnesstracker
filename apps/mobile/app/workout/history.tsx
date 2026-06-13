import { router } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/home/ScreenHeader";
import { ReplaceActiveWorkoutConfirmSheet } from "@/components/workout/ReplaceActiveWorkoutConfirmSheet";
import { SaveHistoryWorkoutSheet } from "@/components/workout/SaveHistoryWorkoutSheet";
import { SaveWorkoutConfirmSheet } from "@/components/workout/SaveWorkoutConfirmSheet";
import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { WorkoutHistorySessionActionSheet } from "@/components/workout/WorkoutHistorySessionActionSheet";
import { WorkoutHistorySessionCard } from "@/components/workout/WorkoutHistorySessionCard";
import { WorkoutSessionPreviewSheet } from "@/components/workout/WorkoutSessionPreviewSheet";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  formatWorkoutHistoryDate,
  getWorkoutHistorySorted,
  groupSessionsByMonth,
  monthGroupLabel,
  removeWorkoutFromHistory,
  workoutsCompletedByDayFromHistory,
} from "@/lib/workout/workoutHistory";
import {
  appendTemplateFromHistory,
  hasActiveWorkoutSession,
  replaceTemplateFromHistory,
  startWorkoutFromHistory,
} from "@/lib/workout/workoutHistoryActions";
import type { CompletedWorkoutSession } from "@newyouai/types";

export default function WorkoutHistoryScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { state, hydrated, setFitnessState } = useFitnessState();
  const stateRef = useRef(state);
  stateRef.current = state;

  const [previewSession, setPreviewSession] = useState<CompletedWorkoutSession | null>(null);
  const [actionSession, setActionSession] = useState<CompletedWorkoutSession | null>(null);
  const [pendingDeleteSession, setPendingDeleteSession] = useState<CompletedWorkoutSession | null>(null);
  const [pendingStartSession, setPendingStartSession] = useState<CompletedWorkoutSession | null>(null);
  const [saveSession, setSaveSession] = useState<CompletedWorkoutSession | null>(null);
  const [pendingReplaceTemplateId, setPendingReplaceTemplateId] = useState<string | null>(null);

  if (!hydrated || !state) {
    return (
      <View
        testID="workout-history-screen"
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.textSecondary }}>Loading…</Text>
      </View>
    );
  }

  const sessions = getWorkoutHistorySorted(state.workoutHistory);
  const grouped = groupSessionsByMonth(sessions);
  const wUnit = state.unitPreferences.weightUnit;

  function requestDeleteSession(session: CompletedWorkoutSession) {
    setPendingDeleteSession(session);
  }

  function confirmDeleteSession() {
    if (!pendingDeleteSession) return;
    const session = pendingDeleteSession;
    setFitnessState((s) => {
      const workoutHistory = removeWorkoutFromHistory(s.workoutHistory, session.id);
      return {
        ...s,
        workoutHistory,
        workoutsCompletedByDay: workoutsCompletedByDayFromHistory(workoutHistory),
      };
    });
    if (previewSession?.id === session.id) setPreviewSession(null);
    setPendingDeleteSession(null);
  }

  function executeStart(session: CompletedWorkoutSession) {
    setFitnessState((s) => startWorkoutFromHistory(s, session));
    setPreviewSession(null);
    setActionSession(null);
    setPendingStartSession(null);
    setSaveSession(null);
    setPendingReplaceTemplateId(null);
    router.back();
  }

  function requestStart(session: CompletedWorkoutSession) {
    if (hasActiveWorkoutSession(stateRef.current!)) {
      setPendingStartSession(session);
      return;
    }
    executeStart(session);
  }

  function requestSave(session: CompletedWorkoutSession) {
    if (state!.workoutTemplates.length === 0) {
      setFitnessState((s) => appendTemplateFromHistory(s, session));
      setPreviewSession(null);
      return;
    }
    setSaveSession(session);
  }

  function confirmSaveAsNew() {
    if (!saveSession) return;
    setFitnessState((s) => appendTemplateFromHistory(s, saveSession));
    setSaveSession(null);
    setPreviewSession(null);
  }

  function requestReplaceTemplate(templateId: string) {
    setPendingReplaceTemplateId(templateId);
  }

  function confirmReplaceTemplate() {
    if (!saveSession || !pendingReplaceTemplateId) return;
    const session = saveSession;
    const templateId = pendingReplaceTemplateId;
    setFitnessState((s) => replaceTemplateFromHistory(s, session, templateId));
    setSaveSession(null);
    setPendingReplaceTemplateId(null);
    setPreviewSession(null);
    setActionSession(null);
  }

  const replaceTemplate = pendingReplaceTemplateId
    ? state.workoutTemplates.find((t) => t.id === pendingReplaceTemplateId)
    : null;

  return (
    <>
      <ScrollView
        testID="workout-history-screen"
        className="flex-1 px-screen-x"
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}
        style={{ backgroundColor: colors.background }}
      >
        <ScreenHeader eyebrow="TRAINING" title="Workout history" titleTestID="workout-history-title" />

        <Text className="mb-4 mt-1 text-[13px] font-medium" style={{ color: colors.textTertiary }}>
          {sessions.length > 0
            ? `${sessions.length} saved session${sessions.length === 1 ? "" : "s"}`
            : "Finish a workout with logged sets to see sessions here."}
        </Text>

        {sessions.length === 0 ? (
          <View
            testID="workout-history-empty"
            className="rounded-xl border p-7"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="text-center text-sm leading-[1.5]" style={{ color: colors.textSecondary }}>
              No workouts saved yet.
            </Text>
          </View>
        ) : (
          <View className="gap-5">
            {grouped.map(({ monthKey, sessions: monthSessions }) => (
              <View key={monthKey}>
                <Text
                  className="mb-2.5 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: colors.textTertiary }}
                >
                  {monthGroupLabel(monthKey)}
                </Text>
                <View className="gap-2.5">
                  {monthSessions.map((session) => (
                    <WorkoutHistorySessionCard
                      key={session.id}
                      session={session}
                      workoutHistory={state.workoutHistory}
                      weightUnit={wUnit}
                      onOpen={() => setPreviewSession(session)}
                      onShowActions={() => setActionSession(session)}
                      onDelete={() => requestDeleteSession(session)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {previewSession ? (
        <WorkoutSessionPreviewSheet
          session={previewSession}
          unitPreferences={state.unitPreferences}
          onClose={() => setPreviewSession(null)}
          onDelete={() => requestDeleteSession(previewSession)}
        />
      ) : null}

      {actionSession ? (
        <WorkoutHistorySessionActionSheet
          sessionTitle={actionSession.title}
          onStart={() => requestStart(actionSession)}
          onSave={() => requestSave(actionSession)}
          onDelete={() => requestDeleteSession(actionSession)}
          onClose={() => setActionSession(null)}
        />
      ) : null}

      {pendingDeleteSession ? (
        <WorkoutConfirmSheet
          sheetTestID="workout-history-delete-sheet"
          title="Delete workout?"
          cancelLabel="Keep workout"
          confirmLabel="Delete workout"
          confirmDestructive
          cancelTestID="workout-history-delete-cancel"
          confirmTestID="workout-history-delete-confirm"
          message={
            <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
              Delete{" "}
              <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{pendingDeleteSession.title}</Text> from{" "}
              {formatWorkoutHistoryDate(pendingDeleteSession.dayKey, pendingDeleteSession.endedAtMs)}? This can&apos;t
              be undone.
            </Text>
          }
          onCancel={() => setPendingDeleteSession(null)}
          onConfirm={confirmDeleteSession}
        />
      ) : null}

      {pendingStartSession ? (
        <ReplaceActiveWorkoutConfirmSheet
          workoutTitle={pendingStartSession.title}
          onKeepCurrent={() => setPendingStartSession(null)}
          onStartNew={() => executeStart(pendingStartSession)}
        />
      ) : null}

      {saveSession && !pendingReplaceTemplateId ? (
        <SaveHistoryWorkoutSheet
          sessionTitle={saveSession.title}
          templates={state.workoutTemplates}
          onSaveAsNew={confirmSaveAsNew}
          onReplaceTemplate={requestReplaceTemplate}
          onClose={() => setSaveSession(null)}
        />
      ) : null}

      {saveSession && pendingReplaceTemplateId && replaceTemplate ? (
        <SaveWorkoutConfirmSheet
          title="Replace workout?"
          workoutName={replaceTemplate.name}
          cancelLabel="Go back"
          confirmLabel="Replace workout"
          message={`Replace ${replaceTemplate.name} with exercises from ${saveSession.title}? The current saved exercises will be overwritten.`}
          onCancel={() => setPendingReplaceTemplateId(null)}
          onSave={confirmReplaceTemplate}
        />
      ) : null}
    </>
  );
}
