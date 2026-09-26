import { expect, type Page } from "@playwright/test";

import { FITNESS_LOCAL_STORAGE_KEY, GYMMY_ONBOARDING_DRAFT_KEY } from "./seed";

/** Continue on the top stack layer. Exiting steps stay mounted until the transition ends. */
export function continueButton(page: Page) {
  return page.locator(".motion-stack-layer").last().getByRole("button", { name: "Continue", exact: true });
}

export async function clickContinue(page: Page) {
  const button = continueButton(page);
  await expect(button).toBeEnabled();
  // Playwright's actionability scroll detaches this button while the onboarding
  // stack is still settling. Dispatch the click on the node itself.
  await button.evaluate((el) => {
    (el as HTMLButtonElement).click();
  });
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

async function commitDateOfBirth(page: Page) {
  await expect(page.getByRole("heading", { name: "When were you born?" })).toBeVisible();
  // The wheel shows a fallback date but does not commit until a column changes.
  await page.getByRole("spinbutton", { name: "Select month" }).press("ArrowDown");
}

async function fillHeight(page: Page) {
  await expect(page.getByRole("heading", { name: "How tall are you?" })).toBeVisible();
  await page.getByRole("textbox", { name: "Height feet" }).fill("5");
  await page.getByRole("textbox", { name: "Height inches" }).fill("10");
}

export async function advanceToCalendarMaintain(page: Page) {
  await advanceHookScreens(page);
  await page.getByRole("button", { name: "Male", exact: true }).click();
  await clickContinue(page); // gender -> date of birth
  await commitDateOfBirth(page);
  await clickContinue(page); // dob -> referral
  await expect(page.getByRole("heading", { name: "Where did you hear about us?" })).toBeVisible();
  await page.getByRole("button", { name: "Friend or family" }).click();
  await clickContinue(page); // referral -> units
  await expect(page.getByRole("heading", { name: "Choose your units" })).toBeVisible();
  await clickContinue(page); // units -> height
  await fillHeight(page);
  await clickContinue(page); // height -> weight (current weight is committed on entry)
  await expect(page.getByRole("heading", { name: "What's your current weight?" })).toBeVisible();
  await clickContinue(page); // weight -> goal
  await expect(page.getByRole("heading", { name: "What's your primary goal?" })).toBeVisible();
  await page.getByRole("button", { name: "Maintain and perform" }).click();
  await clickContinue(page); // maintain skips desired weight and goes to Future You photo
  await expect(page.getByRole("heading", { name: /Future You/i })).toBeVisible();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(page.getByRole("heading", { name: "How active are you outside the gym?" })).toBeVisible();
  await page.getByRole("button", { name: "Moderate (3-4 days/wk)", exact: true }).click();
  await clickContinue(page); // activity -> experience
  await expect(page.getByRole("heading", { name: "What's your training experience?" })).toBeVisible();
  await page.getByRole("button", { name: /^Intermediate/ }).click();
  await clickContinue(page); // experience -> equipment
  await expect(page.getByRole("heading", { name: "What equipment do you have?" })).toBeVisible();
  await page.getByRole("button", { name: /^Full gym/ }).click();
  await clickContinue(page); // equipment -> session length
  await expect(page.getByRole("heading", { name: "How long do you want to train?" })).toBeVisible();
  await page.getByRole("button", { name: "1 hour – 1.5 hours", exact: true }).click();
  await clickContinue(page); // session length -> calendar
  await expect(page.getByRole("heading", { name: "Which days can you train?" })).toBeVisible();
}

export async function advanceFromCalendarToFuelTargets(page: Page) {
  await page.getByRole("button", { name: "Pick for me" }).click();
  await expect(page.getByText(/4 days selected/)).toBeVisible();
  await clickContinue(page); // calendar -> schedule reinforcement
  await expect(page.getByText(/tailor every workout around you and your schedule/i)).toBeVisible();
  await clickContinue(page); // schedule reinforcement -> barriers
  await page.getByRole("button", { name: "Starting strong then falling off" }).click();
  await clickContinue(page); // barriers -> foods
  await page.getByRole("button", { name: "No restrictions. I eat everything" }).click();
  await clickContinue(page); // foods -> training style
  await page.getByRole("button", { name: "Tell me exactly what to do" }).click();
  await clickContinue(page); // training style -> plan building
  await expect(page.getByRole("heading", { name: "Your fuel targets" })).toBeVisible({ timeout: 30_000 });
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
