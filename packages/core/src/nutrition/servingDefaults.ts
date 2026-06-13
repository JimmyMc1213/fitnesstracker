export const SERVING_DEFAULTS: Record<string, { label: string; grams: number }> = {
  egg: { label: "1 large egg", grams: 50 },
  "chicken breast": { label: "1 breast, cooked (~8oz)", grams: 226 },
  "ground beef": { label: "4oz (113g)", grams: 113 },
  salmon: { label: "1 fillet (6oz)", grams: 170 },
  tuna: { label: "1 can drained (5oz)", grams: 142 },
  banana: { label: "1 medium banana", grams: 118 },
  apple: { label: "1 medium apple", grams: 182 },
  "white rice": { label: "1 cup cooked", grams: 186 },
  "brown rice": { label: "1 cup cooked", grams: 202 },
  oats: { label: "1 cup dry", grams: 81 },
  bread: { label: "1 slice", grams: 28 },
  butter: { label: "1 tbsp", grams: 14 },
  "olive oil": { label: "1 tbsp", grams: 14 },
  milk: { label: "1 cup (8oz)", grams: 244 },
  "greek yogurt": { label: "1 container (5.3oz)", grams: 150 },
  "cottage cheese": { label: "½ cup", grams: 113 },
  "protein powder": { label: "1 scoop (~30g)", grams: 30 },
};

export function getServingDefault(foodDescription: string) {
  const desc = foodDescription.toLowerCase();
  const match = Object.keys(SERVING_DEFAULTS).find((key) => desc.includes(key));
  return match ? SERVING_DEFAULTS[match] : null;
}
