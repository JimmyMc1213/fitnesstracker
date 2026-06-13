import type { UserGender } from "@newyouai/types";

import { futureYouSilhouetteGenderKey, type FutureYouSilhouetteGenderKey } from "./silhouettes";

/** Gender key for the reveal placeholder silhouette when no signed URL is available. */
export function futureYouRevealPlaceholderGenderKey(
  gender: UserGender | undefined,
): FutureYouSilhouetteGenderKey {
  return futureYouSilhouetteGenderKey(gender);
}
