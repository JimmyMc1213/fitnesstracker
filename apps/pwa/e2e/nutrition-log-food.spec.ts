import { test, expect } from "@playwright/test";

import { fuelQuickLogPersistSeed, mealLogPersistSeed, seedPersist } from "./helpers/seed";

test("Nutrition tab: rings + hydration only, FAB opens Log Food, manual add updates totals", async ({ page }) => {
  await seedPersist(page, fuelQuickLogPersistSeed());
  await page.goto("/");

  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Nutrition" }).click();
  await expect(page.locator(".h-title", { hasText: "Nutrition" })).toBeVisible();

  await expect(page.getByRole("tablist", { name: "Nutrition sections" })).toHaveCount(0);
  await expect(page.getByText("1800 cal left")).toBeVisible();

  await page.getByLabel("Log food").click();
  await expect(page.getByRole("heading", { name: "Log Food" })).toBeVisible();

  await page.getByRole("button", { name: "Manual Add" }).click();
  await page.getByLabel("Food name").fill("E2E shake");
  await page.getByLabel("Calories").fill("300");
  await page.getByLabel("Protein grams").fill("40");
  await page.locator("button.tap", { hasText: "Log food" }).click();

  await expect(page.getByText("Food added")).toBeVisible();
  await page.getByRole("button", { name: "Close log food" }).click();
  await expect(page.getByRole("heading", { name: "Log Food" })).not.toBeVisible();
  await expect(page.getByText("1500 cal left")).toBeVisible();
  await expect(page.getByText("60 / 150g")).toBeVisible();
  await expect(page.getByText("E2E shake")).toBeVisible();
  const shakeRow = page.getByRole("button", { name: "Edit E2E shake" });
  const box = await shakeRow.boundingBox();
  if (!box) throw new Error("E2E shake row not found");
  const startX = box.x + box.width - 8;
  const y = box.y + box.height / 2;
  await shakeRow.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "mouse", clientX: startX, clientY: y, button: 0 });
  await shakeRow.dispatchEvent("pointermove", { pointerId: 1, pointerType: "mouse", clientX: startX - 80, clientY: y, button: 0 });
  await shakeRow.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", clientX: startX - 80, clientY: y, button: 0 });
  await expect(page.getByText("E2E shake")).not.toBeVisible();
  await expect(page.getByText("1800 cal left")).toBeVisible();
});

test("Log Food: search → serving → log updates nutrition rings", async ({ page }) => {
  await seedPersist(page, fuelQuickLogPersistSeed());
  await page.goto("/");

  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Nutrition" }).click();
  await page.getByLabel("Log food").click();
  await expect(page.getByRole("heading", { name: "Log Food" })).toBeVisible();

  await page.getByLabel("Search foods").fill("chicken");
  await expect(page.getByText("Grilled chicken breast")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Grilled chicken breast 165" }).click();
  await expect(page.getByRole("heading", { name: "Choose serving" })).toBeVisible();
  await page.locator("button.tap", { hasText: "Log food" }).click();

  await expect(page.getByText("Food added")).toBeVisible();
  await page.getByRole("button", { name: "Close log food" }).click();
  await expect(page.getByRole("heading", { name: "Log Food" })).not.toBeVisible();
  await expect(page.getByText("1427 cal left")).toBeVisible();
  await expect(page.getByText("90 / 150g")).toBeVisible();
  await expect(page.getByRole("button", { name: /Grilled Chicken Breast/i })).toBeVisible();
});

test("Log Food: saved meal from My meals updates nutrition rings", async ({ page }) => {
  await seedPersist(page, mealLogPersistSeed());
  await page.goto("/");

  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Nutrition" }).click();
  await expect(page.getByText("1800 cal left")).toBeVisible();
  await expect(page.getByText("20 / 150g")).toBeVisible();

  await page.getByLabel("Log food").click();
  await expect(page.getByRole("heading", { name: "Log Food" })).toBeVisible();
  await page.getByRole("tab", { name: "My meals" }).click();
  await expect(page.getByText("E2E prep bowl")).toBeVisible();
  await page.getByRole("button", { name: /E2E prep bowl 350 cal/i }).click();

  await expect(page.getByText("Food added")).toBeVisible();
  await page.getByRole("button", { name: "Close log food" }).click();
  await expect(page.getByRole("heading", { name: "Log Food" })).not.toBeVisible();
  await expect(page.getByText("1450 cal left")).toBeVisible();
  await expect(page.getByText("63 / 150g")).toBeVisible();
  await expect(page.getByText("E2E prep bowl")).toBeVisible();
});

test("Log Food: recently logged + re-log updates nutrition rings", async ({ page }) => {
  await seedPersist(page, fuelQuickLogPersistSeed());
  await page.goto("/");

  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Nutrition" }).click();
  await expect(page.getByText("1800 cal left")).toBeVisible();
  await expect(page.getByText("20 / 150g")).toBeVisible();

  await page.getByLabel("Log food").click();
  await expect(page.getByRole("heading", { name: "Log Food" })).toBeVisible();
  await expect(page.getByText("Recently logged").first()).toBeVisible();
  await page.getByRole("button", { name: "Log again Light breakfast" }).click();

  await expect(page.getByText("Food added")).toBeVisible();
  await page.getByRole("button", { name: "Close log food" }).click();
  await expect(page.getByRole("heading", { name: "Log Food" })).not.toBeVisible();
  await expect(page.getByText("1600 cal left")).toBeVisible();
  await expect(page.getByText("40 / 150g")).toBeVisible();
});
