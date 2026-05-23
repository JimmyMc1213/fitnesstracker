import { test, expect } from "@playwright/test";

import { fuelQuickLogPersistSeed, seedPersist } from "./helpers/seed";

test("Home fuel quick-log preset updates protein progress", async ({ page }) => {
  await seedPersist(page, fuelQuickLogPersistSeed());
  await page.goto("/");

  await expect(page.getByText("20 / 180g")).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Log fuel on Nutrition tab" }).click();
  await expect(page.getByText("Quick log fuel")).toBeVisible();
  await page.getByRole("button", { name: "Log +25g protein" }).click();

  await expect(page.getByText("Quick log fuel")).not.toBeVisible();
  await expect(page.getByText("45 / 180g")).toBeVisible();
});
