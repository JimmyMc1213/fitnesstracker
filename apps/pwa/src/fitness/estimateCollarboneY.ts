/**
 * Estimates how many rows from the top must stay pixel-identical to the source.
 * Includes face, hair, neck, and shoulders/upper shirt — not just the chin.
 */
export function estimateCollarboneY(height: number, width: number): number {
  if (height <= 0 || width <= 0) return 0;

  const aspect = height / width;
  if (aspect >= 1.85) return Math.round(height * 0.2);
  if (aspect >= 1.45) return Math.round(height * 0.26);
  if (aspect >= 1.2) return Math.round(height * 0.34);
  return Math.round(height * 0.4);
}

export function identityFeatherPx(height: number): number {
  return Math.max(6, Math.round(height * 0.025));
}
