import { test, expect } from "@playwright/test";

import { fuelQuickLogPersistSeed, seedPersist } from "./helpers/seed";

test("coach task Log fuel opens the Nutrition tab", async ({ page }) => {
  await seedPersist(page, fuelQuickLogPersistSeed());
  await page.goto("/");

  await page.getByRole("button", { name: /Log fuel/i }).first().click();

  await expect(page.locator(".h-title", { hasText: "Nutrition" })).toBeVisible();
  await expect(page.getByText("1800 cal left")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Nutrition" })).toHaveAttribute(
    "aria-current",
    "true",
  );
});
