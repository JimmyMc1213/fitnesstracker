import type { FoodMeasurement, FoodSearchResult } from "./foodSearchTypes";

const OZ_TO_G = 28.3495;

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
