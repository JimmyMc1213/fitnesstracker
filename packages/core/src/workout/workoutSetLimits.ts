/** Max sets the app programs for an exercise (onboarding, plan builder, starter defaults). */
export const PROGRAMMED_MAX_SETS = 4;

/** Preferred programmed set count; use four only when session volume requires it. */
export const PREFERRED_PROGRAMMED_SETS = 3;

/** Max sets a user can set while editing a routine (live sessions can add more). */
export const USER_EDITABLE_MAX_SETS = 12;

export function clampProgrammedSetCount(setCount: number): number {
  return Math.min(Math.max(setCount, 1), PROGRAMMED_MAX_SETS);
}

export function clampUserEditableSetCount(setCount: number): number {
  return Math.min(Math.max(setCount, 1), USER_EDITABLE_MAX_SETS);
}
