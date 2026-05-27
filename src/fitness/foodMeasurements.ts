import { scaleMacros } from "./foodSearchMacros";
import type { FoodMeasurement, FoodSearchResult } from "./foodSearchTypes";
import type { NutritionLoggedItem } from "./types";

export const OZ_TO_G = 28.3495;

const OZ_IN_LABEL = /(\d+(?:\.\d+)?)\s*oz\b/i;

export type ParsedServing = {
  quantity: number;
  unit: string;
  /** Gram weight of this serving when known; null for count/volume portions without conversion. */
  grams: number | null;
};

/** Parse labels like "100 g", "3.5 oz", "1 cup". */
export function parseServingLabel(label: string): ParsedServing | null {
  const trimmed = label.trim();
  const match = trimmed.match(/^([\d.]+)\s*(.+)$/i);
  if (!match) return null;
  const quantity = parseFloat(match[1]);
  const unit = match[2].trim().toLowerCase();
  if (!Number.isFinite(quantity) || quantity <= 0 || !unit) return null;
  const grams = gramsForUnit(quantity, unit);
  return { quantity, unit, grams };
}

function gramsForUnit(quantity: number, unit: string): number | null {
  if (unit === "g" || unit === "gram" || unit === "grams") return quantity;
  if (unit === "oz" || unit === "ounce" || unit === "ounces") return quantity * OZ_TO_G;
  return null;
}

function normalizeUnitLabel(unit: string): string {
  if (unit === "g" || unit === "gram" || unit === "grams") return "G";
  if (unit === "oz" || unit === "ounce" || unit === "ounces") return "Oz";
  return unit.charAt(0).toUpperCase() + unit.slice(1);
}

function unitSuffix(unit: string): string {
  if (unit === "g" || unit === "gram" || unit === "grams") return "g";
  if (unit === "oz" || unit === "ounce" || unit === "ounces") return "oz";
  return unit;
}

function measurementId(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function addMeasurement(
  list: FoodMeasurement[],
  seen: Set<string>,
  m: FoodMeasurement,
): void {
  if (seen.has(m.id)) return;
  seen.add(m.id);
  list.push(m);
}

/** Build selectable measurement units for a food row. */
export function buildMeasurements(food: FoodSearchResult): FoodMeasurement[] {
  const list: FoodMeasurement[] = [];
  const seen = new Set<string>();

  const parsed = parseServingLabel(food.defaultServing);
  const baseGrams =
    food.baseGrams ??
    (parsed?.grams && parsed.grams > 0 ? parsed.grams : 100);

  addMeasurement(list, seen, {
    id: "g",
    label: "G",
    unitSuffix: "g",
    gramsPerUnit: 1,
    defaultQuantity: baseGrams,
  });

  addMeasurement(list, seen, {
    id: "oz",
    label: "Oz",
    unitSuffix: "oz",
    gramsPerUnit: OZ_TO_G,
    defaultQuantity: Math.round((baseGrams / OZ_TO_G) * 10) / 10,
  });

  if (parsed && parsed.unit !== "g" && parsed.unit !== "gram" && parsed.unit !== "grams" && parsed.unit !== "oz" && parsed.unit !== "ounce" && parsed.unit !== "ounces") {
    addMeasurement(list, seen, {
      id: measurementId(normalizeUnitLabel(parsed.unit)),
      label: normalizeUnitLabel(parsed.unit),
      unitSuffix: unitSuffix(parsed.unit),
      gramsPerUnit: baseGrams / parsed.quantity,
      defaultQuantity: parsed.quantity,
    });
  }

  for (const extra of food.portionLabels ?? []) {
    const text = extra.trim();
    if (!text) continue;
    const portionParsed = parseServingLabel(text);
    const label = portionParsed
      ? normalizeUnitLabel(portionParsed.unit)
      : text.charAt(0).toUpperCase() + text.slice(1);
    addMeasurement(list, seen, {
      id: measurementId(label),
      label,
      unitSuffix: portionParsed ? unitSuffix(portionParsed.unit) : "",
      gramsPerUnit: portionParsed?.grams && portionParsed.grams > 0 ? portionParsed.grams / portionParsed.quantity : baseGrams,
      defaultQuantity: portionParsed?.quantity ?? 1,
    });
  }

  return list;
}

/** Pick g, oz, or count-style units from a human serving label and total gram weight. */
export function inferMeasurementFromServing(
  id: string,
  displayLabel: string,
  totalGrams: number,
  parseLabel?: string,
): FoodMeasurement {
  const trimmed = (parseLabel ?? displayLabel).trim();

  const parsed = parseServingLabel(trimmed);
  if (parsed) {
    if (parsed.unit === "g" || parsed.unit === "gram" || parsed.unit === "grams") {
      return {
        id,
        label: displayLabel,
        unitSuffix: "g",
        gramsPerUnit: 1,
        defaultQuantity: parsed.grams ?? totalGrams,
      };
    }
    if (parsed.unit === "oz" || parsed.unit === "ounce" || parsed.unit === "ounces") {
      return {
        id,
        label: displayLabel,
        unitSuffix: "oz",
        gramsPerUnit: OZ_TO_G,
        defaultQuantity: parsed.quantity,
      };
    }
    return {
      id,
      label: displayLabel,
      unitSuffix: "",
      gramsPerUnit: totalGrams / parsed.quantity,
      defaultQuantity: parsed.quantity,
    };
  }

  const ozMatch = trimmed.match(OZ_IN_LABEL);
  if (ozMatch) {
    const ozQty = parseFloat(ozMatch[1]);
    if (Number.isFinite(ozQty) && ozQty > 0) {
      return {
        id,
        label: displayLabel,
        unitSuffix: "oz",
        gramsPerUnit: OZ_TO_G,
        defaultQuantity: ozQty,
      };
    }
  }

  return {
    id,
    label: displayLabel,
    unitSuffix: "g",
    gramsPerUnit: 1,
    defaultQuantity: totalGrams,
  };
}

export function getBaseGrams(food: FoodSearchResult): number {
  const parsed = parseServingLabel(food.defaultServing);
  return food.baseGrams ?? (parsed?.grams && parsed.grams > 0 ? parsed.grams : 100);
}

export function computeServingMultiplier(
  measurement: FoodMeasurement,
  quantity: number,
  baseGrams: number,
): number {
  const q = Number.isFinite(quantity) && quantity > 0 ? quantity : measurement.defaultQuantity;
  const userGrams = q * measurement.gramsPerUnit;
  if (!Number.isFinite(userGrams) || userGrams <= 0 || baseGrams <= 0) return 1;
  return userGrams / baseGrams;
}

export function formatServingLabel(measurement: FoodMeasurement, quantity: number): string {
  const q = Number.isFinite(quantity) && quantity > 0 ? quantity : measurement.defaultQuantity;
  const rounded = Number.isInteger(q) ? String(q) : String(Math.round(q * 10) / 10);
  if (measurement.unitSuffix) return `${rounded} ${measurement.unitSuffix}`;
  return `${rounded} ${measurement.label.toLowerCase()}`;
}

export function parseQuantityInput(raw: string): number | null {
  const n = parseFloat(raw.trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

function isGramOrOzUnit(unit: string): boolean {
  return (
    unit === "g" ||
    unit === "gram" ||
    unit === "grams" ||
    unit === "oz" ||
    unit === "ounce" ||
    unit === "ounces"
  );
}

/** Reconstruct picker state when editing a catalog-logged food row. */
export function loggedItemToPickerEdit(item: NutritionLoggedItem): {
  food: FoodSearchResult;
  measurementId: string;
  quantity: string;
} | null {
  const externalId = item.externalId?.trim();
  if (!externalId) return null;

  const baseGrams = 100;
  const servingLabel = item.servingLabel?.trim() || `${baseGrams} g`;
  const parsed = parseServingLabel(servingLabel);

  let userGrams = baseGrams;
  if (parsed?.grams && parsed.grams > 0) {
    userGrams = parsed.grams;
  }

  const multiplier = userGrams / baseGrams;
  const baseMacros = scaleMacros(item, multiplier > 0 ? 1 / multiplier : 1);

  const food: FoodSearchResult = {
    id: externalId,
    name: item.name.trim() || "Food",
    ...baseMacros,
    defaultServing: `${baseGrams} g`,
    baseGrams,
    portionLabels: parsed && !isGramOrOzUnit(parsed.unit) ? [servingLabel] : [],
    source: item.source?.trim() || "usda",
    externalId,
    servings: [],
  };

  const measurements = buildMeasurements(food);
  if (measurements.length === 0) return null;

  let measurementId = "g";
  let quantity = String(baseGrams);

  if (parsed) {
    quantity = String(parsed.quantity);
    if (parsed.unit === "g" || parsed.unit === "gram" || parsed.unit === "grams") {
      measurementId = "g";
    } else if (parsed.unit === "oz" || parsed.unit === "ounce" || parsed.unit === "ounces") {
      measurementId = "oz";
    } else {
      const custom = measurements.find((m) => m.id !== "g" && m.id !== "oz");
      if (custom) measurementId = custom.id;
    }
  }

  const matched = measurements.find((m) => m.id === measurementId) ?? measurements[0];

  return {
    food,
    measurementId: matched.id,
    quantity: parsed ? quantity : String(matched.defaultQuantity),
  };
}
