import type { WeightDeltaSentiment } from "@newyouai/core";
import type { ThemeColorTokens } from "@newyouai/config/tokens";

const WEIGHT_DELTA_POS = "#4ade80";
const WEIGHT_DELTA_NEG = "#f87171";
const WEIGHT_DELTA_CAUTION = "#fbbf24";

export function deltaColorForTheme(
  sentiment: WeightDeltaSentiment,
  colors: ThemeColorTokens,
): string {
  switch (sentiment) {
    case "positive":
      return WEIGHT_DELTA_POS;
    case "negative":
      return WEIGHT_DELTA_NEG;
    case "caution":
      return WEIGHT_DELTA_CAUTION;
    default:
      return colors.textTertiary;
  }
}
