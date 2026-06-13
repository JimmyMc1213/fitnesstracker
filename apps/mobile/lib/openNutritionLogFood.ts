import { router } from "expo-router";

/** Navigate to Nutrition tab and open the Log Food modal (PWA openLogFood parity). */
export function openNutritionLogFood(): void {
  router.push({
    pathname: "/(tabs)/nutrition",
    params: { openLogFood: "1" },
  });
}
