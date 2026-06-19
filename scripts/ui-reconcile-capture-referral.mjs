#!/usr/bin/env node
/**
 * One-off capture for UI reconcile: referral step (step 4).
 * Usage: node scripts/ui-reconcile-capture-referral.mjs [pwa|rn-before|rn-after]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, devices } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".ui-reconcile", "referral");
const FITNESS_KEY = "fitcoach:persist:v1";
const DRAFT_KEY = "gymmy_onboarding_draft";

const MAINTAIN_PROFILE = {
  goal: "maintain",
  heightIn: 70,
  weightLbs: 180,
  age: 30,
  dateOfBirth: "1996-06-15",
  gender: "male",
  activityLevel: "moderate",
  workoutDaysPerWeek: 4,
  trainingWeekdays: ["Mon", "Wed", "Fri", "Sat"],
};

function makeDraft(stepIndex) {
  return {
    version: 18,
    stepIndex,
    updatedAtIso: "2026-06-18T12:00:00.000Z",
    displayName: "Alex",
    unitPreferences: { weightUnit: "lbs", heightUnit: "ft_in", volumeUnit: "oz" },
    experienceLevel: "intermediate",
    equipmentSetup: "full_gym",
    sessionLength: "60_90",
    profile: MAINTAIN_PROFILE,
    draftTemplates: [
      { id: "mon-upper", dayLabel: "Mon", name: "Upper strength", focus: "Push focus", exercises: [] },
      { id: "wed-lower", dayLabel: "Wed", name: "Lower strength", focus: "Leg focus", exercises: [] },
      { id: "fri-upper", dayLabel: "Fri", name: "Upper hypertrophy", focus: "Volume", exercises: [] },
      { id: "sat-conditioning", dayLabel: "Sat", name: "Conditioning", focus: "Engine", exercises: [] },
    ],
    macros: { cal: 2100, p: 160, c: 200, f: 60 },
    notificationPrefs: {
      workoutReminderEnabled: false,
      workoutReminderTime: "08:00",
      nutritionCheckInEnabled: false,
      nutritionCheckInTime: "20:00",
      lastFiredWorkoutReminderDateKey: null,
      lastFiredNutritionReminderDateKey: null,
    },
    theme: "dark",
    futureYou: { photoSkipped: true },
  };
}

async function capturePwa() {
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, "pwa.png");
  const baseURL = process.env.PWA_BASE_URL ?? "http://127.0.0.1:4173";
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices["iPhone 14"],
    colorScheme: "dark",
  });
  const page = await context.newPage();
  const draft = makeDraft(4);
  const draftJson = JSON.stringify(draft);
  const fitnessJson = JSON.stringify({
    onboardingComplete: false,
    displayName: "Alex",
    theme: "dark",
    onboardingDraft: draft,
  });
  await page.addInitScript(
    ([fitnessKey, draftKey, fitnessPayload, draftPayload]) => {
      localStorage.setItem(fitnessKey, fitnessPayload);
      localStorage.setItem(draftKey, draftPayload);
    },
    [FITNESS_KEY, DRAFT_KEY, fitnessJson, draftJson],
  );
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const title = page.getByRole("heading", { name: "Where did you hear about us?" });
  try {
    await title.waitFor({ timeout: 15000 });
  } catch {
    const debug = path.join(outDir, "pwa-debug.png");
    await page.screenshot({ path: debug, fullPage: true });
    const bodyText = await page.locator("body").innerText();
    console.error("PWA did not reach referral step. Debug screenshot:", debug);
    console.error("Body text (first 500 chars):", bodyText.slice(0, 500));
    throw new Error("PWA referral step not visible");
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: out, fullPage: false });
  await browser.close();
  console.log(out);
}

function captureRn(label) {
  const out = path.join(outDir, `${label}.png`);
  const shot = spawnSync("xcrun", ["simctl", "io", "booted", "screenshot", out], {
    encoding: "utf8",
  });
  if (shot.status !== 0) {
    console.error(shot.stderr || shot.stdout);
    process.exit(1);
  }
  console.log(out);
}

const mode = process.argv[2] ?? "pwa";
if (mode === "pwa") {
  await capturePwa();
} else if (mode === "rn-before" || mode === "rn-after") {
  captureRn(mode);
} else {
  console.error(`Unknown mode: ${mode}`);
  process.exit(1);
}
