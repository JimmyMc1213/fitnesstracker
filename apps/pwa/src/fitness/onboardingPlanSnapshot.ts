import { futureYouTimelineFromProfile } from "./futureYouTimeline";
import { weekdayMonStartIndex } from "./trainingCalendar";
import type { MacroTotals, OnboardingProfile, VolumeUnit, WorkoutRoutineTemplate } from "./types";
import { DEFAULT_WATER_DAILY_TARGET_OZ } from "./waterIntake";

export const ONBOARDING_PLAN_DEFAULT_STEPS_TARGET = 10_000;

/** Frozen plan numbers shared by Plan ready (26); paywall uses timeline for Future You hook only. */
export type OnboardingPlanSnapshot = {
  displayName: string;
  macros: MacroTotals;
  profile: OnboardingProfile;
  templates: WorkoutRoutineTemplate[];
  timeline: string;
  waterDailyTargetOz: number;
  stepsTarget: number;
  volumeUnit: VolumeUnit;
};

type BuildInput = {
  displayName: string;
  macros: MacroTotals;
  profile: OnboardingProfile;
  templates: WorkoutRoutineTemplate[];
  volumeUnit: VolumeUnit;
  waterDailyTargetOz?: number;
  stepsTarget?: number;
};

export function buildOnboardingPlanSnapshot({
  displayName,
  macros,
  profile,
  templates,
  volumeUnit,
  waterDailyTargetOz = DEFAULT_WATER_DAILY_TARGET_OZ,
  stepsTarget = ONBOARDING_PLAN_DEFAULT_STEPS_TARGET,
}: BuildInput): OnboardingPlanSnapshot {
  return {
    displayName,
    macros: { ...macros },
    profile,
    templates: templates.map((t) => ({ ...t, exercises: [...t.exercises] })),
    timeline: futureYouTimelineFromProfile(profile),
    waterDailyTargetOz,
    stepsTarget,
    volumeUnit,
  };
}

export function onboardingPlanSnapshotWeekRows(
  snapshot: Pick<OnboardingPlanSnapshot, "templates">,
): { dayLabel: string; name: string }[] {
  return [...snapshot.templates]
    .sort((a, b) => weekdayMonStartIndex(a.dayLabel) - weekdayMonStartIndex(b.dayLabel))
    .map(({ dayLabel, name }) => ({ dayLabel, name }));
}

export function onboardingPlanSnapshotFirstWorkoutRow(
  snapshot: Pick<OnboardingPlanSnapshot, "templates">,
): { dayLabel: string; name: string } | null {
  return onboardingPlanSnapshotWeekRows(snapshot)[0] ?? null;
}

export function formatOnboardingPlanFuelLine(macros: MacroTotals): string {
  return `${macros.cal.toLocaleString()} cal · ${macros.p.toLocaleString()}g protein`;
}

export function planSnapshotMatches(
  a: OnboardingPlanSnapshot,
  b: OnboardingPlanSnapshot,
): boolean {
  return (
    a.displayName === b.displayName &&
    a.macros.cal === b.macros.cal &&
    a.macros.p === b.macros.p &&
    a.macros.c === b.macros.c &&
    a.macros.f === b.macros.f &&
    a.timeline === b.timeline &&
    a.waterDailyTargetOz === b.waterDailyTargetOz &&
    a.stepsTarget === b.stepsTarget &&
    a.volumeUnit === b.volumeUnit &&
    a.templates.length === b.templates.length &&
    a.templates.every(
      (t, i) => t.id === b.templates[i]?.id && t.dayLabel === b.templates[i]?.dayLabel && t.name === b.templates[i]?.name,
    )
  );
}
