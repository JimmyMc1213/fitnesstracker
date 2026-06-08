import { test, expect } from "@playwright/test";

import { clearFitnessStorage } from "./helpers/seed";

const DEV_URL = process.env.E2E_DEV_URL ?? "http://localhost:5173";

async function clearSupabaseSession(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sb-")) localStorage.removeItem(key);
    }
  });
}

async function expectAuthWelcome(page: import("@playwright/test").Page) {
  await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /your program\. smarter every session\./i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
}

test.describe("auth gate (requires Supabase-configured dev server)", () => {
  test.beforeEach(async ({ page }) => {
    await clearFitnessStorage(page);
    await clearSupabaseSession(page);
  });

  test("signed-out user sees welcome hook and cannot reach main tabs", async ({ page }) => {
    await page.goto(DEV_URL);

    await expectAuthWelcome(page);
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
    await expect(page.getByText("Good morning")).toHaveCount(0);
  });

  test("signed-out user with completed local onboarding still cannot bypass auth", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "fitcoach:persist:v1",
        JSON.stringify({
          onboardingComplete: true,
          displayName: "Local Only",
          nutritionTargets: { cal: 2000, p: 150, c: 200, f: 65 },
        }),
      );
    });
    await page.goto(DEV_URL);

    await expectAuthWelcome(page);
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
  });

  test("get started opens sign up before onboarding wizard", async ({ page }) => {
    await page.goto(DEV_URL);

    await expectAuthWelcome(page);

    await page.getByRole("button", { name: "Get Started" }).click();
    await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /what's your gender/i })).toHaveCount(0);
  });

  test("sign in link opens sign-in form before onboarding wizard", async ({ page }) => {
    await page.goto(DEV_URL);

    await expectAuthWelcome(page);

    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /choose your look/i })).toHaveCount(0);
  });

  test("signed-out user cannot reach theme picker or gender step", async ({ page }) => {
    await page.goto(DEV_URL);

    await expectAuthWelcome(page);
    await expect(page.getByRole("heading", { name: /choose your look/i })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /what's your gender/i })).toHaveCount(0);
  });

  test("signed-out user with mid-onboarding draft still sees auth welcome", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "fitcoach:persist:v1",
        JSON.stringify({
          onboardingComplete: false,
          onboardingDraft: {
            version: 16,
            stepIndex: 3,
            updatedAtIso: "2026-01-01T00:00:00.000Z",
            displayName: "",
            unitPreferences: { weightUnit: "lbs", heightUnit: "ft_in" },
            profile: { goal: "cut", heightIn: 70, weightLbs: 180, gender: "male" },
          },
        }),
      );
    });
    await page.goto(DEV_URL);

    await expectAuthWelcome(page);
    await expect(page.getByRole("heading", { name: /when were you born/i })).toHaveCount(0);
  });
});
