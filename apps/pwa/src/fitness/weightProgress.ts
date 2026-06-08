import type { NutritionGoal } from "./types";

export type WeightDeltaSentiment = "positive" | "negative" | "neutral" | "caution";

/** ±2 lb band for maintain goal — within is on-track (green). */
export const MAINTAIN_WEIGHT_BAND_LBS = 2;

export const WEIGHT_DELTA_POS_COLOR = "#4ade80";
export const WEIGHT_DELTA_NEG_COLOR = "var(--neg)";
export const WEIGHT_DELTA_CAUTION_COLOR = "#fbbf24";

export function weightDeltaSentiment(goal: NutritionGoal, deltaLbs: number): WeightDeltaSentiment {
  if (goal === "cut") {
    if (deltaLbs < 0) return "positive";
    if (deltaLbs > 0) return "negative";
    return "positive";
  }
  if (goal === "bulk") {
    if (deltaLbs > 0) return "positive";
    if (deltaLbs < 0) return "negative";
    return "positive";
  }
  if (Math.abs(deltaLbs) <= MAINTAIN_WEIGHT_BAND_LBS) return "positive";
  return "caution";
}

export function deltaColorForSentiment(sentiment: WeightDeltaSentiment): string {
  switch (sentiment) {
    case "positive":
      return WEIGHT_DELTA_POS_COLOR;
    case "negative":
      return WEIGHT_DELTA_NEG_COLOR;
    case "caution":
      return WEIGHT_DELTA_CAUTION_COLOR;
    default:
      return "var(--text-ghost)";
  }
}
