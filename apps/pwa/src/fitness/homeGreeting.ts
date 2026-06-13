import { homePlanSubline as coreHomePlanSubline, greetingFirstName, homeGreetingTitle, timeOfDayBucket } from "@newyouai/core";
import type { AppState } from "./types";

export type { TimeOfDay } from "@newyouai/core";
export { greetingFirstName, homeGreetingTitle, timeOfDayBucket };

/** Plan-aware subline under the home greeting (null = omit). */
export function homePlanSubline(state: AppState, date: Date = new Date()): string | null {
  return coreHomePlanSubline(state, date);
}
