import { test, expect } from "@playwright/test";

import { fuelQuickLogPersistSeed, seedPersist } from "./helpers/seed";

test("Nutrition tab: rings + hydration only, FAB opens Log Food, manual add updates totals", async ({ page }) => {
  await seedPersist(page, fuelQuickLogPersistSeed());
  await page.goto("/");

  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Nutrition" }).click();
  await expect(page.locator(".h-title", { hasText: "Nutrition" })).toBeVisible();

  await expect(page.getByRole("tablist", { name: "Nutrition sections" })).toHaveCount(0);
  await expect(page.getByText("2000 kcal left")).toBeVisible();

  await page.getByLabel("Log food").click();
  await expect(page.getByRole("heading", { name: "Log Food" })).toBeVisible();

  await page.getByRole("button", { name: "Manual Add" }).click();
  await page.getByLabel("Food name").fill("E2E shake");
  await page.getByLabel("Calories").fill("300");
  await page.getByLabel("Protein grams").fill("40");
  await page.locator("button.tap", { hasText: "Log food" }).click();

  await expect(page.getByRole("heading", { name: "Log Food" })).not.toBeVisible();
  await expect(page.getByText("1700 kcal left")).toBeVisible();
  await expect(page.getByText("60 / 180g")).toBeVisible();
  await expect(page.getByText("E2E shake")).toBeVisible();
  await page.getByRole("button", { name: "Remove E2E shake" }).click();
  await expect(page.getByText("E2E shake")).not.toBeVisible();
  await expect(page.getByText("2000 kcal left")).toBeVisible();
});

test("Log Food: search → serving → log updates nutrition rings", async ({ page }) => {
  await seedPersist(page, fuelQuickLogPersistSeed());
  await page.goto("/");

  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Nutrition" }).click();
  await page.getByLabel("Log food").click();
  await expect(page.getByRole("heading", { name: "Log Food" })).toBeVisible();

  await page.getByLabel("Search foods").fill("chicken");
  await expect(page.getByText("Grilled chicken breast")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /Grilled chicken breast/i }).click();
  await expect(page.getByRole("heading", { name: "Choose serving" })).toBeVisible();
  await page.locator("button.tap", { hasText: "Log food" }).click();

  await expect(page.getByRole("heading", { name: "Log Food" })).not.toBeVisible();
  await expect(page.getByText("1835 kcal left")).toBeVisible();
  await expect(page.getByText("51 / 180g")).toBeVisible();
});
