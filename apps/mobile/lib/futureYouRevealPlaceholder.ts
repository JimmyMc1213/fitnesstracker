import type { ImageSourcePropType } from "react-native";

import type { UserGender } from "@newyouai/types";

import { futureYouSilhouettesForGender } from "./futureYouSilhouettes";

/** Dev / fallback image when signed result URL is unavailable. */
export function futureYouRevealPlaceholderSource(gender: UserGender | undefined): ImageSourcePropType | null {
  return futureYouSilhouettesForGender(gender)?.after ?? null;
}
