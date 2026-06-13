import {
  appendNutritionLoggedItem,
  appendNutritionMeal,
  appendNutritionUserFoodToState,
  buildLoggedItemFromMeal,
  buildNutritionLoggedItem,
  canAppendNutritionItem,
  inferLoggedServingQuantity,
  localDateKey,
  loggedItemToPickerEdit,
  newNutritionItemId,
  nutritionUserFoodFromLoggedItem,
  parseQuantityInput,
  removeNutritionMeal,
  removeNutritionUserFoodFromState,
  resolvePickerMeasurementFromServing,
  scaleMacros,
  toggleNutritionFavoriteInState,
  touchNutritionPresetById,
  updateNutritionLoggedItem,
  updateNutritionMeal,
  updateNutritionUserFoodInState,
} from "@newyouai/core";
import type {
  FoodSearchResult,
  MacroTotals,
  NutritionLoggedItem,
  NutritionMeal,
  NutritionMealItem,
  NutritionPreset,
  NutritionUserFood,
} from "@newyouai/types";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EditUserFoodSheet } from "@/components/nutrition/EditUserFoodSheet";
import { BarcodeScannerGate } from "@/components/nutrition/BarcodeScannerGate";
import { LogFoodAllTab } from "@/components/nutrition/LogFoodAllTab";
import { LogFoodFavoriteFoodsTab } from "@/components/nutrition/LogFoodFavoriteFoodsTab";
import { LogFoodMyFoodsTab } from "@/components/nutrition/LogFoodMyFoodsTab";
import { LogFoodMyMealsTab } from "@/components/nutrition/LogFoodMyMealsTab";
import { ManualFoodEntryPanel } from "@/components/nutrition/ManualFoodEntryPanel";
import { MealEditorFlow, type MealEditorAddMode } from "@/components/nutrition/MealEditorFlow";
import { ServingPickerSheet, type ServingPickerMode } from "@/components/nutrition/ServingPickerSheet";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { CuratedFood } from "@/lib/curatedFoods";
import { CURATED_FOODS } from "@/lib/curatedFoods";
import { curatedToSearchResult } from "@/lib/curatedFoodSearch";
import { submitCommunityFoodFromBarcodeScan } from "@/lib/communityFoods";
import { lookupFoodByBarcode } from "@/lib/foodSearchService";
import {
  buildPickerMeasurements,
  computeServingMultiplier,
  getBaseGrams,
} from "@/lib/nutritionPickerMeasurements";
import { queueNutritionLogToast } from "@/lib/nutritionLogToast";

export type LogFoodTab = "all" | "myFoods" | "myMeals" | "saved";

const LOG_FOOD_TABS: LogFoodTab[] = ["all", "myFoods", "myMeals", "saved"];

function tabLabel(tab: LogFoodTab): string {
  switch (tab) {
    case "all":
      return "All";
    case "myFoods":
      return "My foods";
    case "myMeals":
      return "My meals";
    case "saved":
      return "Favorite foods";
    default:
      return tab;
  }
}

type Props = {
  dateKey?: string;
  editItem?: NutritionLoggedItem | null;
};

export function LogFoodScreen({ dateKey, editItem = null }: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { state, setFitnessState } = useFitnessState();
  const [tab, setTab] = useState<LogFoodTab>("all");
  const [pickerFood, setPickerFood] = useState<FoodSearchResult | null>(null);
  const [pickerCurated, setPickerCurated] = useState<CuratedFood | undefined>();
  const [pickerMode, setPickerMode] = useState<ServingPickerMode>("log");
  const [pendingDelete, setPendingDelete] = useState<NutritionUserFood | null>(null);
  const [pendingDeleteMeal, setPendingDeleteMeal] = useState<NutritionMeal | null>(null);
  const [editingUserFood, setEditingUserFood] = useState<NutritionUserFood | null>(null);

  const [mealEditorOpen, setMealEditorOpen] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealDraftName, setMealDraftName] = useState("");
  const [mealDraftItems, setMealDraftItems] = useState<NutritionMealItem[]>([]);
  const [mealAddMode, setMealAddMode] = useState<MealEditorAddMode>("none");
  const [editingLoggedItemId, setEditingLoggedItemId] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [pickerInitialMeasurementId, setPickerInitialMeasurementId] = useState<string | undefined>();
  const [pickerInitialQuantity, setPickerInitialQuantity] = useState<string | undefined>();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeLookupLoading, setBarcodeLookupLoading] = useState(false);
  const [barcodeFeedback, setBarcodeFeedback] = useState<string | null>(null);

  const activeDateKey = dateKey ?? localDateKey(new Date());

  const dayLogAtCapacity = useMemo(() => {
    if (!state) return false;
    return !canAppendNutritionItem(state, activeDateKey);
  }, [state, activeDateKey]);

  const bottomActionLabel = tab === "myMeals" && !mealEditorOpen ? "Create meal" : "Manual Add";

  function resetMealEditor() {
    setMealEditorOpen(false);
    setEditingMealId(null);
    setMealDraftName("");
    setMealDraftItems([]);
    setMealAddMode("none");
    setPickerMode("log");
  }

  function openCreateMeal() {
    resetMealEditor();
    setMealEditorOpen(true);
    setTab("myMeals");
  }

  function openEditMeal(meal: NutritionMeal) {
    setEditingMealId(meal.id);
    setMealDraftName(meal.name);
    setMealDraftItems(meal.items.map((item) => ({ ...item })));
    setMealAddMode("none");
    setMealEditorOpen(true);
    setTab("myMeals");
  }

  function saveMealDraft() {
    const name = mealDraftName.trim();
    if (!name || mealDraftItems.length === 0 || !state) return;
    if (editingMealId) {
      setFitnessState((prev) => updateNutritionMeal(prev, editingMealId, { name, items: mealDraftItems }));
    } else {
      setFitnessState((prev) =>
        appendNutritionMeal(prev, {
          id: newNutritionItemId(),
          name,
          items: mealDraftItems,
        }),
      );
    }
    resetMealEditor();
  }

  function handleBottomAction() {
    if (tab === "myMeals") {
      openCreateMeal();
      return;
    }
    setBarcodeFeedback(null);
    setManualOpen(true);
  }

  function handleScanPress() {
    setBarcodeFeedback(null);
    setScannerOpen(true);
  }

  function logManualEntry(payload: {
    name: string;
    macros: MacroTotals;
    servingLabel?: string;
    saveToMyFoods: boolean;
  }) {
    const row = buildNutritionLoggedItem(payload.macros, payload.name, {
      loggedAtMs: Date.now(),
      ...(payload.servingLabel ? { servingLabel: payload.servingLabel } : {}),
    });
    logManualFood(row, payload.saveToMyFoods);
  }

  function logManualFood(row: NutritionLoggedItem, saveToMyFoods: boolean) {
    if (!state || dayLogAtCapacity) return;
    let appended = false;
    setFitnessState((prev) => {
      const withLog = appendNutritionLoggedItem(prev, activeDateKey, row);
      if (withLog === prev) return prev;
      appended = true;
      if (!saveToMyFoods) return withLog;
      return appendNutritionUserFoodToState(withLog, nutritionUserFoodFromLoggedItem(row));
    });
    if (appended) {
      setManualOpen(false);
      finishLoggedFood(row.id);
    }
  }

  async function handleBarcodeScan(code: string) {
    setScannerOpen(false);
    setBarcodeLookupLoading(true);
    setBarcodeFeedback(null);
    try {
      const food = await lookupFoodByBarcode(code);
      if (!food) {
        setBarcodeFeedback("Product not found.");
        return;
      }
      submitCommunityFoodFromBarcodeScan(code, food);
      if (dayLogAtCapacity) {
        setBarcodeFeedback("Daily log limit reached. Remove an entry to add more.");
        return;
      }
      openPicker(food);
    } catch {
      setBarcodeFeedback("Product not found.");
    } finally {
      setBarcodeLookupLoading(false);
    }
  }

  function openPicker(food: FoodSearchResult, curated?: CuratedFood, mode: ServingPickerMode = "log") {
    setPickerFood(food);
    setPickerCurated(curated);
    setPickerMode(mode);
  }

  function closePicker() {
    setPickerFood(null);
    setPickerCurated(undefined);
    setPickerMode("log");
    setPickerInitialMeasurementId(undefined);
    setPickerInitialQuantity(undefined);
  }

  function openEditLoggedItem(item: NutritionLoggedItem) {
    setEditingLoggedItemId(item.id);
    setTab("all");
    setMealEditorOpen(false);
    setMealAddMode("none");

    const pickerEdit = loggedItemToPickerEdit(item);
    if (pickerEdit) {
      const curated =
        pickerEdit.food.source === "curated"
          ? (CURATED_FOODS.find((f) => f.id === pickerEdit.food.externalId) ?? undefined)
          : undefined;
      let food = curated ? curatedToSearchResult(curated) : pickerEdit.food;
      const bundle = buildPickerMeasurements(food, curated);
      const resolved = resolvePickerMeasurementFromServing(
        bundle.measurements,
        bundle.fixedLabels,
        item.servingLabel?.trim() ?? "",
      );
      const measurement =
        bundle.measurements.find((m) => m.id === resolved.measurementId) ??
        bundle.measurements[0] ??
        null;
      const baseGrams = getBaseGrams(food);
      let quantityNum =
        parseQuantityInput(resolved.quantity) ?? measurement?.defaultQuantity ?? 1;
      if (measurement) {
        quantityNum = inferLoggedServingQuantity(item, food, measurement, quantityNum, baseGrams);
        if (!curated) {
          const mult = computeServingMultiplier(measurement, quantityNum, baseGrams);
          const baseMacros = scaleMacros(item, mult > 0 ? 1 / mult : 1);
          food = { ...food, ...baseMacros };
        }
      }
      setPickerInitialMeasurementId(measurement?.id ?? resolved.measurementId);
      setPickerInitialQuantity(String(quantityNum));
      setPickerFood(food);
      setPickerCurated(curated);
      setPickerMode("log");
      return;
    }

    const servingLabel = item.servingLabel?.trim() || "1 serving";
    setPickerInitialMeasurementId(undefined);
    setPickerInitialQuantity(undefined);
    setPickerFood({
      id: item.id,
      name: item.name.trim() || "Food",
      cal: item.cal,
      p: item.p,
      c: item.c,
      f: item.f,
      defaultServing: servingLabel,
      baseGrams: 100,
      source: item.source?.trim() || "manual",
      externalId: item.externalId?.trim() || item.id,
      servings: [],
    });
    setPickerCurated(undefined);
    setPickerMode("log");
  }

  useEffect(() => {
    if (!editItem) return;
    openEditLoggedItem(editItem);
  }, [editItem?.id]);

  function finishLoggedFood(itemId: string) {
    closePicker();
    queueNutritionLogToast({ itemId, dateKey: activeDateKey });
    router.back();
  }

  function appendLoggedRow(row: ReturnType<typeof buildNutritionLoggedItem>): boolean {
    if (!state) return false;
    let appended = false;
    setFitnessState((prev) => {
      const next = appendNutritionLoggedItem(prev, activeDateKey, row);
      if (next === prev) return prev;
      appended = true;
      return next;
    });
    if (appended) finishLoggedFood(row.id);
    return appended;
  }

  function logFromPicker(args: { macros: MacroTotals; servingLabel: string }) {
    if (!pickerFood || !state) return;

    if (pickerMode === "mealIngredient") {
      setMealDraftItems((prev) => [
        ...prev,
        {
          id: newNutritionItemId(),
          name: pickerFood.name,
          ...args.macros,
          servingLabel: args.servingLabel,
          source: pickerFood.source,
          externalId: pickerFood.externalId,
        },
      ]);
      closePicker();
      setMealAddMode("none");
      return;
    }

    if (editingLoggedItemId) {
      const existing =
        editItem?.id === editingLoggedItemId
          ? editItem
          : (state.nutritionItemsByDay[activeDateKey] ?? []).find((row) => row.id === editingLoggedItemId);
      const row = buildNutritionLoggedItem(args.macros, pickerFood.name, {
        id: editingLoggedItemId,
        loggedAtMs: existing?.loggedAtMs ?? Date.now(),
        servingLabel: args.servingLabel,
        source: pickerFood.source,
        externalId: pickerFood.externalId,
      });
      setFitnessState((prev) => updateNutritionLoggedItem(prev, activeDateKey, editingLoggedItemId, row));
      setEditingLoggedItemId(null);
      closePicker();
      router.back();
      return;
    }

    const row = buildNutritionLoggedItem(args.macros, pickerFood.name, {
      loggedAtMs: Date.now(),
      servingLabel: args.servingLabel,
      source: pickerFood.source,
      externalId: pickerFood.externalId,
    });
    appendLoggedRow(row);
  }

  function savePickerToMyFoods(args: { macros: MacroTotals; servingLabel: string }) {
    if (!pickerFood || !state) return;
    setFitnessState((prev) =>
      appendNutritionUserFoodToState(prev, {
        id: newNutritionItemId(),
        name: pickerFood.name,
        ...args.macros,
        servingLabel: args.servingLabel,
        source: pickerFood.source,
        externalId: pickerFood.externalId,
      }),
    );
    closePicker();
    setTab("myFoods");
  }

  function logUserFood(food: NutritionUserFood) {
    if (!state || dayLogAtCapacity) return;
    const row = buildNutritionLoggedItem(food, food.name, {
      loggedAtMs: Date.now(),
      ...(food.servingLabel?.trim() ? { servingLabel: food.servingLabel.trim() } : {}),
      ...(food.source?.trim() ? { source: food.source.trim() } : {}),
      ...(food.externalId?.trim() ? { externalId: food.externalId.trim() } : {}),
    });
    appendLoggedRow(row);
  }

  function logSavedMeal(meal: NutritionMeal) {
    if (!state || dayLogAtCapacity) return;
    const row = buildLoggedItemFromMeal(meal);
    appendLoggedRow(row);
  }

  function logFavoritePreset(preset: NutritionPreset) {
    if (!state || dayLogAtCapacity) return;
    const row = buildNutritionLoggedItem(preset, preset.name, {
      loggedAtMs: Date.now(),
      ...(preset.servingLabel?.trim() ? { servingLabel: preset.servingLabel.trim() } : {}),
    });
    let appended = false;
    setFitnessState((prev) => {
      const withRow = appendNutritionLoggedItem(prev, activeDateKey, row);
      if (withRow === prev) return prev;
      appended = true;
      return {
        ...withRow,
        nutritionPresets: touchNutritionPresetById(withRow.nutritionPresets, preset.id),
      };
    });
    if (appended) finishLoggedFood(row.id);
  }

  function toggleFavorite(input: MacroTotals & { name: string; servingLabel?: string }) {
    setFitnessState((prev) => toggleNutritionFavoriteInState(prev, input));
  }

  function confirmDeleteUserFood() {
    if (!pendingDelete) return;
    setFitnessState((prev) => removeNutritionUserFoodFromState(prev, pendingDelete.id));
    setPendingDelete(null);
  }

  function confirmDeleteMeal() {
    if (!pendingDeleteMeal) return;
    setFitnessState((prev) => removeNutritionMeal(prev, pendingDeleteMeal.id));
    setPendingDeleteMeal(null);
  }

  function saveEditedUserFood(
    foodId: string,
    patch: Partial<Omit<NutritionUserFood, "id" | "savedAtMs">>,
  ) {
    setFitnessState((prev) => updateNutritionUserFoodInState(prev, foodId, patch));
  }

  function relogItem(item: NutritionLoggedItem) {
    if (!state || dayLogAtCapacity) return;
    const row = buildNutritionLoggedItem(
      { cal: item.cal, p: item.p, c: item.c, f: item.f },
      item.name.trim() || "Food",
      {
        loggedAtMs: Date.now(),
        ...(item.servingLabel?.trim() ? { servingLabel: item.servingLabel.trim() } : {}),
        ...(item.source?.trim() ? { source: item.source.trim() } : {}),
        ...(item.externalId?.trim() ? { externalId: item.externalId.trim() } : {}),
      },
    );
    appendLoggedRow(row);
  }

  function handleHeaderBack() {
    if (pickerFood) {
      if (editingLoggedItemId) {
        setEditingLoggedItemId(null);
        router.back();
        return;
      }
      closePicker();
      return;
    }
    if (manualOpen) {
      setManualOpen(false);
      return;
    }
    if (scannerOpen) {
      setScannerOpen(false);
      return;
    }
    if (mealEditorOpen) {
      if (mealAddMode !== "none") {
        setMealAddMode("none");
        return;
      }
      resetMealEditor();
      return;
    }
    router.back();
  }

  function openMealIngredientPicker(food: FoodSearchResult, curated?: CuratedFood) {
    openPicker(food, curated, "mealIngredient");
  }

  if (!state) {
    return (
      <View
        testID="modal-log-food"
        style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 16 }}
      />
    );
  }

  const headerTitle = pickerFood
    ? editingLoggedItemId
      ? "Edit serving"
      : "Choose serving"
    : manualOpen
      ? "Manual food"
    : mealEditorOpen
      ? editingMealId
        ? "Edit meal"
        : "Create meal"
      : "Log Food";

  const showTabs = !pickerFood && !mealEditorOpen && !manualOpen;
  const showBottomChrome =
    !pickerFood && !manualOpen && !(mealEditorOpen && mealAddMode !== "none" && mealAddMode !== "manual");

  return (
    <KeyboardAvoidingView
      testID="modal-log-food"
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        className="flex-row items-center gap-3 border-b px-screen-x py-3"
        style={{ borderBottomColor: colors.border, paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={handleHeaderBack}
          testID="modal-close"
          accessibilityLabel={
            pickerFood || mealEditorOpen || manualOpen ? "Back" : "Close log food"
          }
          className="h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Text className="text-xl" style={{ color: colors.textPrimary }}>
            ←
          </Text>
        </Pressable>

        <Text
          className="min-w-0 flex-1 text-xl font-bold tracking-tight"
          style={{ color: colors.textPrimary }}
          accessibilityRole="header"
        >
          {headerTitle}
        </Text>

        {!pickerFood && !mealEditorOpen && !manualOpen ? (
          <Pressable
            onPress={handleScanPress}
            testID="log-food-scan"
            accessibilityLabel="Scan barcode"
            className="flex-row items-center gap-1.5 rounded-full border px-3.5 py-2"
            style={{ borderColor: colors.accent, backgroundColor: colors.accent }}
          >
            <Text className="text-[13px] font-bold" style={{ color: colors.accentText }}>
              Scan
            </Text>
          </Pressable>
        ) : (
          <View className="w-[72px]" />
        )}
      </View>

      {pickerFood ? (
        <ServingPickerSheet
          food={pickerFood}
          curated={pickerCurated}
          dayLogAtCapacity={dayLogAtCapacity}
          mode={pickerMode}
          editing={Boolean(editingLoggedItemId)}
          initialMeasurementId={pickerInitialMeasurementId}
          initialQuantity={pickerInitialQuantity}
          logButtonLabel={editingLoggedItemId ? "Save" : undefined}
          onBack={closePicker}
          onLog={logFromPicker}
          onSaveToMyFoods={pickerMode === "log" && !editingLoggedItemId ? savePickerToMyFoods : undefined}
        />
      ) : mealEditorOpen ? (
        <View className="flex-1 px-screen-x pt-4">
          <MealEditorFlow
            state={state}
            editingMealId={editingMealId}
            draftName={mealDraftName}
            draftItems={mealDraftItems}
            onDraftNameChange={setMealDraftName}
            onDraftItemsChange={setMealDraftItems}
            onOpenPicker={openMealIngredientPicker}
            onSave={saveMealDraft}
            addMode={mealAddMode}
            onAddModeChange={setMealAddMode}
          />
        </View>
      ) : manualOpen ? (
        <ManualFoodEntryPanel dayLogAtCapacity={dayLogAtCapacity} onLog={logManualFood} />
      ) : (
        <>
          {showTabs ? (
            <View
              className="flex-row border-b px-screen-x"
              style={{ borderBottomColor: colors.border }}
              accessibilityRole="tablist"
            >
              {LOG_FOOD_TABS.map((t) => {
                const selected = tab === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    testID={`log-food-tab-${t}`}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    className="flex-1 items-center border-b-2 py-3"
                    style={{ borderBottomColor: selected ? colors.accent : "transparent" }}
                  >
                    <Text
                      className="text-[13px] font-semibold"
                      style={{ color: selected ? colors.textPrimary : colors.textSecondary }}
                    >
                      {tabLabel(t)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {barcodeFeedback || barcodeLookupLoading ? (
            <View className="px-screen-x pt-3">
              <Text
                className="text-sm leading-5"
                style={{ color: barcodeFeedback ? "#ffb4b4" : colors.textSecondary }}
                testID="barcode-feedback"
              >
                {barcodeLookupLoading ? "Looking up barcode…" : barcodeFeedback}
              </Text>
            </View>
          ) : null}

          <ScrollView
            className="flex-1 px-screen-x"
            accessibilityLabel={`Log food for ${activeDateKey}`}
            contentContainerStyle={{ flexGrow: 1, paddingVertical: 16, paddingBottom: insets.bottom + 100 }}
            keyboardShouldPersistTaps="handled"
          >
            {tab === "all" ? (
              <LogFoodAllTab
                state={state}
                dayLogAtCapacity={dayLogAtCapacity}
                onOpenPicker={openPicker}
                onRelogItem={relogItem}
              />
            ) : tab === "myFoods" ? (
              <LogFoodMyFoodsTab
                state={state}
                dayLogAtCapacity={dayLogAtCapacity}
                onOpenPicker={openPicker}
                onDirectLog={logUserFood}
                onToggleFavorite={toggleFavorite}
                onRequestDelete={setPendingDelete}
                onEditFood={setEditingUserFood}
                pendingDelete={pendingDelete}
                onCancelDelete={() => setPendingDelete(null)}
                onConfirmDelete={confirmDeleteUserFood}
              />
            ) : tab === "myMeals" ? (
              <LogFoodMyMealsTab
                state={state}
                dayLogAtCapacity={dayLogAtCapacity}
                onLogMeal={logSavedMeal}
                onEditMeal={openEditMeal}
                pendingDelete={pendingDeleteMeal}
                onRequestDelete={setPendingDeleteMeal}
                onCancelDelete={() => setPendingDeleteMeal(null)}
                onConfirmDelete={confirmDeleteMeal}
              />
            ) : (
              <LogFoodFavoriteFoodsTab
                state={state}
                dayLogAtCapacity={dayLogAtCapacity}
                onLogPreset={logFavoritePreset}
                onLogUserFood={logUserFood}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </ScrollView>

          {showBottomChrome ? (
            <View
              className="absolute bottom-0 left-0 right-0 border-t px-screen-x pt-3"
              style={{
                borderTopColor: colors.border,
                backgroundColor: colors.background,
                paddingBottom: insets.bottom + 14,
              }}
            >
              <PrimaryButton
                block
                testID={tab === "myMeals" ? "log-food-create-meal" : "log-food-manual-add"}
                onPress={handleBottomAction}
              >
                {bottomActionLabel}
              </PrimaryButton>
            </View>
          ) : null}
        </>
      )}

      <EditUserFoodSheet
        food={editingUserFood}
        onClose={() => setEditingUserFood(null)}
        onSave={saveEditedUserFood}
      />

      {scannerOpen ? (
        <View className="absolute inset-0 z-50">
          <BarcodeScannerGate onScan={handleBarcodeScan} onClose={() => setScannerOpen(false)} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
