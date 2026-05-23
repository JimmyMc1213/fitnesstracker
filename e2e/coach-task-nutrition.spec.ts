import { test, expect } from "@playwright/test";

import { fuelQuickLogPersistSeed, seedPersist } from "./helpers/seed";

test("coach task Log fuel opens quick-log then full Nutrition tab", async ({ page }) => {
  await seedPersist(page, fuelQuickLogPersistSeed());
  await page.goto("/");

  await expect(page.getByText("Today's plan")).toBeVisible();
  await page.getByRole("button", { name: /Log fuel/i }).first().click();

  await expect(page.getByText("Quick log fuel")).toBeVisible();
  await page.getByRole("button", { name: "Open full Nutrition log" }).click();

  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Nutrition" })).toHaveAttribute(
    "aria-current",
    "true",
  );
  await expect(page.getByRole("tablist", { name: "Nutrition sections" })).toBeVisible();
});
