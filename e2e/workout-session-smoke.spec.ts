import { test, expect } from "@playwright/test";

import { seedPersist, workoutSessionPersistSeed } from "./helpers/seed";

test("Workout tab: start session → log set → finish → summary", async ({ page }) => {
  await seedPersist(page, workoutSessionPersistSeed());
  await page.goto("/");

  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Workout" }).click();
  await expect(page.getByText("Start Workout")).toBeVisible();

  await page.getByRole("button", { name: /E2E Upper strength/i }).click();
  await expect(page.getByRole("button", { name: "Start workout" })).toBeVisible();
  await page.getByRole("button", { name: "Start workout" }).click();

  await expect(page.getByRole("button", { name: "Finish workout" })).toBeVisible();
  await page.getByRole("button", { name: "Done" }).first().click();
  await page.getByRole("button", { name: "Finish workout" }).click();

  await expect(page.getByText("Workout complete")).toBeVisible();
  await expect(page.getByText("Nice work, session saved")).toBeVisible();
  await expect(page.getByRole("heading", { name: "E2E Upper strength" })).toBeVisible();
});
