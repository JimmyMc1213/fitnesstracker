import { effectiveNutritionTotalsForDateKey, formatDateKeyEyebrow, localDateKey, appendNutritionLoggedItem, removeNutritionLoggedItem, appendWaterLogEntry, removeWaterLogEntry, clearWaterLogForDateKey } from "@newyouai/core";
import type { NutritionLoggedItem } from "@newyouai/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { FoodAddedToast, useFoodAddedToast } from "@/components/nutrition/FoodAddedToast";
import { TodayFoodLogCard } from "@/components/nutrition/TodayFoodLogCard";
import { WaterTrackerCard } from "@/components/nutrition/WaterTrackerCard";
import { MacroBar } from "@/components/home/MacroBar";
import { MacroRing } from "@/components/home/MacroRing";
import { ConfettiBurst } from "@/components/motion/ConfettiBurst";
import { TabScreenFade } from "@/components/motion/TabScreenFade";
import { MACRO_COLORS } from "@/lib/macroColors";
import { ScreenHeader } from "@/components/home/ScreenHeader";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { takeNutritionLogToast } from "@/lib/nutritionLogToast";
import { useTabScreenInsets } from "@/lib/tabScreenInsets";

const PROTEIN_PRIORITY_ACCENT = "#ffc878";

export default function NutritionScreen() {
  const { colors } = useAppTheme();
  const { paddingTop, paddingBottom } = useTabScreenInsets();
  const { state, setFitnessState } = useFitnessState();
  const foodAddedToast = useFoodAddedToast();
  const deleteToast = useFoodAddedToast();
  const pendingToastRef = useRef<{ itemId: string; dateKey: string } | null>(null);
  const pendingDeleteRef = useRef<{ item: NutritionLoggedItem; dateKey: string } | null>(null);
  const [toastMessage, setToastMessage] = useState("Food added");
  const [toastTestId, setToastTestId] = useState("food-added-toast");
  const [toastUndoTestId, setToastUndoTestId] = useState("food-added-toast-undo");
  const [hydrationConfettiKey, setHydrationConfettiKey] = useState(0);
  const hydrationConfettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todayKey = useMemo(() => localDateKey(new Date()), []);
  const todayFoodItems = useMemo(
    () => state?.nutritionItemsByDay[todayKey] ?? [],
    [state, todayKey],
  );
  const waterEntries = useMemo(
    () => state?.waterLogByDay[todayKey] ?? [],
    [state, todayKey],
  );
  const volumeUnit = state?.unitPreferences.volumeUnit ?? "oz";
  const targets = state?.nutritionTargets ?? { cal: 0, p: 0, c: 0, f: 0 };
  const totals = useMemo(() => {
    if (!state) return { cal: 0, p: 0, c: 0, f: 0 };
    return effectiveNutritionTotalsForDateKey(
      state.nutritionManualByDay,
      state.nutritionItemsByDay,
      todayKey,
    );
  }, [state, todayKey]);
  const kcalLeft = Math.max(0, targets.cal - totals.cal);
  const proteinLeft = Math.max(0, targets.p - totals.p);

  const handleHydrationGoalReached = useCallback(() => {
    setHydrationConfettiKey((key) => key + 1);
    if (hydrationConfettiTimerRef.current) clearTimeout(hydrationConfettiTimerRef.current);
    hydrationConfettiTimerRef.current = setTimeout(() => {
      setHydrationConfettiKey(0);
      hydrationConfettiTimerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (hydrationConfettiTimerRef.current) clearTimeout(hydrationConfettiTimerRef.current);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const payload = takeNutritionLogToast();
      if (payload) {
        pendingToastRef.current = payload;
        pendingDeleteRef.current = null;
        setToastMessage("Food added");
        setToastTestId("food-added-toast");
        setToastUndoTestId("food-added-toast-undo");
        deleteToast.hide();
        foodAddedToast.show(payload.itemId);
      }
    }, [foodAddedToast.show, deleteToast.hide]),
  );

  const toastVisible = foodAddedToast.visible || deleteToast.visible;

  function handleUndoToast() {
    if (pendingDeleteRef.current && state) {
      const { item, dateKey } = pendingDeleteRef.current;
      setFitnessState((prev) => appendNutritionLoggedItem(prev, dateKey, item));
      pendingDeleteRef.current = null;
      deleteToast.hide();
      return;
    }

    const pending = pendingToastRef.current;
    const itemId = foodAddedToast.itemId ?? pending?.itemId;
    const dateKey = pending?.dateKey ?? todayKey;
    if (!itemId || !state) return;
    setFitnessState((prev) => removeNutritionLoggedItem(prev, dateKey, itemId));
    pendingToastRef.current = null;
    foodAddedToast.hide();
  }

  function openLogFood() {
    router.push("/log-food");
  }

  function handleEditFood(item: NutritionLoggedItem) {
    router.push({
      pathname: "/log-food",
      params: { editItemId: item.id, dateKey: todayKey },
    });
  }

  function handleRemoveFood(itemId: string) {
    const item = todayFoodItems.find((row) => row.id === itemId);
    if (!item || !state) return;
    setFitnessState((prev) => removeNutritionLoggedItem(prev, todayKey, itemId));
    pendingToastRef.current = null;
    foodAddedToast.hide();
    pendingDeleteRef.current = { item, dateKey: todayKey };
    setToastMessage("Food removed");
    setToastTestId("food-removed-toast");
    setToastUndoTestId("food-removed-toast-undo");
    deleteToast.show(itemId);
  }

  return (
    <View testID="tab-nutrition" style={{ flex: 1, backgroundColor: "transparent" }}>
      <TabScreenFade>
      <ScrollView
        className="flex-1 px-screen-x"
        contentContainerStyle={{ paddingBottom, paddingTop }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow={formatDateKeyEyebrow(todayKey)}
          title="Nutrition"
          titleTestID="nutrition-title"
        />

        <View
          className="mt-[18px] rounded-[14px] border p-[18px]"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <View className="flex-row items-center gap-[18px]">
            <MacroRing value={totals.cal} target={targets.cal} size={132} stroke={6} />
            <View className="min-w-0 flex-1 gap-3">
              <View>
                <Text
                  className="text-[11px] font-medium uppercase tracking-widest"
                  style={{ color: colors.textTertiary }}
                >
                  Today
                </Text>
                <Text
                  className="mt-1 text-xs font-medium tabular-nums"
                  style={{ color: colors.textSecondary }}
                  testID="nutrition-cal-left"
                >
                  {kcalLeft.toLocaleString()} cal left
                </Text>
              </View>
              <MacroBar label="Protein" value={totals.p} target={targets.p} color={MACRO_COLORS.protein} />
              <MacroBar label="Carbs" value={totals.c} target={targets.c} color={MACRO_COLORS.carbs} />
              <MacroBar label="Fat" value={totals.f} target={targets.f} color={MACRO_COLORS.fat} />
            </View>
          </View>

          {targets.p > 0 && proteinLeft > 0 ? (
            <Text
              className="mt-3.5 border-t pt-3.5 text-[13px] leading-5"
              style={{ borderTopColor: colors.border, color: colors.textSecondary }}
            >
              <Text style={{ color: PROTEIN_PRIORITY_ACCENT, fontWeight: "600" }}>
                {Math.round(proteinLeft)}g
              </Text>{" "}
              of protein to go. This is your{" "}
              <Text style={{ color: PROTEIN_PRIORITY_ACCENT, fontWeight: "600" }}>#1</Text> priority.
            </Text>
          ) : null}
        </View>

        {state ? (
          <WaterTrackerCard
            dateKey={todayKey}
            targetOz={state.waterDailyTargetOz}
            entries={waterEntries}
            isToday
            volumeUnit={volumeUnit}
            onAddOz={(oz) => setFitnessState((prev) => appendWaterLogEntry(prev, todayKey, oz))}
            onRemoveEntry={(entryId) =>
              setFitnessState((prev) => removeWaterLogEntry(prev, todayKey, entryId))
            }
            onRemoveAllEntries={() =>
              setFitnessState((prev) => clearWaterLogForDateKey(prev, todayKey))
            }
            onGoalReached={handleHydrationGoalReached}
          />
        ) : null}

        <TodayFoodLogCard
          items={todayFoodItems}
          onRemove={handleRemoveFood}
          onEdit={handleEditFood}
        />
      </ScrollView>
      </TabScreenFade>

      {hydrationConfettiKey > 0 ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <ConfettiBurst key={hydrationConfettiKey} count={48} />
        </View>
      ) : null}

      <View
        className="absolute bottom-28 left-0 right-0 px-screen-x"
        pointerEvents="box-none"
      >
        <FoodAddedToast
          visible={toastVisible}
          message={toastMessage}
          testID={toastTestId}
          undoTestID={toastUndoTestId}
          onUndo={handleUndoToast}
        />
      </View>
    </View>
  );
}
