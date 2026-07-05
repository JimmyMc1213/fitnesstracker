import { Dimensions } from "react-native";

import type { WorkoutKeypadTarget } from "@/lib/workout/workoutKeypadLogic";

import { workoutFieldScrollDelta } from "./workoutFieldScrollDelta";
import { getWorkoutSetFieldRef } from "./workoutSetFieldRefs";

/**
 * Keep the active set field visible above the custom workout keypad WITHOUT
 * ever scrolling the list back toward the top.
 *
 * We measure the tapped field's real position on screen. If it already sits
 * above the keypad we do nothing (this is the common case when the user has
 * scrolled down to a lower exercise) — otherwise we scroll down just enough to
 * clear the keypad.
 */
export function scrollWorkoutFieldIntoView({
  target,
  getScrollOffset,
  scrollToOffset,
  keypadHeight,
}: {
  target: WorkoutKeypadTarget;
  getScrollOffset: () => number;
  scrollToOffset: (offset: number) => void;
  keypadHeight: number;
}) {
  const node = getWorkoutSetFieldRef(target);
  if (!node) return;

  node.measureInWindow((_x, y, width, height) => {
    // Not laid out yet — bail rather than scroll to a bogus position.
    if (width === 0 && height === 0) return;

    const windowHeight = Dimensions.get("window").height;
    const keypadTop = windowHeight - keypadHeight;
    const delta = workoutFieldScrollDelta({ fieldBottom: y + height, keypadTop });
    if (delta <= 0) return;

    scrollToOffset(getScrollOffset() + delta);
  });
}
