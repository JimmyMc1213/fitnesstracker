/** Default breathing room (px) kept between the focused field and the keypad top. */
export const WORKOUT_FIELD_SCROLL_MARGIN = 20;

/**
 * How far (px) the exercise list must scroll DOWN so the focused set field sits
 * above the custom keypad. Returns 0 when the field is already fully visible.
 *
 * The header (title + coach card) lives above the list and never scrolls, so a
 * tapped field can only ever be hidden *behind the keypad* — never above the
 * fold. That means we only scroll down, and never yank the list back up.
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
