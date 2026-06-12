import { homePlanSubline as coreHomePlanSubline } from "@newyouai/core";
import type { AppState } from "./types";

export type TimeOfDay = "morning" | "afternoon" | "evening";

/** Local hour buckets for home greeting copy. */
export function timeOfDayBucket(date: Date = new Date()): TimeOfDay {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function timeOfDayPhrase(bucket: TimeOfDay): string {
  if (bucket === "morning") return "Good morning";
  if (bucket === "afternoon") return "Good afternoon";
  return "Good evening";
}

/** First token of display name for greeting (falls back to empty). */
export function greetingFirstName(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? "";
}

export function homeGreetingTitle(displayName: string, date: Date = new Date()): string {
  const phrase = timeOfDayPhrase(timeOfDayBucket(date));
  const first = greetingFirstName(displayName);
  return first ? `${phrase}, ${first}` : phrase;
}

/** Plan-aware subline under the home greeting (null = omit). */
export function homePlanSubline(state: AppState, date: Date = new Date()): string | null {
  return coreHomePlanSubline(state, date);
}
