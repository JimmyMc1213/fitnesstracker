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

test.describe("auth gate (requires Supabase-configured dev server)", () => {
  test.beforeEach(async ({ page }) => {
    await clearFitnessStorage(page);
    await clearSupabaseSession(page);
  });

  test("signed-out user sees auth screen and cannot reach main tabs", async ({ page }) => {
    await page.goto(DEV_URL);

    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
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

    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
  });

  test("auth screen comes before onboarding welcome", async ({ page }) => {
    await page.goto(DEV_URL);

    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /your program\. smarter every session\./i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Get Started" })).toHaveCount(0);

    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /what's your gender/i })).toHaveCount(0);
  });
});
