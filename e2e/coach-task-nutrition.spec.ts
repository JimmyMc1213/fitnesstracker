import { test, expect } from "@playwright/test";

import { fuelQuickLogPersistSeed, seedPersist } from "./helpers/seed";

test("coach task Log fuel opens Nutrition tab and Log Food overlay", async ({ page }) => {
  await seedPersist(page, fuelQuickLogPersistSeed());
  await page.goto("/");

  await expect(page.getByText("Today's plan")).toBeVisible();
  await page.getByRole("button", { name: /Log fuel/i }).first().click();

  await expect(page.getByRole("heading", { name: "Log Food" })).toBeVisible();
  await page.getByRole("button", { name: "Close log food" }).click();
  await expect(page.locator(".h-title", { hasText: "Nutrition" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Nutrition" })).toHaveAttribute(
    "aria-current",
    "true",
  );
});
