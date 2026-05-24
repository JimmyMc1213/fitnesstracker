import { test, expect, type Page } from "@playwright/test";

import { FITNESS_LOCAL_STORAGE_KEY, GYMMY_ONBOARDING_DRAFT_KEY, clearFitnessStorage } from "./helpers/seed";

async function clickContinue(page: Page) {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

async function advanceToCalendarMaintain(page: Page) {
  await expect(page.getByRole("heading", { name: "Gymmy" })).toBeVisible();
  await clickContinue(page); // welcome
  await clickContinue(page); // why gymmy
  await page.getByRole("button", { name: "Skip for now" }).click(); // name
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
  await clickContinue(page); // calendar -> split reveal
  await clickContinue(page); // split -> macros
  await clickContinue(page); // macros
  await clickContinue(page); // protein
  await clickContinue(page); // notifications
  await expect(page.getByRole("heading", { name: /your plan is ready/i })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "See my options" }).click();
  await expect(page.getByRole("heading", { name: "Unlock your full coaching experience" })).toBeVisible();
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
  await expect(page.getByText("Step 15 of 23")).toBeVisible();
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
