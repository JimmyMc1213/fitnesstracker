import {
  clampMacroInputString,
  mealItemFromPreset,
  mealItemFromUserFood,
  newNutritionItemId,
  parseBoundedMacro,
  sumMealMacros,
} from "@newyouai/core";
import type {
  AppState,
  FoodSearchResult,
  NutritionMealItem,
  NutritionPreset,
  NutritionUserFood,
} from "@newyouai/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBottomActionPadding } from "@/lib/screenInsets";
import { AppTextField } from "@/components/ui/AppTextField";
import { FoodSearchSkeletonList } from "@/components/nutrition/FoodSearchSkeletonList";
import { NutritionDeleteConfirmSheet } from "@/components/nutrition/NutritionDeleteConfirmSheet";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import {
  curatedDefaultServingMacros,
  curatedToSearchResult,
  filterCuratedFoods,
} from "@/lib/curatedFoodSearch";
import type { CuratedFood } from "@/lib/curatedFoods";
import { FOOD_SEARCH_MIN_QUERY_LEN } from "@/lib/foodSearchGuards";
import { displayFoodName } from "@/lib/foodDisplay";
import { FoodSearchError, searchFoods } from "@/lib/foodSearchService";
import { formatPresetSubtitle, formatUserFoodSubtitle } from "@/lib/nutritionUserFoodHelpers";
import { useAppTheme } from "@/hooks/useAppTheme";

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_SERVING = "1 serving";

export type MealEditorAddMode = "none" | "search" | "myFoods" | "favorites" | "manual";

type PendingIngredientDelete = { itemId: string; name: string };

type Props = {
  state: AppState;
  editingMealId: string | null;
  draftName: string;
  draftItems: NutritionMealItem[];
  onDraftNameChange: (name: string) => void;
  onDraftItemsChange: (items: NutritionMealItem[]) => void;
  onOpenPicker: (food: FoodSearchResult, curated?: CuratedFood) => void;
  onSave: () => void;
  addMode: MealEditorAddMode;
  onAddModeChange: (mode: MealEditorAddMode) => void;
};

function FieldLabel({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <Text
      className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: colors.textTertiary }}
    >
      {label}
    </Text>
  );
}

function AddSourceButton({ label, onPress, testID }: { label: string; onPress: () => void; testID?: string }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      className="rounded-xl border px-3.5 py-3"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <Text className="text-[14px] font-semibold" style={{ color: colors.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function MealEditorFlow({
  state,
  editingMealId,
  draftName,
  draftItems,
  onDraftNameChange,
  onDraftItemsChange,
  onOpenPicker,
  onSave,
  addMode,
  onAddModeChange,
}: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomActionPadding = useBottomActionPadding();
  const [search, setSearch] = useState("");
  const [apiResults, setApiResults] = useState<FoodSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const searchSeq = useRef(0);

  const [manualName, setManualName] = useState("");
  const [manualCal, setManualCal] = useState("");
  const [manualP, setManualP] = useState("");
  const [manualC, setManualC] = useState("");
  const [manualF, setManualF] = useState("");
  const [manualServing, setManualServing] = useState("");
  const [pendingIngredientDelete, setPendingIngredientDelete] = useState<PendingIngredientDelete | null>(null);

  const mealDraftMacros = useMemo(() => sumMealMacros(draftItems), [draftItems]);
  const userFoods = state.nutritionUserFoods ?? [];
  const favoritePresets = useMemo(
    () =>
      (state.nutritionPresets ?? [])
        .filter((p) => p.favoritedAtMs != null)
        .sort((a, b) => (b.favoritedAtMs ?? 0) - (a.favoritedAtMs ?? 0)),
    [state.nutritionPresets],
  );

  const filteredCurated = useMemo(() => filterCuratedFoods(search), [search]);
  const searchActive = search.trim().length >= FOOD_SEARCH_MIN_QUERY_LEN;

  useEffect(() => {
    if (addMode !== "search") return;
    const q = search.trim();
    if (q.length < FOOD_SEARCH_MIN_QUERY_LEN) {
      setApiResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    const seq = ++searchSeq.current;
    setSearchLoading(true);
    setSearchError(null);

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const results = await searchFoods(q);
          if (seq !== searchSeq.current) return;
          setApiResults(results);
          setSearchError(null);
        } catch (e) {
          if (seq !== searchSeq.current) return;
          setApiResults([]);
          setSearchError(e instanceof FoodSearchError ? e.message : "Search failed. Try again.");
        } finally {
          if (seq === searchSeq.current) setSearchLoading(false);
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [addMode, search, retryKey]);

  function closeAddMode() {
    onAddModeChange("none");
    setSearch("");
    setApiResults([]);
    setSearchError(null);
    resetManualDraft();
  }

  function resetManualDraft() {
    setManualName("");
    setManualCal("");
    setManualP("");
    setManualC("");
    setManualF("");
    setManualServing("");
  }

  function addFromUserFood(food: NutritionUserFood) {
    onDraftItemsChange([...draftItems, mealItemFromUserFood(food)]);
    closeAddMode();
  }

  function addFromPreset(preset: NutritionPreset) {
    onDraftItemsChange([...draftItems, mealItemFromPreset(preset)]);
    closeAddMode();
  }

  function addFromManual() {
    const name = manualName.trim() || "Food";
    const item: NutritionMealItem = {
      id: newNutritionItemId(),
      name,
      cal: parseBoundedMacro(manualCal, "cal"),
      p: parseBoundedMacro(manualP, "p"),
      c: parseBoundedMacro(manualC, "c"),
      f: parseBoundedMacro(manualF, "f"),
      ...(manualServing.trim() ? { servingLabel: manualServing.trim() } : {}),
    };
    onDraftItemsChange([...draftItems, item]);
    closeAddMode();
  }

  function confirmRemoveIngredient() {
    if (!pendingIngredientDelete) return;
    onDraftItemsChange(draftItems.filter((item) => item.id !== pendingIngredientDelete.itemId));
    setPendingIngredientDelete(null);
  }

  const canSave = draftName.trim().length > 0 && draftItems.length > 0;

  function renderSearchPanel() {
    return (
      <>
        <AppTextField
          value={search}
          onChangeText={setSearch}
          testID="meal-editor-search-input"
          accessibilityLabel="Search foods for meal"
          placeholder="Search foods to add"
          autoCorrect={false}
          autoCapitalize="none"
          backgroundColor={colors.card}
        />
        {searchActive ? (
          searchLoading ? (
            <FoodSearchSkeletonList />
          ) : searchError ? (
            <Text className="mt-2 text-sm leading-5" style={{ color: "#ffb4b4" }}>
              {searchError}
            </Text>
          ) : filteredCurated.length === 0 && apiResults.length === 0 ? (
            <Text className="mt-2 text-sm leading-5" style={{ color: colors.textSecondary }}>
              No results. Try another search.
            </Text>
          ) : (
            <View className="mt-2">
              {filteredCurated.length > 0 ? (
                <>
                  <Text
                    className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: colors.textTertiary }}
                  >
                    Common Foods
                  </Text>
                  {filteredCurated.map((curated) => {
                    const macros = curatedDefaultServingMacros(curated);
                    return (
                      <Pressable
                        key={curated.id}
                        onPress={() => onOpenPicker(curatedToSearchResult(curated), curated)}
                        className="flex-row items-center gap-3 border-b py-3"
                        style={{ borderBottomColor: colors.border }}
                      >
                        <View className="min-w-0 flex-1">
                          <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                            {curated.name}
                          </Text>
                          <Text className="mt-1 text-xs tabular-nums" style={{ color: colors.textSecondary }}>
                            {macros.cal} cal · {curated.defaultServing.label}
                          </Text>
                        </View>
                        <Text className="text-lg" style={{ color: colors.textTertiary }}>
                          ›
                        </Text>
                      </Pressable>
                    );
                  })}
                </>
              ) : null}
              {apiResults.length > 0 ? (
                <>
                  <Text
                    className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: colors.textTertiary }}
                  >
                    More Results
                  </Text>
                  {apiResults.map((food) => (
                    <Pressable
                      key={food.id}
                      onPress={() => onOpenPicker(food)}
                      className="flex-row items-center gap-3 border-b py-3"
                      style={{ borderBottomColor: colors.border }}
                    >
                      <View className="min-w-0 flex-1">
                        <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                          {displayFoodName(food.name, food.source)}
                        </Text>
                        <Text className="mt-1 text-xs tabular-nums" style={{ color: colors.textSecondary }}>
                          {Math.round(Number(food.cal) || 0)} cal · {food.defaultServing}
                        </Text>
                      </View>
                      <Text className="text-lg" style={{ color: colors.textTertiary }}>
                        ›
                      </Text>
                    </Pressable>
                  ))}
                </>
              ) : null}
            </View>
          )
        ) : (
          <Text className="mt-2 text-sm leading-5" style={{ color: colors.textSecondary }}>
            Type at least {FOOD_SEARCH_MIN_QUERY_LEN} characters to search.
          </Text>
        )}
      </>
    );
  }

  function renderMyFoodsPanel() {
    if (userFoods.length === 0) {
      return (
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          No saved foods yet. Add foods in My foods first.
        </Text>
      );
    }
    return (
      <>
        {userFoods.map((food) => (
          <Pressable
            key={food.id}
            onPress={() => addFromUserFood(food)}
            className="flex-row items-center gap-3 border-b py-3"
            style={{ borderBottomColor: colors.border }}
          >
            <View className="min-w-0 flex-1">
              <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                {food.name}
              </Text>
              <Text className="mt-1 text-xs tabular-nums" style={{ color: colors.textSecondary }}>
                {formatUserFoodSubtitle(food)}
              </Text>
            </View>
            <Text className="text-[14px] font-semibold" style={{ color: "#4ade80" }}>
              Add
            </Text>
          </Pressable>
        ))}
      </>
    );
  }

  function renderFavoritesPanel() {
    if (favoritePresets.length === 0) {
      return (
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          No favorite foods yet. Star foods while logging to save them here.
        </Text>
      );
    }
    return (
      <>
        {favoritePresets.map((preset) => (
          <Pressable
            key={preset.id}
            onPress={() => addFromPreset(preset)}
            className="flex-row items-center gap-3 border-b py-3"
            style={{ borderBottomColor: colors.border }}
          >
            <View className="min-w-0 flex-1">
              <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                {preset.name.trim() || "Food"}
              </Text>
              <Text className="mt-1 text-xs tabular-nums" style={{ color: colors.textSecondary }}>
                {formatPresetSubtitle(preset)}
              </Text>
            </View>
            <Text className="text-[14px] font-semibold" style={{ color: "#4ade80" }}>
              Add
            </Text>
          </Pressable>
        ))}
      </>
    );
  }

  function renderManualPanel() {
    return (
      <View
        className="rounded-[14px] border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <FieldLabel label="Ingredient name" />
        <AppTextField
          value={manualName}
          onChangeText={setManualName}
          accessibilityLabel="Ingredient name"
          placeholder="e.g. Greek yogurt"
          backgroundColor={colors.background}
        />
        <FieldLabel label="Calories (cal)" />
        <AppTextField
          value={manualCal}
          onChangeText={(raw) => setManualCal(clampMacroInputString(raw, "cal"))}
          onBlur={() => setManualCal(String(parseBoundedMacro(manualCal, "cal")))}
          accessibilityLabel="Ingredient calories"
          keyboardType="decimal-pad"
          backgroundColor={colors.background}
          style={{ fontVariant: ["tabular-nums"] }}
        />
        <View className="mt-2 flex-row gap-2">
          {(
            [
              { label: "Protein (g)", value: manualP, set: setManualP, macro: "p" as const },
              { label: "Carbs (g)", value: manualC, set: setManualC, macro: "c" as const },
              { label: "Fat (g)", value: manualF, set: setManualF, macro: "f" as const },
            ] as const
          ).map((field) => (
            <View key={field.macro} className="min-w-0 flex-1">
              <FieldLabel label={field.label} />
              <AppTextField
                value={field.value}
                onChangeText={(raw) => field.set(clampMacroInputString(raw, field.macro))}
                onBlur={() => field.set(String(parseBoundedMacro(field.value, field.macro)))}
                accessibilityLabel={field.label}
                keyboardType="decimal-pad"
                backgroundColor={colors.background}
                style={{ fontVariant: ["tabular-nums"] }}
              />
            </View>
          ))}
        </View>
        <FieldLabel label="Serving (optional)" />
        <AppTextField
          value={manualServing}
          onChangeText={setManualServing}
          accessibilityLabel="Ingredient serving"
          placeholder="e.g. 1 cup"
          backgroundColor={colors.background}
        />
      </View>
    );
  }

  function renderMainEditor() {
    return (
      <>
        <View
          className="rounded-[14px] border p-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <FieldLabel label="Meal name" />
          <AppTextField
            value={draftName}
            onChangeText={onDraftNameChange}
            testID="meal-editor-name-input"
            accessibilityLabel="Meal name"
            placeholder="e.g. Meal prep lunch"
            backgroundColor={colors.background}
          />
          <Text className="mt-3 text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
            {Math.round(mealDraftMacros.cal)} cal · {Math.round(mealDraftMacros.p)}g protein ·{" "}
            {draftItems.length} ingredient{draftItems.length === 1 ? "" : "s"}
          </Text>
        </View>

        <Text
          className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: colors.textTertiary }}
        >
          Ingredients
        </Text>
        {draftItems.length === 0 ? (
          <Text className="mb-4 text-sm leading-5" style={{ color: colors.textSecondary }}>
            Add at least one ingredient below.
          </Text>
        ) : (
          <View
            className="mb-4 overflow-hidden rounded-[14px] border px-3.5 py-1"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            {draftItems.map((item, idx) => {
              const isLast = idx === draftItems.length - 1;
              return (
                <View
                  key={item.id}
                  className="flex-row items-center gap-2"
                  style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border }}
                >
                  <View className="min-w-0 flex-1 py-3">
                    <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                      {item.name}
                    </Text>
                    <Text className="mt-1 text-xs tabular-nums" style={{ color: colors.textSecondary }}>
                      {Math.round(Number(item.cal) || 0)} cal · {item.servingLabel?.trim() || DEFAULT_SERVING}
                    </Text>
                  </View>
                  <Pressable
                    testID={`meal-ingredient-remove-${item.id}`}
                    onPress={() =>
                      setPendingIngredientDelete({
                        itemId: item.id,
                        name: item.name.trim() || "this ingredient",
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.name}`}
                    className="px-2 py-2"
                  >
                    <Text className="text-[13px] font-semibold" style={{ color: "#ffb4b4" }}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View className="gap-2">
          <AddSourceButton
            testID="meal-add-from-search"
            label="Add from search"
            onPress={() => {
              onAddModeChange("search");
              resetManualDraft();
            }}
          />
          <AddSourceButton
            testID="meal-add-from-my-foods"
            label="Add from My foods"
            onPress={() => {
              onAddModeChange("myFoods");
              resetManualDraft();
            }}
          />
          <AddSourceButton
            testID="meal-add-from-favorites"
            label="Add from Favorite foods"
            onPress={() => {
              onAddModeChange("favorites");
              resetManualDraft();
            }}
          />
          <AddSourceButton
            testID="meal-add-manually"
            label="Add manually"
            onPress={() => {
              onAddModeChange("manual");
              resetManualDraft();
            }}
          />
        </View>
      </>
    );
  }

  const showSaveButton = addMode === "none" || addMode === "manual";
  const showAddIngredientButton = addMode === "manual";

  return (
    <View testID="meal-editor-flow" style={{ flex: 1 }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {addMode === "search"
          ? renderSearchPanel()
          : addMode === "myFoods"
            ? renderMyFoodsPanel()
            : addMode === "favorites"
              ? renderFavoritesPanel()
              : addMode === "manual"
                ? renderManualPanel()
                : renderMainEditor()}
      </ScrollView>

      {showSaveButton ? (
        <View
          className="absolute bottom-0 left-0 right-0 border-t px-screen-x pt-3"
          style={{
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: bottomActionPadding,
          }}
        >
          {showAddIngredientButton ? (
            <PrimaryButton block testID="meal-add-ingredient-manual" onPress={addFromManual}>
              Add ingredient
            </PrimaryButton>
          ) : (
            <PrimaryButton
              block
              testID={editingMealId ? "meal-editor-save" : "meal-editor-create"}
              onPress={onSave}
              disabled={!canSave}
            >
              {editingMealId ? "Save meal" : "Create meal"}
            </PrimaryButton>
          )}
        </View>
      ) : null}

      {pendingIngredientDelete ? (
        <NutritionDeleteConfirmSheet
          title="Remove ingredient?"
          message={`Remove ${pendingIngredientDelete.name} from this meal?`}
          onCancel={() => setPendingIngredientDelete(null)}
          onConfirm={confirmRemoveIngredient}
        />
      ) : null}
    </View>
  );
}
