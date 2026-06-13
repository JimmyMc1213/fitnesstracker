import femaleAfterSrc from "../assets/future-you/silhouettes-female-after.png";
import femaleBeforeSrc from "../assets/future-you/silhouettes-female-before.png";
import maleAfterSrc from "../assets/future-you/silhouettes-male-after.png";
import maleBeforeSrc from "../assets/future-you/silhouettes-male-before.png";
import { futureYouSilhouetteGenderKey, type FutureYouSilhouetteGenderKey } from "@newyouai/core";

import type { UserGender } from "./types";

export type FutureYouSilhouetteSet = {
  before: string;
  after: string;
};

const SILHOUETTES_BY_KEY: Record<FutureYouSilhouetteGenderKey, FutureYouSilhouetteSet> = {
  female: {
    before: femaleBeforeSrc,
    after: femaleAfterSrc,
  },
  male: {
    before: maleBeforeSrc,
    after: maleAfterSrc,
  },
};

/** Placeholder silhouettes for step 10b, keyed by onboarding gender. */
export function futureYouSilhouettesForGender(gender: UserGender | undefined): FutureYouSilhouetteSet | null {
  const key = futureYouSilhouetteGenderKey(gender);
  return SILHOUETTES_BY_KEY[key];
}
