/** Public citations for in-app calorie/macro recommendations (Apple 1.4.1). */

export type NutritionSource = {
  id: string;
  label: string;
  detail: string;
  url: string;
};

export const NUTRITION_SOURCES: NutritionSource[] = [
  {
    id: "mifflin-st-jeor",
    label: "Mifflin–St Jeor equation",
    detail: "Resting energy expenditure (BMR) estimate used for daily calorie targets.",
    url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
  },
  {
    id: "activity-multipliers",
    label: "Activity multipliers",
    detail: "Standard TDEE multipliers applied to BMR based on your selected activity level.",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK278991/",
  },
  {
    id: "protein-issn",
    label: "Protein guidance",
    detail:
      "Protein targets use a fitness heuristic (~0.85–1.0 g per lb, with caps) informed by ISSN active-adult guidance.",
    url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8",
  },
];

export function nutritionSourceById(id: NutritionSource["id"]): NutritionSource | undefined {
  return NUTRITION_SOURCES.find((source) => source.id === id);
}
