import { formatMealServingLabel, sumMealMacros } from "@newyouai/core";
import type { AppState, NutritionMeal } from "@newyouai/types";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { NutritionDeleteConfirmSheet } from "@/components/nutrition/NutritionDeleteConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  state: AppState;
  dayLogAtCapacity: boolean;
  onLogMeal: (meal: NutritionMeal) => void;
  onEditMeal: (meal: NutritionMeal) => void;
  pendingDelete: NutritionMeal | null;
  onRequestDelete: (meal: NutritionMeal) => void;
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

export function LogFoodMyMealsTab({
  state,
  dayLogAtCapacity,
  onLogMeal,
  onEditMeal,
  pendingDelete,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: Props) {
  const { colors } = useAppTheme();
  const savedMeals = state.nutritionMeals ?? [];

  if (savedMeals.length === 0) {
    return (
      <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
        Save meals you eat often (chicken and rice, overnight oats, whatever you prep). Log the whole
        meal in one tap instead of each ingredient.
      </Text>
    );
  }

  return (
    <>
      <FoodListCard>
        {savedMeals.map((meal, idx) => {
          const mealMacros = sumMealMacros(meal.items);
          const servingLabel = formatMealServingLabel(meal.items);
          const isLast = idx === savedMeals.length - 1;
          const calRounded = Math.round(mealMacros.cal);

          return (
            <View
              key={meal.id}
              className="flex-row items-center gap-1"
              style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border }}
            >
              <Pressable
                testID={`my-meal-row-${meal.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${meal.name} ${calRounded} cal`}
                haptic={false}
                onPress={() => onLogMeal(meal)}
                disabled={dayLogAtCapacity}
                className="min-w-0 flex-1 flex-row items-center py-3"
                style={{ opacity: dayLogAtCapacity ? 0.5 : 1 }}
              >
                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                    {meal.name}
                  </Text>
                  <Text className="mt-1 text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
                    {calRounded} cal · {Math.round(mealMacros.p)}g protein
                    {servingLabel ? ` · ${servingLabel}` : ""}
                  </Text>
                </View>
                <Text className="text-lg" style={{ color: colors.textTertiary }}>
                  ›
                </Text>
              </Pressable>
              <Pressable
                testID={`my-meal-edit-${meal.id}`}
                onPress={() => onEditMeal(meal)}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${meal.name}`}
                className="px-2 py-2"
              >
                <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
                  Edit
                </Text>
              </Pressable>
              <Pressable
                testID={`my-meal-delete-${meal.id}`}
                onPress={() => onRequestDelete(meal)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${meal.name}`}
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
          title="Delete meal?"
          message={`Remove ${pendingDelete.name.trim() || "this meal"} from My meals? Past logs will stay in your history.`}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      ) : null}
    </>
  );
}
