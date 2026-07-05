/** Default breathing room (px) kept between the focused field and the keypad top. */
export const WORKOUT_FIELD_SCROLL_MARGIN = 20;

/**
 * How far (px) the exercise list must scroll DOWN so the focused set field sits
 * above the custom keypad. Returns 0 when the field is already fully visible.
 *
 * The session header stays fixed above the list. Coach notes and exercises scroll
 * together in the list. A tapped field can only be hidden behind the keypad, so
 * we only scroll down, and never yank the list back up.
 */
export function workoutFieldScrollDelta({
  fieldBottom,
  keypadTop,
  margin = WORKOUT_FIELD_SCROLL_MARGIN,
}: {
  fieldBottom: number;
  keypadTop: number;
  margin?: number;
}): number {
  const overlap = fieldBottom + margin - keypadTop;
  return overlap > 0 ? overlap : 0;
}
