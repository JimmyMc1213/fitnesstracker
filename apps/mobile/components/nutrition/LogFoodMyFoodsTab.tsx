import { isNutritionFavorite } from "@newyouai/core";
import type { AppState, FoodSearchResult, NutritionUserFood } from "@newyouai/types";
import { Pressable, Text, View } from "react-native";

import { FavoriteStarButton } from "@/components/nutrition/FavoriteStarButton";
import { NutritionDeleteConfirmSheet } from "@/components/nutrition/NutritionDeleteConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { CuratedFood } from "@/lib/curatedFoods";
import {
  favoriteInputFromUserFood,
  formatUserFoodSubtitle,
  resolveCuratedForUserFood,
  userFoodToSearchResult,
} from "@/lib/nutritionUserFoodHelpers";

type Props = {
  state: AppState;
  dayLogAtCapacity: boolean;
  onOpenPicker: (food: FoodSearchResult, curated?: CuratedFood) => void;
  onDirectLog: (food: NutritionUserFood) => void;
  onToggleFavorite: (input: ReturnType<typeof favoriteInputFromUserFood>) => void;
  onRequestDelete: (food: NutritionUserFood) => void;
  onEditFood: (food: NutritionUserFood) => void;
  pendingDelete: NutritionUserFood | null;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
};

function FoodListCard({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View
      className="overflow-hidden rounded-[14px] border px-3.5 py-1"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      {children}
    </View>
  );
}

export function LogFoodMyFoodsTab({
  state,
  dayLogAtCapacity,
  onOpenPicker,
  onDirectLog,
  onToggleFavorite,
  onRequestDelete,
  onEditFood,
  pendingDelete,
  onCancelDelete,
  onConfirmDelete,
}: Props) {
  const { colors } = useAppTheme();
  const userFoods = state.nutritionUserFoods ?? [];

  function handleTapFood(food: NutritionUserFood) {
    if (dayLogAtCapacity) return;
    const curated = resolveCuratedForUserFood(food);
    const hasPickerSource = food.source === "curated" || food.source === "usda" || food.source === "off";
    if (hasPickerSource) {
      onOpenPicker(userFoodToSearchResult(food), curated);
      return;
    }
    onDirectLog(food);
  }

  if (userFoods.length === 0) {
    return (
      <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
        No saved foods yet. Manual Add or search and tap Save to My foods.
      </Text>
    );
  }

  return (
    <>
      <FoodListCard>
        {userFoods.map((food, idx) => {
          const favoriteInput = favoriteInputFromUserFood(food);
          const isFavorite = isNutritionFavorite(state.nutritionPresets ?? [], food.name, favoriteInput);
          const isLast = idx === userFoods.length - 1;

          return (
            <View
              key={food.id}
              className="flex-row items-center gap-1"
              style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border }}
            >
              <Pressable
                testID={`my-food-row-${food.id}`}
                onPress={() => handleTapFood(food)}
                disabled={dayLogAtCapacity}
                className="min-w-0 flex-1 flex-row items-center py-3"
                style={{ opacity: dayLogAtCapacity ? 0.5 : 1 }}
              >
                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                    {food.name}
                  </Text>
                  <Text className="mt-1 text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
                    {formatUserFoodSubtitle(food)}
                  </Text>
                </View>
                <Text className="text-lg" style={{ color: colors.textTertiary }}>
                  ›
                </Text>
              </Pressable>
              <FavoriteStarButton
                testID={`my-food-favorite-${food.id}`}
                active={isFavorite}
                label={food.name}
                onPress={() => onToggleFavorite(favoriteInput)}
              />
              <Pressable
                testID={`my-food-edit-${food.id}`}
                onPress={() => onEditFood(food)}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${food.name}`}
                className="px-2 py-2"
              >
                <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
                  Edit
                </Text>
              </Pressable>
              <Pressable
                testID={`my-food-delete-${food.id}`}
                onPress={() => onRequestDelete(food)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${food.name}`}
                className="px-2 py-2"
              >
                <Text className="text-[13px] font-semibold" style={{ color: "#ffb4b4" }}>
                  Delete
                </Text>
              </Pressable>
            </View>
          );
        })}
      </FoodListCard>

      {pendingDelete ? (
        <NutritionDeleteConfirmSheet
          title="Delete saved food?"
          message={`Remove ${pendingDelete.name} from My foods? Past logs will stay in your history.`}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      ) : null}
    </>
  );
}
