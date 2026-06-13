import { buildCoachContext, estimatedSessionLabel, getHomeCoachPlan, localDateKey } from "@newyouai/core";
import type { AppState, WorkoutRoutineTemplate } from "@newyouai/types";

export type PreWorkoutCoachBrief = {
  headline: string;
  rationale?: string;
};

/** Coach card expands only on training days when the active session matches today's template. */
export function shouldDefaultExpandCoachCard(
  isTrainingDayToday: boolean,
  sessionSplitId: string,
  todayTemplateId: string | null | undefined,
): boolean {
  return (
    isTrainingDayToday &&
    sessionSplitId !== "" &&
    todayTemplateId != null &&
    sessionSplitId === todayTemplateId
  );
}

export function buildPreWorkoutCoachBrief(
  state: AppState,
  now = new Date(),
): { brief: PreWorkoutCoachBrief; todayTemplateId: string } | null {
  const ctx = buildCoachContext(state, localDateKey(now), now);
  if (!ctx.isTrainingDay || !ctx.todayTemplate) return null;

  const plan = getHomeCoachPlan(ctx);
  const startTask = plan.tasks.find((t) => t.kind === "start_workout" && !t.completed);
  return {
    brief: {
      headline: plan.headline,
      rationale: startTask?.rationale,
    },
    todayTemplateId: ctx.todayTemplate.id,
  };
}

/** Coach copy for a routine preview sheet — always derived from the current template snapshot. */
export function buildRoutinePreviewCoachBrief(
  template: WorkoutRoutineTemplate,
  options?: { todayHeadline?: string; isTodayWorkout?: boolean },
): PreWorkoutCoachBrief | undefined {
  const focus = template.focus.trim();
  const isTodayWorkout = options?.isTodayWorkout ?? false;
  const headline =
    isTodayWorkout && options?.todayHeadline
      ? options.todayHeadline
      : estimatedSessionLabel(template) || template.name;

  if (!focus && !isTodayWorkout) return undefined;

  return {
    headline,
    rationale: focus || undefined,
  };
}
