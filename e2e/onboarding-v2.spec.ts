import { test, expect, type Page } from "@playwright/test";

import { FITNESS_LOCAL_STORAGE_KEY, GYMMY_ONBOARDING_DRAFT_KEY, clearFitnessStorage } from "./helpers/seed";

async function clickContinue(page: Page) {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

async function advanceHookScreens(page: Page) {
  await expect(page.getByRole("heading", { name: /fitness coaching made easy/i })).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: "Get Started" }).click();
  await expect(page.getByRole("heading", { name: /what's your gender/i })).toBeVisible();
}

async function advanceToCalendarMaintain(page: Page) {
  await advanceHookScreens(page);
  await clickContinue(page); // gender
  await clickContinue(page); // dob
  await clickContinue(page); // units
  await clickContinue(page); // height
  await clickContinue(page); // weight
  await page.getByRole("button", { name: "Maintain and perform" }).click();
  await clickContinue(page); // goal -> activity
  await clickContinue(page); // activity
  await clickContinue(page); // experience
  await clickContinue(page); // equipment
  await expect(page.getByRole("heading", { name: "Which days can you train?" })).toBeVisible();
}

async function completeOnboardingFromCalendar(page: Page) {
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
  await clickContinue(page); // accomplishments -> potential
  await expect(page.getByRole("heading", { name: /here's how gymmy keeps you sharp/i })).toBeVisible();
  await expect(page.getByText(/the coaching loop that actually works/i)).toBeVisible();
  const coachingLoopCta = page.getByRole("button", { name: "Got it, let's go" });
  await expect(coachingLoopCta).toBeEnabled({ timeout: 5000 });
  await coachingLoopCta.click(); // coaching loop -> plan building
  await expect(page.getByRole("heading", { name: "Your fuel targets" })).toBeVisible({ timeout: 20_000 });
  await clickContinue(page); // macros -> protein priority
  await page.getByRole("button", { name: "Show training plan" }).click();
  await expect(page.getByRole("heading", { name: /here's your training plan/i })).toBeVisible();
  await page.getByRole("button", { name: "Let's go" }).click(); // split reveal -> notification pre-prompt
  await expect(page.getByRole("heading", { name: /reach your goals with notifications/i })).toBeVisible();
  await page.getByRole("button", { name: "Allow" }).click(); // pre-prompt -> reminder picker
  await expect(page.getByRole("heading", { name: "Stay on track" })).toBeVisible();
  await page.getByRole("button", { name: "Skip for now", exact: true }).click(); // reminders -> plan ready
  await expect(page.getByRole("heading", { name: /your plan is ready/i })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Start my plan" }).click();
  await expect(page.getByRole("heading", { name: "Save your progress" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with Apple" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
  await page.getByRole("button", { name: /sign in later\? Skip/i }).click();
  await expect(page.getByRole("heading", { name: "Unlock Gymmy to reach your goals faster." })).toBeVisible();
  await page.getByRole("button", { name: "Continue with free" }).click();
  await expect(page.getByText("Today's plan")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await clearFitnessStorage(page);
});

test("happy path maintain: onboarding through paywall to Home", async ({ page }) => {
  await page.goto("/");
  await advanceToCalendarMaintain(page);
  await completeOnboardingFromCalendar(page);
});

test("resume: reload restores calendar step", async ({ page }) => {
  await page.goto("/");
  await advanceToCalendarMaintain(page);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Which days can you train?" })).toBeVisible();
  await expect(page.getByText("Step 14 of 29")).toBeVisible();
});

test("week calendar: 3-day minimum validation", async ({ page }) => {
  await page.goto("/");
  await advanceToCalendarMaintain(page);

  const continueBtn = page.getByRole("button", { name: "Continue", exact: true });
  await expect(continueBtn).toBeEnabled();

  await page.getByRole("button", { name: "Wed, selected" }).click();
  await page.getByRole("button", { name: "Thu, selected" }).click();
  await page.getByRole("button", { name: "Fri, selected" }).click();
  await expect(page.getByText(/2 days selected/)).toBeVisible();
  await expect(continueBtn).toBeDisabled();

  await page.getByRole("button", { name: "Pick for me" }).click();
  await expect(page.getByText(/4 days selected/)).toBeVisible();
  await expect(continueBtn).toBeEnabled();
});
