import { futureYouSilhouettesForGender } from "./futureYouSilhouettes";
import type { UserGender } from "./types";

/** Dev / fallback image when signed result URL is unavailable (pre–step 30 entitlement). */
export function futureYouRevealPlaceholderImage(gender: UserGender | undefined): string | null {
  return futureYouSilhouettesForGender(gender)?.after ?? null;
}
