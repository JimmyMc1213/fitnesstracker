import { localDateKey } from "@newyouai/core";
import type { AppState, CompletedWorkoutSession } from "@newyouai/types";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { WorkoutSessionPreviewSheet } from "@/components/workout/WorkoutSessionPreviewSheet";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getWorkoutsForDay, workoutDaysInMonth } from "@/lib/workout/workoutHistory";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthLabel(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function buildMonthGrid(year: number, monthIndex: number): (string | null)[] {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type Props = {
  state: AppState;
};

export function WorkoutCalendarCard({ state }: Props) {
  const { colors } = useAppTheme();
  const todayKey = localDateKey(new Date());
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [previewSession, setPreviewSession] = useState<CompletedWorkoutSession | null>(null);

  const workoutDays = useMemo(
    () => workoutDaysInMonth(state.workoutHistory, viewYear, viewMonth),
    [state.workoutHistory, viewYear, viewMonth],
  );
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const weeks = useMemo(() => {
    const rows: (string | null)[][] = [];
    for (let i = 0; i < grid.length; i += 7) rows.push(grid.slice(i, i + 7));
    return rows;
  }, [grid]);

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function onDayPress(dayKey: string) {
    const daySessions = getWorkoutsForDay(state.workoutHistory, dayKey);
    if (daySessions.length === 1) setPreviewSession(daySessions[0]!);
  }

  return (
    <>
      <View
        testID="progress-workout-calendar"
        className="rounded-[14px] border p-[18px]"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <View className="mb-3.5 flex-row items-center justify-between">
          <Text className="text-[15px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            {monthLabel(viewYear, viewMonth)}
          </Text>
          <View className="flex-row gap-1">
            <Pressable
              onPress={() => shiftMonth(-1)}
              accessibilityLabel="Previous month"
              className="h-8 w-8 items-center justify-center rounded-lg border"
              style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 16 }}>‹</Text>
            </Pressable>
            <Pressable
              onPress={() => shiftMonth(1)}
              accessibilityLabel="Next month"
              className="h-8 w-8 items-center justify-center rounded-lg border"
              style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 16 }}>›</Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-1.5 flex-row gap-1">
          {WEEKDAYS.map((w) => (
            <Text
              key={w}
              className="flex-1 text-center text-[10px] font-semibold tracking-wide"
              style={{ color: colors.textTertiary }}
            >
              {w}
            </Text>
          ))}
        </View>

        <View className="gap-1">
          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} className="flex-row gap-1">
              {week.map((dayKey, dayIndex) => {
                if (!dayKey) {
                  return (
                    <View
                      key={`pad-${weekIndex}-${dayIndex}`}
                      className="min-h-9 flex-1 rounded-lg"
                      style={{ aspectRatio: 1 }}
                    />
                  );
                }
                const hasWorkout = workoutDays.has(dayKey);
                const isToday = dayKey === todayKey;
                const isFuture = dayKey > todayKey;
                const canTap = hasWorkout && !isFuture;

                return (
                  <Pressable
                    key={dayKey}
                    disabled={!canTap}
                    onPress={() => onDayPress(dayKey)}
                    className="min-h-9 flex-1 items-center justify-center rounded-lg"
                    style={{
                      aspectRatio: 1,
                      borderWidth: isToday ? 1.5 : 0,
                      borderColor: isToday ? (hasWorkout ? "rgba(255,255,255,0.55)" : colors.border) : "transparent",
                      backgroundColor: hasWorkout ? colors.accent : colors.backgroundSecondary,
                      opacity: isFuture && !hasWorkout ? 0.6 : 1,
                    }}
                  >
                    <Text
                      className="text-[13px] font-medium tabular-nums"
                      style={{
                        color: hasWorkout ? colors.accentText : isFuture ? colors.textTertiary : colors.textPrimary,
                        fontWeight: isToday ? "700" : "500",
                      }}
                    >
                      {Number(dayKey.slice(8))}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {workoutDays.size === 0 ? (
          <Text className="mt-3.5 text-center text-[11px]" style={{ color: colors.textTertiary }}>
            No workouts yet. Finish a session in Workout to light up your calendar
          </Text>
        ) : (
          <Text className="mt-3.5 text-[11px]" style={{ color: colors.textTertiary }}>
            Tap a blue day for your session breakdown
          </Text>
        )}
      </View>

      {previewSession ? (
        <WorkoutSessionPreviewSheet
          session={previewSession}
          unitPreferences={state.unitPreferences}
          onClose={() => setPreviewSession(null)}
        />
      ) : null}
    </>
  );
}
