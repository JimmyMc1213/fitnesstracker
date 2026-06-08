import { test, expect } from "@playwright/test";

import { clearFitnessStorage } from "./helpers/seed";
import {
  advanceFromFuelTargetsToPlanReady,
  advanceToPaywallFromPlanReady,
  makeOnboardingDraftAtStep,
  readPlanReadySurface,
  seedOnboardingDraft,
} from "./helpers/onboarding";

test.beforeEach(async ({ page }) => {
  await clearFitnessStorage(page);
});

test("step 20: plan ready shows frozen plan numbers from onboarding state", async ({ page }) => {
  await seedOnboardingDraft(page, makeOnboardingDraftAtStep(26));
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /your plan is ready/i })).toBeVisible({ timeout: 10_000 });

  const planReady = await readPlanReadySurface(page);
  expect(planReady.cal).toBe("2,100");
  expect(planReady.protein).toBe("160");
  expect(planReady.timeline).toBe("3 months");
  expect(planReady.week).toEqual([
    { day: "Mon", name: "Upper strength" },
    { day: "Wed", name: "Lower strength" },
    { day: "Fri", name: "Upper hypertrophy" },
    { day: "Sat", name: "Conditioning" },
  ]);
});

test("step 20: edited macros on step 21 appear on plan ready", async ({ page }) => {
  await seedOnboardingDraft(
    page,
    makeOnboardingDraftAtStep(21, {
      macros: { cal: 2000, p: 150, c: 200, f: 60 },
    }),
  );
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Your fuel targets" })).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Edit Calories" }).first().click();
  const caloriesInput = page.getByRole("spinbutton", { name: "Calories" });
  await caloriesInput.fill("2222");
  await caloriesInput.press("Enter");

  await advanceFromFuelTargetsToPlanReady(page);

  const planReady = await readPlanReadySurface(page);
  expect(planReady.cal).toBe("2,222");
  expect(planReady.protein).toBe("150");
});

test("paywall does not repeat plan summary after plan ready", async ({ page }) => {
  await seedOnboardingDraft(page, makeOnboardingDraftAtStep(26));
  await page.goto("/");
  await advanceToPaywallFromPlanReady(page);

  await expect(page.locator(".onboarding-paywall-plan-summary")).toHaveCount(0);
  await expect(page.getByText("Daily fuel", { exact: true })).toHaveCount(0);
});
