export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatServing(grams: number): string {
  const rounded = Math.round(grams * 10) / 10;
  return rounded % 1 === 0 ? `${Math.round(grams)}g` : `${rounded}g`;
}

export function formatMacroGrams(grams: number): string {
  const n = Number(grams) || 0;
  if (n < 1) {
    return String(Math.round(n * 10) / 10);
  }
  return String(Math.round(n));
}

function isCatalogFoodSource(source?: string): boolean {
  const s = source?.trim().toLowerCase();
  return s === "usda" || s === "off" || s === "curated";
}

export function displayFoodName(name: string, source?: string): string {
  const trimmed = name.trim() || "Food";
  return isCatalogFoodSource(source) ? toTitleCase(trimmed) : trimmed;
}

export function formatGramsInLabel(label: string): string {
  return label.replace(/([\d.]+)\s*g\b/gi, (_, numStr) => {
    const grams = parseFloat(numStr);
    return Number.isFinite(grams) ? formatServing(grams) : `${numStr}g`;
  });
}
