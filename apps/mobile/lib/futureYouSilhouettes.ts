import type { ImageSourcePropType } from "react-native";

import { futureYouSilhouetteGenderKey } from "@newyouai/core";
import type { UserGender } from "@newyouai/types";

export type FutureYouSilhouetteSet = {
  before: ImageSourcePropType;
  after: ImageSourcePropType;
};

const FEMALE_SILHOUETTES: FutureYouSilhouetteSet = {
  before: require("../assets/future-you/silhouettes-female-before.png"),
  after: require("../assets/future-you/silhouettes-female-after.png"),
};

const MALE_SILHOUETTES: FutureYouSilhouetteSet = {
  before: require("../assets/future-you/silhouettes-male-before.png"),
  after: require("../assets/future-you/silhouettes-male-after.png"),
};

const SILHOUETTES_BY_KEY = {
  female: FEMALE_SILHOUETTES,
  male: MALE_SILHOUETTES,
} as const;

/** Placeholder silhouettes for gallery/detail, keyed by onboarding gender. */
export function futureYouSilhouettesForGender(gender: UserGender | undefined): FutureYouSilhouetteSet | null {
  const key = futureYouSilhouetteGenderKey(gender);
  return SILHOUETTES_BY_KEY[key];
}
