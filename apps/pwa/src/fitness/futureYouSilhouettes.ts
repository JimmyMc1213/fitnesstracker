import femaleAfterSrc from "../assets/future-you/silhouettes-female-after.png";
import femaleBeforeSrc from "../assets/future-you/silhouettes-female-before.png";
import maleAfterSrc from "../assets/future-you/silhouettes-male-after.png";
import maleBeforeSrc from "../assets/future-you/silhouettes-male-before.png";
import type { UserGender } from "./types";

export type FutureYouSilhouetteSet = {
  before: string;
  after: string;
};

const FEMALE_SILHOUETTES: FutureYouSilhouetteSet = {
  before: femaleBeforeSrc,
  after: femaleAfterSrc,
};

const MALE_SILHOUETTES: FutureYouSilhouetteSet = {
  before: maleBeforeSrc,
  after: maleAfterSrc,
};

/** Placeholder silhouettes for step 10b, keyed by onboarding gender. */
export function futureYouSilhouettesForGender(gender: UserGender | undefined): FutureYouSilhouetteSet | null {
  if (gender === "male") return MALE_SILHOUETTES;
  if (gender === "female" || gender === "other") return FEMALE_SILHOUETTES;
  return FEMALE_SILHOUETTES;
}
