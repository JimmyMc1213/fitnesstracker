import { expect, type Page } from "@playwright/test";

import { FITNESS_LOCAL_STORAGE_KEY, GYMMY_ONBOARDING_DRAFT_KEY } from "./seed";

export async function clickContinue(page: Page) {
  await page.getByRole("button", { name: "Continue", exact: true, disabled: false }).click();
}

export async function advanceHookScreens(page: Page) {
  await expect(page.getByRole("heading", { name: /your program\. smarter every session\./i })).toBeVisible({
    timeout: 5000,
  });
  await page.getByRole("button", { name: "Get Started" }).click();
  await expect(page.getByRole("heading", { name: /choose your look/i })).toBeVisible();
  await clickContinue(page); // theme -> gender
  await expect(page.getByRole("heading", { name: /what's your gender/i })).toBeVisible();
}

const MAINTAIN_PROFILE = {
  goal: "maintain" as const,
  heightIn: 70,
  weightLbs: 180,
  age: 30,
  dateOfBirth: "1996-06-15",
  gender: "male" as const,
  activityLevel: "moderate" as const,
  workoutDaysPerWeek: 4 as const,
  trainingWeekdays: ["Mon", "Wed", "Fri", "Sat"],
  referralSource: "friend" as const,
};

const PLAN_TEMPLATES = [
  { id: "mon-upper", dayLabel: "Mon", name: "Upper strength", focus: "Push focus", exercises: [] },
  { id: "wed-lower", dayLabel: "Wed", name: "Lower strength", focus: "Leg focus", exercises: [] },
  { id: "fri-upper", dayLabel: "Fri", name: "Upper hypertrophy", focus: "Volume", exercises: [] },
  { id: "sat-conditioning", dayLabel: "Sat", name: "Conditioning", focus: "Engine", exercises: [] },
];

const DEFAULT_NOTIFICATION_PREFS = {
  workoutReminderEnabled: false,
  workoutReminderTime: "08:00",
  nutritionCheckInEnabled: false,
  nutritionCheckInTime: "20:00",
  lastFiredWorkoutReminderDateKey: null,
  lastFiredNutritionReminderDateKey: null,
};

export function makeOnboardingDraftAtStep(
  stepIndex: number,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    version: 18,
    stepIndex,
    updatedAtIso: "2026-05-30T12:00:00.000Z",
    displayName: "Alex",
    unitPreferences: { weightUnit: "lbs", heightUnit: "ft_in", volumeUnit: "oz" },
    experienceLevel: "intermediate",
    equipmentSetup: "full_gym",
    sessionLength: "60_90",
    profile: MAINTAIN_PROFILE,
    draftTemplates: PLAN_TEMPLATES,
    macros: { cal: 2100, p: 160, c: 200, f: 60 },
    notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
    theme: "light",
    futureYou: { photoSkipped: true },
    ...overrides,
  };
}

export async function seedOnboardingDraft(page: Page, draft: Record<string, unknown>) {
  await page.addInitScript(
    ([fitnessKey, draftKey, draftJson]) => {
      localStorage.setItem(fitnessKey, JSON.stringify({ onboardingComplete: false, displayName: "Alex" }));
      localStorage.setItem(draftKey, draftJson);
    },
    [FITNESS_LOCAL_STORAGE_KEY, GYMMY_ONBOARDING_DRAFT_KEY, JSON.stringify(draft)] as const,
  );
}

export async function advanceToCalendarMaintain(page: Page) {
  await advanceHookScreens(page);
  await clickContinue(page); // gender
  await clickContinue(page); // dob
  await clickContinue(page); // units
  await clickContinue(page); // height
  await clickContinue(page); // weight
  await page.getByRole("button", { name: "Maintain and perform" }).click();
  await clickContinue(page); // goal -> Future You photo (10b)
  await expect(page.getByRole("heading", { name: /Future You/i })).toBeVisible();
  await page.getByRole("button", { name: "Skip", exact: true }).click(); // skip photo -> activity
  await clickContinue(page); // activity
  await clickContinue(page); // experience
  await clickContinue(page); // equipment
  await expect(page.getByRole("heading", { name: "Which days can you train?" })).toBeVisible();
}

export async function advanceFromCalendarToFuelTargets(page: Page) {
  await clickContinue(page); // calendar -> session duration
  await page.getByRole("button", { name: "1 hour – 1.5 hours", exact: true }).click();
  await clickContinue(page); // duration -> schedule reinforcement
  await expect(page.getByText(/tailor every workout around you and your schedule/i)).toBeVisible();
  await clickContinue(page); // schedule reinforcement -> obstacles
  await page.getByRole("button", { name: "Starting strong then falling off" }).click();
  await clickContinue(page); // obstacles -> diet
  await page.getByRole("button", { name: "Classic", exact: true }).click();
  await clickContinue(page); // diet -> accomplishments
  await page.getByRole("button", { name: "Eat and live healthier" }).click();
  await clickContinue(page); // training style -> plan building
  await expect(page.getByRole("heading", { name: "Your fuel targets" })).toBeVisible({ timeout: 20_000 });
}

export async function advanceFromFuelTargetsToPlanReady(page: Page) {
  await clickContinue(page); // macros -> protein priority
  await page.getByRole("button", { name: "Show training plan" }).click();
  await expect(page.getByRole("heading", { name: /here's your training plan/i })).toBeVisible();
  await page.getByRole("button", { name: "Let's go" }).click(); // split reveal -> notification pre-prompt
  await expect(page.getByRole("heading", { name: /reach your goals with notifications/i })).toBeVisible();
  await page.locator(".onboarding-notification-prompt__allow").click(); // pre-prompt -> reminder picker
  await expect(page.getByRole("heading", { name: "Stay on track" })).toBeVisible();
  await page.getByRole("button", { name: "Skip for now", exact: true }).click(); // reminders -> plan ready
  await expect(page.getByRole("heading", { name: /your plan is ready/i })).toBeVisible({ timeout: 10_000 });
}

export type PlanSurfaceData = {
  cal: string;
  protein: string;
  timeline: string;
  week: { day: string; name: string }[];
};

export async function readPlanReadySurface(page: Page): Promise<PlanSurfaceData> {
  const macroValues = page.locator(".onboarding-plan-ready__macro-value");
  const cal = (await macroValues.nth(0).textContent())?.trim() ?? "";
  const protein = (await macroValues.nth(1).textContent())?.trim() ?? "";
  const timelineRaw = (await page.locator(".onboarding-plan-ready__timeline").textContent()) ?? "";
  const timeline = timelineRaw.replace(/^Goal timeline ·\s*/i, "").trim();
  const week = await page.locator(".onboarding-plan-ready__week-row").evaluateAll((rows) =>
    rows.map((row) => ({
      day: row.querySelector(".onboarding-plan-ready__week-day")?.textContent?.trim() ?? "",
      name: row.querySelector(".onboarding-plan-ready__week-name")?.textContent?.trim() ?? "",
    })),
  );

  return { cal, protein, timeline, week };
}

export async function advanceToPaywallFromPlanReady(page: Page) {
  await page.getByRole("button", { name: /Unlock your plan|Continue to Future You/i }).click();
  await expect(
    page.getByRole("heading", {
      name: /Unlock NewYouAI to see what you can look like\.|Unlock NewYouAI to reach your goals faster\./i,
    }),
  ).toBeVisible();
}
