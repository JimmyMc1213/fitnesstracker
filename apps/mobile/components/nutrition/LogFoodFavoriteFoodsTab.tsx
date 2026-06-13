import { isNutritionFavorite } from "@newyouai/core";
import type { AppState, NutritionPreset, NutritionUserFood } from "@newyouai/types";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { FavoriteStarButton } from "@/components/nutrition/FavoriteStarButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { favoriteInputFromPreset, formatPresetSubtitle } from "@/lib/nutritionUserFoodHelpers";

type Props = {
  state: AppState;
  dayLogAtCapacity: boolean;
  onLogPreset: (preset: NutritionPreset) => void;
  onLogUserFood: (food: NutritionUserFood) => void;
  onToggleFavorite: (input: ReturnType<typeof favoriteInputFromPreset>) => void;
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

export function LogFoodFavoriteFoodsTab({
  state,
  dayLogAtCapacity,
  onLogPreset,
  onLogUserFood,
  onToggleFavorite,
}: Props) {
  const { colors } = useAppTheme();

  const favoritePresets = useMemo(
    () =>
      (state.nutritionPresets ?? [])
        .filter((p) => p.favoritedAtMs != null)
        .sort((a, b) => (b.favoritedAtMs ?? 0) - (a.favoritedAtMs ?? 0)),
    [state.nutritionPresets],
  );

  const favoriteUserFoods = useMemo(() => {
    const presets = state.nutritionPresets ?? [];
    return (state.nutritionUserFoods ?? []).filter((food) =>
      isNutritionFavorite(presets, food.name, {
        cal: Number(food.cal) || 0,
        p: Number(food.p) || 0,
        c: Number(food.c) || 0,
        f: Number(food.f) || 0,
      }),
    );
  }, [state.nutritionPresets, state.nutritionUserFoods]);

  const hasFavorites = favoritePresets.length > 0 || favoriteUserFoods.length > 0;

  if (!hasFavorites) {
    return (
      <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
        Tap the star on any food to save it here for one-tap logging.
      </Text>
    );
  }

  return (
    <FoodListCard>
      {favoritePresets.map((preset, idx) => {
        const favoriteInput = favoriteInputFromPreset(preset);
        const isLastPreset = idx === favoritePresets.length - 1 && favoriteUserFoods.length === 0;

        return (
          <View
            key={preset.id}
            className="flex-row items-center gap-1"
            style={{ borderBottomWidth: isLastPreset ? 0 : 1, borderBottomColor: colors.border }}
          >
            <View className="min-w-0 flex-1 py-3">
              <Text className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                {preset.name.trim() || "Food"}
              </Text>
              <Text className="mt-1 text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
                {formatPresetSubtitle(preset)}
              </Text>
            </View>
            <FavoriteStarButton
              testID={`favorite-star-${preset.id}`}
              active
              label={preset.name.trim() || "food"}
              onPress={() => onToggleFavorite(favoriteInput)}
            />
            <Pressable
              testID={`favorite-log-${preset.id}`}
              accessibilityLabel={`Log ${preset.name.trim() || "food"}`}
              onPress={() => onLogPreset(preset)}
              disabled={dayLogAtCapacity}
              className="h-9 w-9 items-center justify-center rounded-full border"
              style={{
                borderColor: colors.accent,
                backgroundColor: dayLogAtCapacity ? colors.border : colors.accent,
                opacity: dayLogAtCapacity ? 0.5 : 1,
              }}
            >
              <Text className="text-lg font-bold leading-none" style={{ color: colors.accentText }}>
                +
              </Text>
            </Pressable>
          </View>
        );
      })}

      {favoriteUserFoods.map((food, idx) => {
        const favoriteInput = {
          name: food.name,
          cal: Number(food.cal) || 0,
          p: Number(food.p) || 0,
          c: Number(food.c) || 0,
          f: Number(food.f) || 0,
          servingLabel: food.servingLabel?.trim(),
        };
        const isLast = idx === favoriteUserFoods.length - 1;

        return (
          <View
            key={`user-${food.id}`}
            className="flex-row items-center gap-1"
            style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border }}
          >
            <View className="min-w-0 flex-1 py-3">
              <Text className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                {food.name}
              </Text>
              <Text className="mt-1 text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
                {Math.round(Number(food.cal) || 0)} cal · {food.servingLabel?.trim() || "1 serving"}
              </Text>
            </View>
            <FavoriteStarButton
              testID={`favorite-user-star-${food.id}`}
              active
              label={food.name}
              onPress={() => onToggleFavorite(favoriteInput)}
            />
            <Pressable
              testID={`favorite-user-log-${food.id}`}
              accessibilityLabel={`Log ${food.name}`}
              onPress={() => onLogUserFood(food)}
              disabled={dayLogAtCapacity}
              className="h-9 w-9 items-center justify-center rounded-full border"
              style={{
                borderColor: colors.accent,
                backgroundColor: dayLogAtCapacity ? colors.border : colors.accent,
                opacity: dayLogAtCapacity ? 0.5 : 1,
              }}
            >
              <Text className="text-lg font-bold leading-none" style={{ color: colors.accentText }}>
                +
              </Text>
            </Pressable>
          </View>
        );
      })}
    </FoodListCard>
  );
}
