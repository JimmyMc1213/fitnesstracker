import { MAX_NUTRITION_ITEMS_PER_DAY } from "@newyouai/core";
import type { NutritionLoggedItem } from "@newyouai/types";
import { useRef } from "react";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { GradientCard } from "@/components/ui/GradientCard";
import { SwipeToDelete } from "@/components/SwipeToDelete";
import { useAppTheme } from "@/hooks/useAppTheme";
import { displayFoodName, formatGramsInLabel } from "@/lib/foodDisplay";

import { MACRO_COLORS } from "@/lib/macroColors";

type Props = {
  items: NutritionLoggedItem[];
  onRemove: (itemId: string) => void;
  onEdit: (item: NutritionLoggedItem) => void;
};

function formatLoggedTime(ms: number | undefined): string {
  const t = typeof ms === "number" && ms > 0 ? ms : Date.now();
  return new Date(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function FoodLogMacroLine({ item }: { item: NutritionLoggedItem }) {
  const { colors } = useAppTheme();
  const MACRO_LABEL_COLORS = {
    Protein: MACRO_COLORS.protein,
    Carbs: MACRO_COLORS.carbs,
    Fat: MACRO_COLORS.fat,
  } as const;
  const macros = [
    { key: "Protein" as const, letter: "P", grams: Math.round(Number(item.p) || 0) },
    { key: "Carbs" as const, letter: "C", grams: Math.round(Number(item.c) || 0) },
    { key: "Fat" as const, letter: "F", grams: Math.round(Number(item.f) || 0) },
  ];

  return (
    <View className="mt-1.5">
      <Text
        className="text-base font-semibold tabular-nums"
        style={{ color: colors.textSecondary }}
      >
        {Math.round(Number(item.cal) || 0)} cal
      </Text>
      <View className="mt-1 flex-row flex-wrap items-center">
        {macros.map((macro, idx) => (
          <View key={macro.key} className="flex-row items-center">
            {idx > 0 ? (
              <Text className="mx-1.5 text-xs" style={{ color: colors.textTertiary }}>
                ·
              </Text>
            ) : null}
            <Text className="text-xs font-medium tabular-nums" style={{ color: MACRO_LABEL_COLORS[macro.key] }}>
              {macro.letter} {macro.grams}g
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type SwipeableFoodLogRowProps = {
  item: NutritionLoggedItem;
  onEdit: (item: NutritionLoggedItem) => void;
  onRemove: () => void;
  showDivider: boolean;
};

function SwipeableFoodLogRow({ item, onEdit, onRemove, showDivider }: SwipeableFoodLogRowProps) {
  const { colors } = useAppTheme();
  const displayName = displayFoodName(item.name, item.source);
  const servingLabel = item.servingLabel?.trim();

  return (
    <View
      className="overflow-hidden"
      style={{
        paddingHorizontal: 16,
        paddingBottom: showDivider ? 12 : 0,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      <SwipeToDelete
        deleteLabel={`Delete ${displayName}`}
        onDelete={onRemove}
        testID={`today-food-log-delete-${item.id}`}
      >
        <Pressable
          onPress={() => onEdit(item)}
          className="py-3"
          accessibilityRole="button"
          accessibilityLabel={`Edit ${displayName}`}
          testID={`today-food-log-edit-${item.id}`}
        >
          <View className="flex-row items-start justify-between gap-2.5">
            <Text
              className="min-w-0 flex-1 text-sm font-semibold leading-5 tracking-tight"
              style={{ color: colors.textPrimary }}
              testID={`today-food-log-name-${item.id}`}
            >
              {displayName}
              {servingLabel ? (
                <Text className="font-medium" style={{ color: colors.textSecondary }}>
                  {" · "}
                  {formatGramsInLabel(servingLabel)}
                </Text>
              ) : null}
            </Text>
            <Text
              className="shrink-0 text-[11px] font-medium tabular-nums"
              style={{ color: colors.textTertiary }}
            >
              {formatLoggedTime(item.loggedAtMs)}
            </Text>
          </View>
          <FoodLogMacroLine item={item} />
        </Pressable>
      </SwipeToDelete>
    </View>
  );
}

export function TodayFoodLogCard({ items, onRemove, onEdit }: Props) {
  const { colors } = useAppTheme();
  const deleteLockRef = useRef(false);

  function handleRemove(itemId: string) {
    if (deleteLockRef.current) return;
    deleteLockRef.current = true;
    onRemove(itemId);
    setTimeout(() => {
      deleteLockRef.current = false;
    }, 1500);
  }

  const sorted = [...items].sort((a, b) => {
    const ta = typeof a.loggedAtMs === "number" ? a.loggedAtMs : 0;
    const tb = typeof b.loggedAtMs === "number" ? b.loggedAtMs : 0;
    return tb - ta;
  });

  const atDailyCap = sorted.length >= MAX_NUTRITION_ITEMS_PER_DAY;

  return (
    <View testID="today-food-log" className="mt-[18px]">
      <Text
        className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: colors.textSecondary }}
      >
        Recently logged
      </Text>

      {sorted.length === 0 ? (
        <View testID="today-food-log-empty">
          <Text className="text-sm leading-6" style={{ color: colors.textSecondary }}>
            No food logged yet today.
          </Text>
        </View>
      ) : (
        <>
          <GradientCard padding={0} testID="today-food-log-list">
            {sorted.map((item, idx) => (
              <SwipeableFoodLogRow
                key={item.id}
                item={item}
                onEdit={onEdit}
                onRemove={() => handleRemove(item.id)}
                showDivider={idx < sorted.length - 1}
              />
            ))}
          </GradientCard>
          {atDailyCap ? (
            <Text className="mt-2 text-xs font-medium leading-5" style={{ color: colors.textSecondary }}>
              Daily log limit reached ({MAX_NUTRITION_ITEMS_PER_DAY} items). Remove an entry to add more.
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}
