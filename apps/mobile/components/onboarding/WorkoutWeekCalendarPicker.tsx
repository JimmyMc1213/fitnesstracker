import type { OnboardingProfile } from "@newyouai/types";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { onboardingPillColors } from "@/lib/onboardingTheme";
import {
  GENERATED_TRAINING_DAY_LIMITS,
  isValidTrainingWeekdaySelection,
  pickTrainingWeekdaysForMe,
  profileWithTrainingWeekdays,
  TRAINING_WEEKDAY_ORDER,
  TRAINING_WEEKDAY_SHORT,
  trainingWeekdaySelectionHint,
  toggleTrainingWeekday,
  type TrainingWeekdaySelectionLimits,
} from "@/lib/workout/workoutWeekCalendar";

export { isTrainingScheduleValid } from "@/lib/workout/workoutWeekCalendar";

export function WorkoutWeekCalendarPicker({
  profile,
  onChange,
  showPickForMe = true,
  includeSplitInHint = true,
  selectionLimits = GENERATED_TRAINING_DAY_LIMITS,
}: {
  profile: Pick<OnboardingProfile, "workoutDaysPerWeek" | "trainingWeekdays">;
  onChange: (next: Pick<OnboardingProfile, "workoutDaysPerWeek" | "trainingWeekdays">) => void;
  showPickForMe?: boolean;
  includeSplitInHint?: boolean;
  selectionLimits?: TrainingWeekdaySelectionLimits;
}) {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const selected = profile.trainingWeekdays ?? [];
  const valid = isValidTrainingWeekdaySelection(selected, selectionLimits);

  function applyWeekdays(weekdays: string[]) {
    onChange(profileWithTrainingWeekdays(profile, weekdays));
  }

  return (
    <View accessibilityLabel="Which days can you train?">
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Training days of the week"
        style={{ flexDirection: "row", justifyContent: "space-between", gap: 4 }}
      >
        {TRAINING_WEEKDAY_ORDER.map((day) => {
          const on = selected.includes(day);
          const pill = onboardingPillColors(ob, on);
          return (
            <PressableScale
              key={day}
              testID={`onboarding-calendar-day-${day}`}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${day}${on ? ", selected" : ""}`}
              onPress={() => applyWeekdays(toggleTrainingWeekday(selected, day, selectionLimits))}
              activeScale={0.9}
              style={{
                flex: 1,
                aspectRatio: 1,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: pill.borderColor,
                backgroundColor: pill.backgroundColor,
              }}
            >
              <Text className="text-sm font-semibold" style={{ color: pill.color }}>
                {TRAINING_WEEKDAY_SHORT[day]}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <Text
        className="mt-4 text-center text-sm"
        style={{ color: valid ? colors.textSecondary : "#f87171" }}
      >
        {trainingWeekdaySelectionHint(selected, {
          includeSplitLabel: includeSplitInHint,
          limits: selectionLimits,
        })}
      </Text>

      {showPickForMe ? (
        <PressableScale onPress={() => applyWeekdays(pickTrainingWeekdaysForMe(selected))} style={{ marginTop: 12, alignItems: "center", paddingVertical: 8 }}>
          <Text className="text-base font-medium" style={{ color: ob.ghostFg }}>
            Pick for me
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}
