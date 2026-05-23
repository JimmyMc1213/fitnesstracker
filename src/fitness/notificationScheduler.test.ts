import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildNutritionNotificationPayload,
  buildWorkoutNotificationPayload,
  isTrainingDay,
  shouldFireNutritionReminder,
  shouldFireWorkoutReminder,
} from "./notificationScheduler";
import {
  minimalAppState,
  nutritionLoggedAppState,
  workoutCompletedAppState,
} from "./testFixtures/appStateFixtures";
import { DEFAULT_ONBOARDING_PROFILE } from "./onboardingProfile";
import type { WorkoutRoutineTemplate } from "./types";

vi.mock("./notificationPermission", () => ({
  getNotificationPermission: vi.fn(() => "granted" as const),
}));

import { getNotificationPermission } from "./notificationPermission";

const mondayMorning = new Date(2026, 4, 4, 7, 0);
const mondayAfterWorkoutReminder = new Date(2026, 4, 4, 9, 0);
const mondayBeforeWorkoutReminder = new Date(2026, 4, 4, 6, 0);
const sundayMorning = new Date(2026, 4, 10, 9, 0);
const eveningAfterNutritionReminder = new Date(2026, 4, 4, 21, 0);
const eveningBeforeNutritionReminder = new Date(2026, 4, 4, 18, 0);

function mondayTemplate(name = "Upper strength"): WorkoutRoutineTemplate[] {
  return [
    {
      id: "mon-upper",
      name,
      dayLabel: "Mon",
      focus: "Bench",
      exercises: [],
    },
  ];
}

describe("isTrainingDay", () => {
  it("returns true on Monday when template has Mon dayLabel", () => {
    expect(isTrainingDay(mondayMorning, mondayTemplate(), 5)).toBe(true);
  });

  it("uses default 5-day schedule when templates are empty", () => {
    expect(isTrainingDay(mondayMorning, [], 5)).toBe(true);
    expect(isTrainingDay(new Date(2026, 4, 5, 9, 0), [], 5)).toBe(true);
    expect(isTrainingDay(new Date(2026, 4, 6, 9, 0), [], 5)).toBe(true);
    expect(isTrainingDay(new Date(2026, 4, 7, 9, 0), [], 5)).toBe(true);
    expect(isTrainingDay(new Date(2026, 4, 8, 9, 0), [], 5)).toBe(true);
  });

  it("returns false on rest day (Sunday with 5-day default)", () => {
    expect(isTrainingDay(sundayMorning, [], 5)).toBe(false);
  });
});

describe("shouldFireWorkoutReminder", () => {
  beforeEach(() => {
    vi.mocked(getNotificationPermission).mockReturnValue("granted");
  });

  it("returns false when permission is not granted", () => {
    vi.mocked(getNotificationPermission).mockReturnValue("denied");
    const state = minimalAppState({
      workoutTemplates: mondayTemplate(),
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 },
    });
    expect(shouldFireWorkoutReminder(mondayAfterWorkoutReminder, state)).toBe(false);
  });

  it("returns false when workout already completed today", () => {
    const dateKey = "2026-05-04";
    const state = workoutCompletedAppState(dateKey);
    expect(shouldFireWorkoutReminder(mondayAfterWorkoutReminder, state)).toBe(false);
  });

  it("returns false when workout reminder already fired today", () => {
    const state = minimalAppState({
      workoutTemplates: mondayTemplate(),
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 },
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        lastFiredWorkoutReminderDateKey: "2026-05-04",
      },
    });
    expect(shouldFireWorkoutReminder(mondayAfterWorkoutReminder, state)).toBe(false);
  });

  it("returns false before reminder time on training day", () => {
    const state = minimalAppState({
      workoutTemplates: mondayTemplate(),
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 },
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        workoutReminderTime: "08:00",
      },
    });
    expect(shouldFireWorkoutReminder(mondayBeforeWorkoutReminder, state)).toBe(false);
  });

  it("returns true at or after reminder time on training day", () => {
    const state = minimalAppState({
      workoutTemplates: mondayTemplate(),
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 },
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        workoutReminderTime: "08:00",
      },
    });
    expect(shouldFireWorkoutReminder(mondayAfterWorkoutReminder, state)).toBe(true);
  });
});

describe("shouldFireNutritionReminder", () => {
  beforeEach(() => {
    vi.mocked(getNotificationPermission).mockReturnValue("granted");
  });

  it("returns false when permission is not granted", () => {
    vi.mocked(getNotificationPermission).mockReturnValue("denied");
    const state = minimalAppState();
    expect(shouldFireNutritionReminder(eveningAfterNutritionReminder, state)).toBe(false);
  });

  it("returns false when nutrition already logged today", () => {
    const state = nutritionLoggedAppState("2026-05-04");
    expect(shouldFireNutritionReminder(eveningAfterNutritionReminder, state)).toBe(false);
  });

  it("returns false when nutrition reminder already fired today", () => {
    const state = minimalAppState({
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        lastFiredNutritionReminderDateKey: "2026-05-04",
      },
    });
    expect(shouldFireNutritionReminder(eveningAfterNutritionReminder, state)).toBe(false);
  });

  it("returns false before nutrition check-in time", () => {
    const state = minimalAppState({
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        nutritionCheckInTime: "20:00",
      },
    });
    expect(shouldFireNutritionReminder(eveningBeforeNutritionReminder, state)).toBe(false);
  });

  it("returns true when no nutrition logged and time has passed", () => {
    const state = minimalAppState({
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        nutritionCheckInTime: "20:00",
      },
    });
    expect(shouldFireNutritionReminder(eveningAfterNutritionReminder, state)).toBe(true);
  });
});

describe("notification payload builders", () => {
  it("buildWorkoutNotificationPayload uses context-aware body from coach engine", () => {
    vi.useFakeTimers();
    vi.setSystemTime(mondayMorning);

    const state = minimalAppState({
      workoutTemplates: mondayTemplate("Push Day"),
    });
    const payload = buildWorkoutNotificationPayload(state, mondayMorning);

    expect(payload.title).toBe("Workout day");
    expect(payload.body).toMatch(/Push Day/i);
    expect(payload.body).toMatch(/streak|chain alive/i);
    expect(payload.body).not.toMatch(/open Fitcoach to start your session/i);
    expect(payload.tag).toBe("fitcoach-workout");
    expect(payload.icon).toBe("/favicon.svg");

    vi.useRealTimers();
  });

  it("buildNutritionNotificationPayload uses protein-gap copy from coach engine", () => {
    vi.useFakeTimers();
    vi.setSystemTime(eveningAfterNutritionReminder);

    const state = minimalAppState({
      nutritionTargets: { cal: 2500, p: 180, c: 250, f: 70 },
    });
    const payload = buildNutritionNotificationPayload(state, eveningAfterNutritionReminder);

    expect(payload.title).toBe("Nutrition check-in");
    expect(payload.body).toMatch(/180g protein/i);
    expect(payload.body).not.toMatch(/Log today's fuel in Fitcoach to stay on track with your targets/i);
    expect(payload.tag).toBe("fitcoach-nutrition");
    expect(payload.icon).toBe("/favicon.svg");

    vi.useRealTimers();
  });
});
