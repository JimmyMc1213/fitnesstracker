import type { CoachTask } from "./coachEngine";
import type { NavigateFn, TabId } from "./types";

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

/** Coupled to coachEngine copy, prefer engine-driven navTarget when FTI-37+ extends CoachTask. */
function restDayReferencesStretch(task: CoachTask): boolean {
  const text = `${task.label} ${task.rationale ?? ""}`.toLowerCase();
  return text.includes("mobility") || text.includes("stretch");
}

/**
 * Maps coach task kind → tab navigation per FTI-33 AC #3.
 * Returns null when the task should not navigate (completed or informational).
 */
export function resolveCoachTaskNavigation(task: CoachTask): TabId | null {
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

/** Fuel tasks that open Log Food on the Nutrition tab (FTI-58). */
export function coachTaskOpensLogFood(task: CoachTask): boolean {
  if (task.completed) return false;
  if (task.kind === "hit_protein") return true;
  if (task.kind === "post_workout_review" && task.ctaLabel === "Log fuel") return true;
  return false;
}

/** @deprecated Use coachTaskOpensLogFood, kept for test migration only. */
export const coachTaskOpensFuelQuickLog = coachTaskOpensLogFood;

/** ScreenHome wires this to `navigate`: guard skips completed tasks. */
export function handleCoachTaskAction(task: CoachTask, navigate: NavigateFn): void {
  if (coachTaskOpensLogFood(task)) {
    navigate("nutrition", { openLogFood: true });
    return;
  }
  const target = resolveCoachTaskNavigation(task);
  if (target) navigate(target);
}
