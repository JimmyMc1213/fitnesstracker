import {
  OZ_TO_G,
  buildMeasurements,
  computeServingMultiplier,
  formatServingLabel,
  getBaseGrams,
  getServingDefault,
  inferMeasurementFromServing,
  parseServingLabel,
} from "@newyouai/core";
import type { FoodMeasurement, FoodSearchResult } from "@newyouai/types";

import type { CuratedFood } from "@/lib/curatedFoods";
import { displayFoodName, formatGramsInLabel, formatServing } from "@/lib/foodDisplay";

const MAX_SERVING_DIGITS = 5;

export function clampServingQuantityInput(raw: string): string {
  let cleaned = "";
  let hasDot = false;
  let digitCount = 0;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      if (digitCount >= MAX_SERVING_DIGITS) continue;
      cleaned += ch;
      digitCount += 1;
    } else if (ch === "." && !hasDot) {
      hasDot = true;
      cleaned += ch;
    }
  }
  return cleaned;
}

function shortenPickerLabel(label: string, max = 22): string {
  const trimmed = label.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function buildPickerMeasurements(
  food: FoodSearchResult,
  curated?: CuratedFood,
): {
  measurements: FoodMeasurement[];
  fixedLabels: Record<string, string>;
} {
  const fixedLabels: Record<string, string> = {};
  const list: FoodMeasurement[] = [];
  const seen = new Set<string>();
  const baseGrams = getBaseGrams(food);

  const add = (m: FoodMeasurement) => {
    if (seen.has(m.id)) return;
    seen.add(m.id);
    list.push(m);
  };

  const smart = curated
    ? { label: curated.defaultServing.label, grams: curated.defaultServing.grams }
    : getServingDefault(food.name);

  if (smart) {
    fixedLabels["smart-default"] = smart.label;
    add(
      inferMeasurementFromServing(
        "smart-default",
        shortenPickerLabel(smart.label),
        smart.grams,
        smart.label,
      ),
    );
  } else {
    const parsed = parseServingLabel(food.defaultServing);
    const grams = parsed?.grams && parsed.grams > 0 ? parsed.grams : baseGrams;
    const displayLabel = food.defaultServing.trim()
      ? formatGramsInLabel(food.defaultServing.trim())
      : formatServing(grams);
    fixedLabels["primary-serving"] = displayLabel;
    add(
      inferMeasurementFromServing(
        "primary-serving",
        shortenPickerLabel(displayLabel),
        grams,
        displayLabel,
      ),
    );
  }

  const hideHundredGramPreset =
    food.source === "off" && baseGrams > 0 && Math.round(baseGrams) !== 100;
  if (!hideHundredGramPreset) {
    add({
      id: "100g",
      label: "100g",
      unitSuffix: "g",
      gramsPerUnit: 1,
      defaultQuantity: 100,
    });
  }

  add({
    id: "oz",
    label: "Oz",
    unitSuffix: "oz",
    gramsPerUnit: OZ_TO_G,
    defaultQuantity: Math.round((baseGrams / OZ_TO_G) * 10) / 10,
  });

  if (!curated) {
    for (const m of buildMeasurements(food)) {
      if (m.id === "g") continue;
      add(m);
    }
  }

  return { measurements: list, fixedLabels };
}

export function pickerServingLabel(
  measurement: FoodMeasurement,
  quantity: number,
  fixedLabels: Record<string, string>,
): string {
  const fixed = fixedLabels[measurement.id];
  if (fixed) {
    const q = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    if (q === 1) return fixed;
    const qStr = Number.isInteger(q) ? String(q) : String(Math.round(q * 10) / 10);
    return `${qStr} × ${fixed}`;
  }
  return formatServingLabel(measurement, quantity);
}

export { computeServingMultiplier, getBaseGrams, displayFoodName };
