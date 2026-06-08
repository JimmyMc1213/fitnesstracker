import { test, expect } from "@playwright/test";

import { clearFitnessStorage } from "./helpers/seed";
import {
  advanceFromCalendarToFuelTargets,
  advanceFromFuelTargetsToPlanReady,
  advanceHookScreens,
  advanceToCalendarMaintain,
  advanceToPaywallFromPlanReady,
  clickContinue,
} from "./helpers/onboarding";

async function completeOnboardingFromCalendar(page: import("@playwright/test").Page) {
  await advanceFromCalendarToFuelTargets(page);
  await advanceFromFuelTargetsToPlanReady(page);
  await advanceToPaywallFromPlanReady(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Start My Journey" }).click();
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
  await expect(page.getByText("Your training")).toBeVisible();
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

export { advanceHookScreens, clickContinue };
