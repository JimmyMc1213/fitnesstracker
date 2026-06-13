import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WorkoutIdleDashboard } from "@/components/workout/WorkoutIdleDashboard";
import { WorkoutLiftingSlot } from "@/components/workout/WorkoutLiftingSlot";
import { UpdateTemplateOrderConfirmSheet } from "@/components/workout/UpdateTemplateOrderConfirmSheet";
import { WorkoutSummarySheet } from "@/components/workout/WorkoutSummarySheet";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  applyTemplateOrderUpdate,
  dismissTemplateOrderUpdatePrompt,
  dismissWorkoutSummary,
} from "@newyouai/core";

export default function WorkoutScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { state, hydrated, setFitnessState } = useFitnessState();

  const sessionPhase = state?.workout.sessionPhase ?? "idle";
  const showSummary = state?.workoutSummary != null;

  return (
    <View
      testID="tab-workout"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      {!hydrated || !state ? (
        <View className="flex-1 items-center justify-center px-screen-x py-24">
          <Text style={{ color: colors.textSecondary }}>Loading…</Text>
        </View>
      ) : sessionPhase === "idle" ? (
        <ScrollView
          className="px-screen-x"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <WorkoutIdleDashboard />
        </ScrollView>
      ) : (
        <View className="flex-1 px-screen-x">
          <WorkoutLiftingSlot />
        </View>
      )}

      {state?.workoutSummary ? (
        <WorkoutSummarySheet
          open={showSummary}
          summary={state.workoutSummary}
          unitPreferences={state.unitPreferences}
          onDone={() => setFitnessState((prev) => dismissWorkoutSummary(prev))}
        />
      ) : null}

      {state?.pendingTemplateOrderUpdatePrompt ? (
        <UpdateTemplateOrderConfirmSheet
          templateName={state.pendingTemplateOrderUpdatePrompt.templateName}
          onUpdate={() => setFitnessState((prev) => applyTemplateOrderUpdate(prev))}
          onDismiss={() => setFitnessState((prev) => dismissTemplateOrderUpdatePrompt(prev))}
        />
      ) : null}
    </View>
  );
}
