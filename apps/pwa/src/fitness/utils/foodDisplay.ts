export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatServing(grams: number): string {
  const rounded = Math.round(grams * 10) / 10;
  return rounded % 1 === 0 ? `${Math.round(grams)}g` : `${rounded}g`;
}

/** Gram macros: one decimal below 1g, whole grams otherwise. */
export function formatMacroGrams(grams: number): string {
  const n = Number(grams) || 0;
  if (n < 1) {
    return String(Math.round(n * 10) / 10);
  }
  return String(Math.round(n));
}
