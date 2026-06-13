import type { UserGender } from "@newyouai/types";

export type FutureYouSilhouetteGenderKey = "male" | "female";

/** Gender key for silhouette asset sets (male vs female/other). */
export function futureYouSilhouetteGenderKey(gender: UserGender | undefined): FutureYouSilhouetteGenderKey {
  if (gender === "male") return "male";
  return "female";
}
