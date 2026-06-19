#!/usr/bin/env node
/**
 * Generalized UI-reconcile capture for onboarding screens (steps 101+).
 *
 * Usage:
 *   node scripts/ui-reconcile-capture-onboarding.mjs pwa <screenId>
 *   node scripts/ui-reconcile-capture-onboarding.mjs rn-before <screenId>
 *   node scripts/ui-reconcile-capture-onboarding.mjs rn-after <screenId>
 *   node scripts/ui-reconcile-capture-onboarding.mjs inject <screenId>   # write draft to simulator AsyncStorage
 *   node scripts/ui-reconcile-capture-onboarding.mjs pwa-all             # capture all screens
 *   node scripts/ui-reconcile-capture-onboarding.mjs rn-all-before       # take before screenshots for all screens
 *
 * Preconditions for RN capture:
 *   - iPhone 17 simulator must be booted with the NewYouAI dev client installed
 *   - Metro dev server must be running (npm run dev:onboarding or similar)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, devices } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "screens.manifest.json");

const FITNESS_KEY = "fitcoach:persist:v1";
const DRAFT_KEY = "gymmy_onboarding_draft";

// RN AsyncStorage — filled by detectRnStoragePath()
let RN_STORAGE_DIR = null;

// ---------------------------------------------------------------------------
// Shared profile used across all step seeds
// ---------------------------------------------------------------------------
const BASE_PROFILE = {
  goal: "cut",
  heightIn: 70,
  weightLbs: 185,
  goalWeightLbs: 170,
  pace: "balanced",
  age: 28,
  dateOfBirth: "1997-06-15",
  gender: "male",
  activityLevel: "moderate",
  workoutDaysPerWeek: 4,
  trainingWeekdays: ["Mon", "Wed", "Fri", "Sat"],
  referralSource: "instagram",
  barriers: ["motivation"],
  dietaryRestrictions: ["none"],
  trainingStyle: "strength",
};

const BASE_UNIT_PREFS = { weightUnit: "lbs", heightUnit: "ft_in", volumeUnit: "oz" };

const BASE_NOTIFICATION_PREFS = {
  workoutReminderEnabled: false,
  workoutReminderTime: "08:00",
  nutritionCheckInEnabled: false,
  nutritionCheckInTime: "20:00",
  morningCheckInEnabled: false,
  morningCheckInTime: "06:30",
  weeklyReviewEnabled: false,
  weeklyReviewTime: "08:00",
  lastFiredWorkoutReminderDateKey: null,
  lastFiredNutritionReminderDateKey: null,
};

const DRAFT_TEMPLATES = [
  { id: "mon-upper", dayLabel: "Mon", name: "Upper strength", focus: "Bench · Pulldown · Accessories", exercises: [] },
  { id: "wed-lower", dayLabel: "Wed", name: "Lower strength", focus: "Squat · Hinge · Accessories", exercises: [] },
  { id: "fri-upper", dayLabel: "Fri", name: "Upper hypertrophy", focus: "Volume · Shoulders · Arms", exercises: [] },
  { id: "sat-cardio", dayLabel: "Sat", name: "Conditioning", focus: "HIIT · Mobility", exercises: [] },
];

const BASE_MACROS = { cal: 2200, p: 175, c: 225, f: 65 };

const FUTURE_YOU_UPLOADED = {
  photoSkipped: false,
  photoUploaded: true,
  photoStoragePath: "e2e/mock/source.jpg",
  onboardingGoalLocked: true,
  photoAiConsentAt: "2026-06-18T12:00:00.000Z",
};

const FUTURE_YOU_WITH_MOTIVATION = {
  ...FUTURE_YOU_UPLOADED,
  motivationId: "look_confident",
  motivationIsGeneric: false,
  generationJobId: "mock-job-123",
  generationStatus: "generating",
};

// ---------------------------------------------------------------------------
// Build a complete OnboardingDraft for a given screen seed
// ---------------------------------------------------------------------------
function buildDraft(seed) {
  const stepIndex = seed.stepIndex;
  const futureYou = seed.futureYou ?? (stepIndex >= 11 ? FUTURE_YOU_WITH_MOTIVATION : FUTURE_YOU_UPLOADED);

  return {
    version: 18,
    stepIndex,
    updatedAtIso: "2026-06-18T14:00:00.000Z",
    displayName: seed.displayName ?? "Alex",
    unitPreferences: seed.unitPreferences ?? BASE_UNIT_PREFS,
    experienceLevel: seed.experienceLevel ?? "intermediate",
    equipmentSetup: seed.equipmentSetup ?? "full_gym",
    sessionLength: seed.sessionLength ?? "60_90",
    profile: { ...BASE_PROFILE, ...seed.profileOverride },
    draftTemplates: seed.draftTemplates ?? (stepIndex >= 16 ? DRAFT_TEMPLATES : []),
    macros: seed.macros ?? (stepIndex >= 21 ? BASE_MACROS : { cal: 0, p: 0, c: 0, f: 0 }),
    notificationPrefs: seed.notificationPrefs ?? BASE_NOTIFICATION_PREFS,
    theme: seed.theme ?? "dark",
    futureYou,
    subscriptionTier: seed.subscriptionTier ?? null,
  };
}

// ---------------------------------------------------------------------------
// Load manifest
// ---------------------------------------------------------------------------
function loadManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function findScreen(manifest, screenId) {
  const screen = manifest.screens.find((s) => s.id === screenId);
  if (!screen) throw new Error(`Screen '${screenId}' not found in manifest`);
  return screen;
}

// ---------------------------------------------------------------------------
// PWA capture via Playwright
// ---------------------------------------------------------------------------
async function capturePwa(screenId) {
  const manifest = loadManifest();
  const screen = findScreen(manifest, screenId);
  const outDir = path.join(root, screen.outputDir);
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, "pwa.png");
  const baseURL = process.env.PWA_BASE_URL ?? "http://127.0.0.1:4173";

  const draft = buildDraft(screen.pwaCapture.seed ?? { stepIndex: screen.pwaStep });
  const draftJson = JSON.stringify(draft);
  const fitnessJson = JSON.stringify({
    onboardingComplete: false,
    displayName: draft.displayName,
    theme: draft.theme,
    onboardingDraft: draft,
  });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices["iPhone 14"],
    colorScheme: "dark",
  });
  const page = await context.newPage();

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

  const waitFor = screen.pwaCapture.waitFor;
  if (waitFor) {
    try {
      // Try heading first, then any text
      const headingLocator = page.getByRole("heading", { name: waitFor, exact: false });
      const textLocator = page.getByText(waitFor, { exact: false });
      const combined = headingLocator.or(textLocator).first();
      await combined.waitFor({ timeout: 15000 });
    } catch {
      const debug = path.join(outDir, "pwa-debug.png");
      await page.screenshot({ path: debug, fullPage: true });
      const bodyText = await page.locator("body").innerText();
      console.error(`PWA screen '${screenId}' did not reach expected state. Debug: ${debug}`);
      console.error("Body (first 500):", bodyText.slice(0, 500));
      await browser.close();
      throw new Error(`PWA screen '${screenId}' not visible`);
    }
  }

  await page.waitForTimeout(600);
  await page.screenshot({ path: out, fullPage: false });
  await browser.close();
  console.log(`PWA captured → ${out}`);
  return out;
}

// ---------------------------------------------------------------------------
// RN capture via simctl
// ---------------------------------------------------------------------------
function detectRnStoragePath() {
  if (RN_STORAGE_DIR) return RN_STORAGE_DIR;
  const containerResult = spawnSync(
    "xcrun",
    ["simctl", "get_app_container", "booted", "app.newyouai.mobile", "data"],
    { encoding: "utf8" },
  );
  if (containerResult.status !== 0) {
    throw new Error("Cannot find app container. Is the simulator booted with the app installed?");
  }
  const containerPath = containerResult.stdout.trim();
  const storageDir = path.join(
    containerPath,
    "Library/Application Support/app.newyouai.mobile/RCTAsyncLocalStorage_V1",
  );
  if (!fs.existsSync(storageDir)) {
    throw new Error(`AsyncStorage dir not found at ${storageDir}. Run the app at least once first.`);
  }
  RN_STORAGE_DIR = storageDir;
  return storageDir;
}

function injectRnDraft(draft) {
  const storageDir = detectRnStoragePath();
  const manifestPath = path.join(storageDir, "manifest.json");
  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    // start fresh
  }
  existing["newyou_onboarding_draft"] = JSON.stringify(draft);
  existing["@newyouai/onboardingComplete"] = "false";
  // Also ensure dark theme is active to match PWA dark-mode captures
  existing["newyou_theme"] = "dark";
  fs.writeFileSync(manifestPath, JSON.stringify(existing), "utf8");
  console.log(`Injected draft stepIndex=${draft.stepIndex} → ${manifestPath}`);
}

function terminateApp() {
  spawnSync("xcrun", ["simctl", "terminate", "booted", "app.newyouai.mobile"]);
}

function launchApp() {
  spawnSync("xcrun", ["simctl", "launch", "booted", "app.newyouai.mobile"]);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function captureRn(label, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${label}.png`);
  const shot = spawnSync("xcrun", ["simctl", "io", "booted", "screenshot", out], { encoding: "utf8" });
  if (shot.status !== 0) {
    console.error(shot.stderr || shot.stdout);
    process.exit(1);
  }
  console.log(`RN captured → ${out}`);
  return out;
}

async function injectAndCapture(screenId, label) {
  const manifest = loadManifest();
  const screen = findScreen(manifest, screenId);
  const outDir = path.join(root, screen.outputDir);

  const draft = buildDraft(screen.pwaCapture?.seed ?? { stepIndex: screen.rnStep });
  injectRnDraft(draft);
  terminateApp();
  await sleep(800);
  launchApp();
  await sleep(10000); // wait for bundle load + state hydration
  captureRn(label, outDir);
}

// ---------------------------------------------------------------------------
// Batch helpers
// ---------------------------------------------------------------------------
async function pwaAll() {
  const manifest = loadManifest();
  for (const screen of manifest.screens) {
    console.log(`\n→ Capturing PWA: ${screen.id}`);
    await capturePwa(screen.id);
  }
}

async function rnAll(label) {
  const manifest = loadManifest();
  for (const screen of manifest.screens) {
    console.log(`\n→ Capturing RN (${label}): ${screen.id}`);
    await injectAndCapture(screen.id, label);
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const [, , mode, screenId] = process.argv;

if (mode === "pwa" && screenId) {
  await capturePwa(screenId);
} else if (mode === "rn-before" && screenId) {
  await injectAndCapture(screenId, "rn-before");
} else if (mode === "rn-after" && screenId) {
  await injectAndCapture(screenId, "rn-after");
} else if (mode === "inject" && screenId) {
  const manifest = loadManifest();
  const screen = findScreen(manifest, screenId);
  const draft = buildDraft(screen.pwaCapture?.seed ?? { stepIndex: screen.rnStep });
  injectRnDraft(draft);
  terminateApp();
  await sleep(600);
  launchApp();
  console.log("App relaunched — check simulator.");
} else if (mode === "pwa-all") {
  await pwaAll();
} else if (mode === "rn-all-before") {
  await rnAll("rn-before");
} else if (mode === "rn-all-after") {
  await rnAll("rn-after");
} else {
  console.error(`Usage:
  node scripts/ui-reconcile-capture-onboarding.mjs pwa <screenId>
  node scripts/ui-reconcile-capture-onboarding.mjs rn-before <screenId>
  node scripts/ui-reconcile-capture-onboarding.mjs rn-after <screenId>
  node scripts/ui-reconcile-capture-onboarding.mjs inject <screenId>
  node scripts/ui-reconcile-capture-onboarding.mjs pwa-all
  node scripts/ui-reconcile-capture-onboarding.mjs rn-all-before
  node scripts/ui-reconcile-capture-onboarding.mjs rn-all-after
`);
  process.exit(1);
}
