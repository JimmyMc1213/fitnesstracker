import { router } from "expo-router";

/** Navigate to the Log Food page (PWA openLogFood parity). */
export function openNutritionLogFood(): void {
  router.push("/log-food");
}
