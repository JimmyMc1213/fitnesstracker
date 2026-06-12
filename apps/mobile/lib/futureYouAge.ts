/** Future You photo upload is 18+ only; 13–17 see blocked UI on step 10b. */
export function isFutureYouPhotoBlocked(age: number | null | undefined): boolean {
  return age != null && age >= 13 && age < 18;
}

export function isFutureYouPhotoEligible(age: number | null | undefined): boolean {
  return age != null && age >= 18;
}
