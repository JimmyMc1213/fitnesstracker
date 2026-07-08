import {
  MAX_NUTRITION_ITEMS_PER_DAY,
  parseQuantityInput,
  scaleMacros,
} from "@newyouai/core";
import type { FoodMeasurement, FoodSearchResult } from "@newyouai/types";
import { IconBookmark } from "@tabler/icons-react-native";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { AppTextField } from "@/components/ui/AppTextField";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import type { CuratedFood } from "@/lib/curatedFoods";
import { formatMacroGrams, displayFoodName } from "@/lib/foodDisplay";
import {
  buildPickerMeasurements,
  clampServingQuantityInput,
  computeServingMultiplier,
  getBaseGrams,
  pickerServingLabel,
} from "@/lib/nutritionPickerMeasurements";
import { useBottomActionPadding } from "@/lib/screenInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MACRO_COLORS } from "@/lib/macroColors";

export type ServingPickerMode = "log" | "mealIngredient";

type Props = {
  food: FoodSearchResult;
  curated?: CuratedFood;
  dayLogAtCapacity: boolean;
  mode?: ServingPickerMode;
  editing?: boolean;
  initialMeasurementId?: string;
  initialQuantity?: string;
  logButtonLabel?: string;
  onLog: (args: {
    macros: { cal: number; p: number; c: number; f: number };
    servingLabel: string;
  }) => void;
  onSaveToMyFoods?: (args: {
    macros: { cal: number; p: number; c: number; f: number };
    servingLabel: string;
  }) => void;
};

export function ServingPickerSheet({
  food,
  curated,
  dayLogAtCapacity,
  mode = "log",
  editing = false,
  initialMeasurementId,
  initialQuantity,
  logButtonLabel,
  onLog,
  onSaveToMyFoods,
}: Props) {
  const isMealIngredient = mode === "mealIngredient";
  const primaryActionLabel =
    logButtonLabel ?? (isMealIngredient ? "Add ingredient" : "Log food");
  const { colors } = useAppTheme();
  const bottomActionPadding = useBottomActionPadding();
  const bundle = useMemo(() => buildPickerMeasurements(food, curated), [food, curated]);
  const [measurementId, setMeasurementId] = useState(bundle.measurements[0]?.id ?? "g");
  const [quantity, setQuantity] = useState("");

  const measurement =
    bundle.measurements.find((m) => m.id === measurementId) ?? bundle.measurements[0] ?? null;
  const baseGrams = getBaseGrams(food);
  const quantityNum = parseQuantityInput(quantity) ?? measurement?.defaultQuantity ?? 1;
  const multiplier = measurement
    ? computeServingMultiplier(measurement, quantityNum, baseGrams)
    : 1;
  const macros = useMemo(() => scaleMacros(food, multiplier), [food, multiplier]);

  useEffect(() => {
    const defaultMeasurement = bundle.measurements[0];
    if (!defaultMeasurement) return;
    const resolvedMeasurement =
      bundle.measurements.find((m) => m.id === initialMeasurementId) ?? defaultMeasurement;
    setMeasurementId(resolvedMeasurement.id);
    setQuantity(initialQuantity ?? String(resolvedMeasurement.defaultQuantity));
  }, [food.id, curated?.id, initialMeasurementId, initialQuantity, bundle.measurements]);

  function selectMeasurement(m: FoodMeasurement) {
    setMeasurementId(m.id);
    setQuantity(String(m.defaultQuantity));
  }

  function handleLog() {
    if (!measurement || !parseQuantityInput(quantity)) return;
    onLog({
      macros,
      servingLabel: pickerServingLabel(measurement, quantityNum, bundle.fixedLabels),
    });
  }

  const canSave = Boolean(measurement && parseQuantityInput(quantity));

  function handleSaveToMyFoods() {
    if (!measurement || !parseQuantityInput(quantity) || !onSaveToMyFoods) return;
    onSaveToMyFoods({
      macros,
      servingLabel: pickerServingLabel(measurement, quantityNum, bundle.fixedLabels),
    });
  }
  const canLog = Boolean(
    measurement &&
      parseQuantityInput(quantity) &&
      (isMealIngredient || editing || !dayLogAtCapacity),
  );

  return (
    <View testID="serving-picker" style={{ flex: 1 }}>
      <ScrollView
        className="flex-1 px-screen-x"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: bottomActionPadding + 72 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-5">
          <View className="flex-row items-center gap-3">
            <Text
              className="min-w-0 flex-1 text-[20px] font-bold leading-7 tracking-tight"
              style={{ color: colors.textPrimary }}
            >
              {displayFoodName(food.name, food.source)}
            </Text>
            {!isMealIngredient && onSaveToMyFoods ? (
              <Pressable
                testID="serving-picker-save-my-foods"
                onPress={handleSaveToMyFoods}
                disabled={!canSave}
                accessibilityRole="button"
                accessibilityLabel="Save to My foods"
                hitSlop={10}
                className="shrink-0 p-0.5"
                style={{ opacity: canSave ? 1 : 0.35 }}
              >
                <IconBookmark size={22} strokeWidth={1.75} color={colors.textPrimary} />
              </Pressable>
            ) : null}
          </View>
          {food.brand ? (
            <Text className="mt-1.5 text-[13px] font-medium" style={{ color: colors.textSecondary }}>
              {food.brand}
            </Text>
          ) : null}
        </View>

        <View
          className="rounded-[14px] border p-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Text
            className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            Unit
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist">
            <View className="flex-row gap-1 rounded-xl p-1" style={{ backgroundColor: colors.backgroundSecondary }}>
              {bundle.measurements.map((m) => {
                const active = measurement?.id === m.id;
                return (
                  <Pressable
                    key={m.id}
                    testID={`serving-unit-${m.id}`}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    onPress={() => selectMeasurement(m)}
                    className="rounded-lg px-3.5 py-2"
                    style={{
                      backgroundColor: active ? colors.card : "transparent",
                      borderWidth: active ? 1 : 0,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      className="text-[13px] font-semibold"
                      style={{ color: active ? colors.textPrimary : colors.textSecondary }}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <Text
          className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: colors.textTertiary }}
        >
          Number of servings
        </Text>
        <View
          className="flex-row items-center gap-2.5 rounded-[14px] border px-4 py-3.5"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <AppTextField
            inline
            value={quantity}
            onChangeText={(raw) => setQuantity(clampServingQuantityInput(raw))}
            accessibilityLabel="Number of servings"
            keyboardType="decimal-pad"
            style={{ flex: 1, fontSize: 15, fontWeight: "500", fontVariant: ["tabular-nums"] }}
          />
          {measurement?.unitSuffix ? (
            <Text className="text-[13px] font-semibold tabular-nums" style={{ color: colors.textSecondary }}>
              {measurement.unitSuffix}
            </Text>
          ) : null}
        </View>

        <Text
          className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: colors.textTertiary }}
        >
          This serving
        </Text>
        <View
          className="rounded-[14px] border px-5 py-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Text className="text-[32px] font-bold tabular-nums" style={{ color: colors.textPrimary }}>
            {macros.cal}
            <Text className="text-base font-medium" style={{ color: colors.textSecondary }}>
              {" "}
              cal
            </Text>
          </Text>
        </View>
        <View className="mt-2 flex-row gap-2">
          {(
            [
              { label: "Protein", value: macros.p, color: MACRO_COLORS.protein },
              { label: "Carbs", value: macros.c, color: MACRO_COLORS.carbs },
              { label: "Fat", value: macros.f, color: MACRO_COLORS.fat },
            ] as const
          ).map((macro) => (
            <View
              key={macro.label}
              className="min-w-0 flex-1 rounded-[14px] border px-3 py-3"
              style={{ borderColor: colors.border, backgroundColor: colors.card }}
            >
              <Text className="text-[10px] font-medium uppercase tracking-wide" style={{ color: macro.color }}>
                {macro.label}
              </Text>
              <Text className="mt-1.5 text-[17px] font-bold tabular-nums" style={{ color: macro.color }}>
                {formatMacroGrams(macro.value)}
                <Text className="text-xs font-medium" style={{ color: colors.textTertiary }}>
                  {" "}
                  g
                </Text>
              </Text>
            </View>
          ))}
        </View>

        {!isMealIngredient && !editing && dayLogAtCapacity ? (
          <Text className="mt-4 text-sm leading-5" style={{ color: "#ffb4b4" }}>
            Daily limit reached ({MAX_NUTRITION_ITEMS_PER_DAY} items). Remove a food log to add more.
          </Text>
        ) : null}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t px-screen-x pt-3"
        style={{
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          paddingBottom: bottomActionPadding,
        }}
      >
        <PrimaryButton
          block
          haptic={isMealIngredient}
          testID={isMealIngredient ? "serving-picker-add-ingredient" : "serving-picker-log-food"}
          onPress={handleLog}
          disabled={!canLog}
        >
          {primaryActionLabel}
        </PrimaryButton>
      </View>
    </View>
  );
}
