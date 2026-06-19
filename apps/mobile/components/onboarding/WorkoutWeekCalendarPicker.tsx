import type { OnboardingProfile } from "@newyouai/types";
import { Pressable, Text, View } from "react-native";

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
        className="flex-row flex-wrap justify-between gap-2"
      >
        {TRAINING_WEEKDAY_ORDER.map((day) => {
          const on = selected.includes(day);
          const pill = onboardingPillColors(ob, on);
          return (
            <Pressable
              key={day}
              testID={`onboarding-calendar-day-${day}`}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${day}${on ? ", selected" : ""}`}
              onPress={() => applyWeekdays(toggleTrainingWeekday(selected, day, selectionLimits))}
              className="h-11 w-11 items-center justify-center rounded-full border"
              style={{
                borderColor: pill.borderColor,
                backgroundColor: pill.backgroundColor,
              }}
            >
              <Text className="text-sm font-semibold" style={{ color: pill.color }}>
                {TRAINING_WEEKDAY_SHORT[day]}
              </Text>
            </Pressable>
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
        <Pressable onPress={() => applyWeekdays(pickTrainingWeekdaysForMe(selected))} className="mt-3 items-center py-2">
          <Text className="text-base font-medium" style={{ color: ob.ghostFg }}>
            Pick for me
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
