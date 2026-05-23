import type { NutritionGoal } from "./types";

export type WeightDeltaSentiment = "positive" | "negative" | "neutral" | "caution";

export function weightDeltaSentiment(goal: NutritionGoal, deltaLbs: number): WeightDeltaSentiment {
  if (goal === "cut") {
    if (deltaLbs <= 0) return "positive";
    return "negative";
  }
  if (goal === "bulk") {
    if (deltaLbs >= 0) return "positive";
    return "negative";
  }
  if (Math.abs(deltaLbs) <= 1) return "neutral";
  return "caution";
}

export function deltaColorForSentiment(sentiment: WeightDeltaSentiment): string {
  switch (sentiment) {
    case "positive":
      return "var(--pos)";
    case "negative":
      return "var(--neg)";
    case "caution":
      return "#fbbf24";
    default:
      return "rgba(255,255,255,0.45)";
  }
}
