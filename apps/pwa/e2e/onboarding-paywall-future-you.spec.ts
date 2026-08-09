import { expect, test } from "@playwright/test";

import {
  advanceFromCalendarToFuelTargets,
  advanceFromFuelTargetsToPlanReady,
  advanceToCalendarMaintain,
  advanceToPaywallFromPlanReady,
  makeOnboardingDraftAtStep,
  seedOnboardingDraft,
} from "./helpers/onboarding";

const JOB_ID = "550e8400-e29b-41d4-a716-446655440000";

test("step 21: skip photo path shows plan-only paywall with enabled CTA", async ({ page }) => {
  await seedOnboardingDraft(page, makeOnboardingDraftAtStep(26, { futureYou: { photoSkipped: true } }));
  await page.goto("/");
  await advanceToPaywallFromPlanReady(page);

  await expect(page.locator(".onboarding-paywall-future-you")).toHaveCount(0);
  await expect(page.locator(".onboarding-paywall-plan-summary")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start My Journey", exact: true })).toBeEnabled();
});

test("step 24: under-18 paywall shows plan summary without Future You hero", async ({ page }) => {
  await seedOnboardingDraft(
    page,
    makeOnboardingDraftAtStep(26, {
      profile: {
        goal: "maintain",
        heightIn: 70,
        weightLbs: 180,
        age: 16,
        dateOfBirth: "2010-06-15",
        gender: "male",
        activityLevel: "moderate",
        workoutDaysPerWeek: 4,
        trainingWeekdays: ["Mon", "Wed", "Fri", "Sat"],
        referralSource: "friend",
      },
      futureYou: {},
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Unlock your plan" }).click();
  await expect(
    page.getByRole("heading", { name: /Unlock NewYouAI to reach your goals faster\./i }),
  ).toBeVisible();
  await expect(page.locator(".onboarding-paywall-future-you")).toHaveCount(0);
  await expect(page.locator(".onboarding-paywall-plan-summary")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start My Journey", exact: true })).toBeEnabled();
});

test("step 24: skip path completes paywall and lands on plan-only success", async ({ page }) => {
  await seedOnboardingDraft(page, makeOnboardingDraftAtStep(26, { futureYou: { photoSkipped: true } }));
  await page.goto("/");
  await advanceToPaywallFromPlanReady(page);

  await page.getByRole("button", { name: "Start My Journey", exact: true }).click();
  await expect(page.getByRole("heading", { name: "You're ready, Alex." })).toBeVisible();
  await expect(page.getByText("Your new chapter starts today.")).toBeVisible();
  await expect(page.getByText("Your plan", { exact: true })).toBeVisible();
  await expect(page.getByText("2,100")).toBeVisible();
  await expect(page.getByText("160", { exact: true })).toBeVisible();
  await expect(page.getByText("Mon · Upper strength")).toBeVisible();
  await expect(page.getByText("Wed · Lower strength")).toBeVisible();
  await expect(page.getByText("Your targets", { exact: true })).toBeVisible();
  await expect(page.getByText("64 oz")).toBeVisible();
  await expect(page.getByText("10,000")).toBeVisible();
  await expect(page.locator(".onboarding-fy-success-plan")).toBeVisible();
  await expect(page.getByText("Welcome to NewYouAI")).toBeVisible();
  await expect(page.getByText("AI generated")).toHaveCount(0);
  await page.getByRole("button", { name: "Start My Journey" }).click();
  await expect(page.getByText("Today's plan")).toBeVisible();
});

test("step 21: photo path disables trial CTA until Future You is ready", async ({ page }) => {
  await seedOnboardingDraft(
    page,
    makeOnboardingDraftAtStep(26, {
      futureYou: {
        generationJobId: JOB_ID,
        generationStatus: "generating",
        motivationId: "maintain-male-glow",
      },
    }),
  );
  await page.goto("/");
  await advanceToPaywallFromPlanReady(page);

  await expect(page.locator(".onboarding-paywall-future-you")).toBeVisible();
  await expect(page.getByText(/You in 3 months/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Preparing your Future You…" })).toBeDisabled();
});

test("step 21: photo path CTA reflects billing period when Future You is ready", async ({ page }) => {
  await seedOnboardingDraft(
    page,
    makeOnboardingDraftAtStep(26, {
      futureYou: {
        generationJobId: JOB_ID,
        generationStatus: "ready",
        motivationId: "maintain-male-glow",
      },
    }),
  );
  await page.goto("/");
  await advanceToPaywallFromPlanReady(page);

  await expect(page.locator(".onboarding-paywall-future-you")).toBeVisible();
  await expect(page.locator(".onboarding-paywall-future-you__preparing")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeEnabled();
  await page.getByRole("radio", { name: /Monthly/i }).click();
  await expect(page.getByRole("button", { name: "Unlock Future You" })).toBeEnabled();
  await page.getByRole("radio", { name: /Yearly/i }).click();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeEnabled();
});

test("step 21: full maintain skip path still reaches paywall", async ({ page }) => {
  await page.goto("/");
  await advanceToCalendarMaintain(page);
  await advanceFromCalendarToFuelTargets(page);
  await advanceFromFuelTargetsToPlanReady(page);
  await advanceToPaywallFromPlanReady(page);

  await expect(page.getByRole("button", { name: "Start My Journey", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Continue with free" })).toHaveCount(0);
});
