import type { CoachTask } from "@newyouai/core";
import { router } from "expo-router";

import { openNutritionLogFood } from "@/lib/openNutritionLogFood";

/** Whether a task should expose a tappable CTA (incomplete + routable). */
export function coachTaskHasAction(task: CoachTask): boolean {
  return resolveCoachTaskNavigation(task) !== null || coachTaskOpensLogFood(task);
}

/** Display label for task CTA; null when no button should render. */
export function coachTaskCtaLabel(task: CoachTask): string | null {
  if (task.completed) return null;

  if (task.kind === "start_workout") {
    return task.ctaLabel ?? "Start session";
  }

  if (task.kind === "rest_day") {
    if (!restDayReferencesStretch(task)) return null;
    return task.ctaLabel ?? "Open stretch";
  }

  return task.ctaLabel ?? null;
}

function restDayReferencesStretch(task: CoachTask): boolean {
  const text = `${task.label} ${task.rationale ?? ""}`.toLowerCase();
  return text.includes("mobility") || text.includes("stretch");
}

export type CoachNavigationTarget = "workout" | "nutrition" | "progress" | "stretch" | null;

export function resolveCoachTaskNavigation(task: CoachTask): CoachNavigationTarget {
  if (task.completed) return null;

  switch (task.kind) {
    case "start_workout":
      return "workout";
    case "hit_protein":
    case "post_workout_review":
      return "nutrition";
    case "log_weigh_in":
      return "progress";
    case "rest_day":
      return restDayReferencesStretch(task) ? "stretch" : null;
    default:
      return null;
  }
}

export function coachTaskOpensLogFood(task: CoachTask): boolean {
  if (task.completed) return false;
  if (task.kind === "hit_protein") return true;
  if (task.kind === "post_workout_review" && task.ctaLabel === "Log fuel") return true;
  return false;
}

export function handleCoachTaskAction(
  task: CoachTask,
  options?: { onOpenMobilityPreview?: () => void },
): void {
  if (coachTaskOpensLogFood(task)) {
    openNutritionLogFood();
    return;
  }

  const target = resolveCoachTaskNavigation(task);
  if (target === "stretch") {
    options?.onOpenMobilityPreview?.();
    return;
  }

  if (target === "workout") {
    router.push("/(tabs)/workout");
    return;
  }
  if (target === "nutrition") {
    router.push("/(tabs)/nutrition");
    return;
  }
  if (target === "progress") {
    router.push("/(tabs)/progress");
  }
}
