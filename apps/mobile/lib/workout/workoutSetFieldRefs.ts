import type { View } from "react-native";

import type { WorkoutKeypadTarget } from "@/lib/workout/workoutKeypadLogic";

/**
 * Module-level registry of the on-screen node for each set field, so the
 * keypad-open scroll logic can measure the *actual* focused field (rather than
 * guessing from the exercise index, which is unreliable for tall cards).
 */
const fieldNodes = new Map<string, View>();

function keyFor(target: WorkoutKeypadTarget): string {
  return `${target.exerciseId}:${target.setIndex}:${target.field}`;
}

export function registerWorkoutSetFieldRef(target: WorkoutKeypadTarget, node: View | null) {
  const key = keyFor(target);
  if (node) fieldNodes.set(key, node);
  else fieldNodes.delete(key);
}

export function getWorkoutSetFieldRef(target: WorkoutKeypadTarget): View | undefined {
  return fieldNodes.get(keyFor(target));
}
