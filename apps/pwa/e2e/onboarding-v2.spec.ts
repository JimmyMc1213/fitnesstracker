import { test, expect } from "@playwright/test";

import { clearFitnessStorage } from "./helpers/seed";
import {
  advanceFromCalendarToFuelTargets,
  advanceFromFuelTargetsToPlanReady,
  advanceHookScreens,
  advanceToCalendarMaintain,
  advanceToPaywallFromPlanReady,
  clickContinue,
  continueButton,
} from "./helpers/onboarding";

async function completeOnboardingFromCalendar(page: import("@playwright/test").Page) {
  await advanceFromCalendarToFuelTargets(page);
  await advanceFromFuelTargetsToPlanReady(page);
  await advanceToPaywallFromPlanReady(page);
  await page.getByRole("button", { name: "Start My Journey", exact: true }).click();
  await page.locator(".onboarding-fy-success__cta").click();
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
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

  const continueBtn = continueButton(page);
  await expect(continueBtn).toBeDisabled();
  await expect(page.getByText(/Pick 3–6 training days/)).toBeVisible();

  await page.getByRole("button", { name: "Pick for me" }).click();
  await expect(page.getByText(/4 days selected/)).toBeVisible();
  await expect(continueBtn).toBeEnabled();

  await page.getByRole("button", { name: "Tue, selected" }).click();
  await page.getByRole("button", { name: "Thu, selected" }).click();
  await expect(page.getByText(/2 days selected/)).toBeVisible();
  await expect(continueBtn).toBeDisabled();

  await page.getByRole("button", { name: "Pick for me" }).click();
  await expect(page.getByText(/4 days selected/)).toBeVisible();
  await expect(continueBtn).toBeEnabled();
});

export { advanceHookScreens, clickContinue };
