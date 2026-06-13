import { describe, expect, it } from "vitest";

import type { WorkoutRoutineTemplate } from "@newyouai/types";

import {
  DEFAULT_ONBOARDING_PROFILE,
  minimalAppState,
  workoutCompletedAppState,
} from "../coach/testFixtures/appStateFixtures";
import {
  buildNutritionNotificationPayload,
  buildWorkoutNotificationPayload,
  computeNotificationPatches,
  isTrainingDay,
  shouldFireNutritionReminder,
  shouldFireWorkoutReminder,
} from "./notificationScheduler";

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

function nutritionLoggedAppState(dateKey: string) {
  return minimalAppState({
    nutritionItemsByDay: {
      [dateKey]: [
        {
          id: "item-1",
          name: "Test meal",
          cal: 500,
          p: 40,
          c: 50,
          f: 15,
        },
      ],
    },
  });
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
  it("returns false when permission is not granted", () => {
    const state = minimalAppState({
      workoutTemplates: mondayTemplate(),
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 },
    });
    expect(shouldFireWorkoutReminder(mondayAfterWorkoutReminder, state, false)).toBe(false);
  });

  it("returns false when workout already completed today", () => {
    const dateKey = "2026-05-04";
    const state = workoutCompletedAppState(dateKey);
    expect(shouldFireWorkoutReminder(mondayAfterWorkoutReminder, state, true)).toBe(false);
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
    expect(shouldFireWorkoutReminder(mondayAfterWorkoutReminder, state, true)).toBe(false);
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
    expect(shouldFireWorkoutReminder(mondayBeforeWorkoutReminder, state, true)).toBe(false);
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
    expect(shouldFireWorkoutReminder(mondayAfterWorkoutReminder, state, true)).toBe(true);
  });
});

describe("shouldFireNutritionReminder", () => {
  it("returns false when permission is not granted", () => {
    const state = minimalAppState();
    expect(shouldFireNutritionReminder(eveningAfterNutritionReminder, state, false)).toBe(false);
  });

  it("returns false when nutrition already logged today", () => {
    const state = nutritionLoggedAppState("2026-05-04");
    expect(shouldFireNutritionReminder(eveningAfterNutritionReminder, state, true)).toBe(false);
  });

  it("returns false when nutrition reminder already fired today", () => {
    const state = minimalAppState({
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        lastFiredNutritionReminderDateKey: "2026-05-04",
      },
    });
    expect(shouldFireNutritionReminder(eveningAfterNutritionReminder, state, true)).toBe(false);
  });

  it("returns false before nutrition check-in time", () => {
    const state = minimalAppState({
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        nutritionCheckInTime: "20:00",
      },
    });
    expect(shouldFireNutritionReminder(eveningBeforeNutritionReminder, state, true)).toBe(false);
  });

  it("returns true when no nutrition logged and time has passed", () => {
    const state = minimalAppState({
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        nutritionCheckInTime: "20:00",
      },
    });
    expect(shouldFireNutritionReminder(eveningAfterNutritionReminder, state, true)).toBe(true);
  });
});

describe("notification payload builders", () => {
  it("buildWorkoutNotificationPayload uses context-aware body from coach engine", () => {
    const state = minimalAppState({
      workoutTemplates: mondayTemplate("Push Day"),
    });
    const payload = buildWorkoutNotificationPayload(state, mondayMorning);

    expect(payload.title).toBe("Workout day");
    expect(payload.body).toMatch(/Push Day/i);
    expect(payload.body).toMatch(/streak|chain alive/i);
    expect(payload.body).not.toMatch(/open Fitcoach to start your session/i);
    expect(payload.tag).toBe("fitcoach-workout");
  });

  it("buildNutritionNotificationPayload uses protein-gap copy from coach engine", () => {
    const state = minimalAppState({
      nutritionTargets: { cal: 2500, p: 180, c: 250, f: 70 },
    });
    const payload = buildNutritionNotificationPayload(state, eveningAfterNutritionReminder);

    expect(payload.title).toBe("Nutrition check-in");
    expect(payload.body).toMatch(/180g protein/i);
    expect(payload.body).not.toMatch(/Log today's fuel in Fitcoach to stay on track with your targets/i);
    expect(payload.tag).toBe("fitcoach-nutrition");
  });
});

describe("computeNotificationPatches", () => {
  it("returns both payloads and lastFired keys when both reminders are due", () => {
    const state = minimalAppState({
      workoutTemplates: mondayTemplate(),
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 },
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        workoutReminderTime: "08:00",
        nutritionCheckInTime: "20:00",
      },
    });
    const now = new Date(2026, 4, 4, 21, 0);

    const patches = computeNotificationPatches(state, now, true);

    expect(patches.workoutPayload?.tag).toBe("fitcoach-workout");
    expect(patches.nutritionPayload?.tag).toBe("fitcoach-nutrition");
    expect(patches.notificationPreferences).toEqual({
      lastFiredWorkoutReminderDateKey: "2026-05-04",
      lastFiredNutritionReminderDateKey: "2026-05-04",
    });
  });

  it("returns empty result when permission is denied", () => {
    const state = minimalAppState({
      workoutTemplates: mondayTemplate(),
      onboardingProfile: { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 5 },
    });

    const patches = computeNotificationPatches(state, mondayAfterWorkoutReminder, false);

    expect(patches.workoutPayload).toBeUndefined();
    expect(patches.nutritionPayload).toBeUndefined();
    expect(patches.notificationPreferences).toBeUndefined();
  });

  it("returns only nutrition patch when workout already completed", () => {
    const state = minimalAppState({
      workoutsCompletedByDay: { "2026-05-04": true },
      notificationPreferences: {
        ...minimalAppState().notificationPreferences,
        nutritionCheckInTime: "20:00",
      },
    });

    const patches = computeNotificationPatches(state, eveningAfterNutritionReminder, true);

    expect(patches.workoutPayload).toBeUndefined();
    expect(patches.nutritionPayload?.tag).toBe("fitcoach-nutrition");
    expect(patches.notificationPreferences).toEqual({
      lastFiredNutritionReminderDateKey: "2026-05-04",
    });
  });
});
