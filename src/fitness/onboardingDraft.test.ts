import { describe, expect, it, vi } from "vitest";

import { clampOnboardingStepIndex, ONBOARDING_STEP_FUTURE_YOU_SUCCESS } from "./onboardingSteps";
import {
  buildOnboardingDraft,
  clearGymmyOnboardingDraft,
  clearOnboardingDraftStorage,
  GYMMY_ONBOARDING_DRAFT_KEY,
  initialOnboardingWizardDraft,
  mergeOnboardingDrafts,
  normalizeOnboardingDraft,
  ONBOARDING_DRAFT_VERSION,
  readGymmyOnboardingDraft,
  saveOnboardingDraftToLocalStorage,
  writeGymmyOnboardingDraft,
} from "./onboardingDraft";
import { buildAppStateFromPersisted } from "./buildAppState";
import { DEFAULT_ONBOARDING_PROFILE } from "./onboardingProfile";
import { DEFAULT_EQUIPMENT_SETUP } from "./equipmentSetup";
import { DEFAULT_EXPERIENCE_LEVEL } from "./experienceLevel";
import { FITNESS_LOCAL_STORAGE_KEY } from "./persistFitnessSlice";
import { DEFAULT_UNIT_PREFERENCES } from "./unitPreferences";

function mockLocalStorage() {
  const store = new Map<string, string>();
  const ls = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
  vi.stubGlobal("localStorage", ls);
  return store;
}

describe("onboardingDraft", () => {
  it("builds a versioned draft with timestamp", () => {
    const draft = buildOnboardingDraft({
      stepIndex: 3,
      displayName: "Alex",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    });
    expect(draft.version).toBe(ONBOARDING_DRAFT_VERSION);
    expect(draft.stepIndex).toBe(3);
    expect(draft.displayName).toBe("Alex");
    expect(draft.updatedAtIso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("normalizes valid draft and rejects unsupported version", () => {
    const raw = buildOnboardingDraft({
      stepIndex: 2,
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    });
    expect(normalizeOnboardingDraft(raw)?.stepIndex).toBe(2);
    expect(normalizeOnboardingDraft({ ...raw, version: 99 })).toBeNull();
  });

  it("migrates v3 draft step index after referral source screen insert", () => {
    const raw = {
      ...buildOnboardingDraft({
        stepIndex: 5,
        displayName: "Sam",
        unitPreferences: DEFAULT_UNIT_PREFERENCES,
        experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
        equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
        profile: DEFAULT_ONBOARDING_PROFILE,
      }),
      version: 3,
    };
    expect(normalizeOnboardingDraft(raw)?.stepIndex).toBe(7);
    const early = { ...raw, stepIndex: 2 };
    expect(normalizeOnboardingDraft(early)?.stepIndex).toBe(3);
  });

  it("migrates v8 draft step index when session duration screen is inserted", () => {
    const base = {
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    };
    const v8 = (stepIndex: number) =>
      normalizeOnboardingDraft({
        ...buildOnboardingDraft({ ...base, stepIndex }),
        version: 8,
      });

    expect(v8(13)?.stepIndex).toBe(14);
    expect(v8(14)?.stepIndex).toBe(17);
    expect(v8(20)?.stepIndex).toBe(23);
    expect(v8(24)?.stepIndex).toBe(26);
  });

  it("migrates v9 draft step index when plan-building screen is inserted", () => {
    const base = {
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    };
    const v9 = (stepIndex: number) =>
      normalizeOnboardingDraft({
        ...buildOnboardingDraft({ ...base, stepIndex }),
        version: 9,
      });

    expect(v9(19)?.stepIndex).toBe(20);
    expect(v9(20)?.stepIndex).toBe(21);
    expect(v9(24)?.stepIndex).toBe(25);
    expect(v9(25)?.stepIndex).toBe(26);
  });

  it("migrates v11 draft step index when edit split screen is removed", () => {
    const base = {
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    };
    const v11 = (stepIndex: number) =>
      normalizeOnboardingDraft({
        ...buildOnboardingDraft({ ...base, stepIndex }),
        version: 11,
      });

    expect(v11(23)?.stepIndex).toBe(23);
    expect(v11(24)?.stepIndex).toBe(23);
    expect(v11(25)?.stepIndex).toBe(25);
    expect(v11(26)?.stepIndex).toBe(26);
  });

  it("migrates v12 draft step index when notification pre-prompt is inserted", () => {
    const base = {
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    };
    const v12 = (stepIndex: number) =>
      normalizeOnboardingDraft({
        ...buildOnboardingDraft({ ...base, stepIndex }),
        version: 12,
      });

    expect(v12(23)?.stepIndex).toBe(23);
    expect(v12(24)?.stepIndex).toBe(25);
    expect(v12(25)?.stepIndex).toBe(26);
    expect(v12(26)?.stepIndex).toBe(27);
  });

  it("migrates v13 draft step index when save progress is inserted before paywall", () => {
    const base = {
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    };
    const v13 = (stepIndex: number) =>
      normalizeOnboardingDraft({
        ...buildOnboardingDraft({ ...base, stepIndex }),
        version: 13,
      });

    expect(v13(26)?.stepIndex).toBe(26);
    expect(v13(27)?.stepIndex).toBe(27);
  });

  it("migrates v14 draft step index when theme picker is inserted after welcome", () => {
    const base = {
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    };
    const v14 = (stepIndex: number) =>
      normalizeOnboardingDraft({
        ...buildOnboardingDraft({ ...base, stepIndex }),
        version: 14,
      });

    expect(v14(0)?.stepIndex).toBe(0);
    expect(v14(1)?.stepIndex).toBe(2);
    expect(v14(27)?.stepIndex).toBe(27);
    expect(v14(28)?.stepIndex).toBe(27);
  });

  it("migrates v15 draft step index when coaching loop screen is removed", () => {
    const base = {
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    };
    const v15 = (stepIndex: number) =>
      normalizeOnboardingDraft({
        ...buildOnboardingDraft({ ...base, stepIndex }),
        version: 15,
      });

    expect(v15(20)?.stepIndex).toBe(20);
    expect(v15(21)?.stepIndex).toBe(20);
    expect(v15(22)?.stepIndex).toBe(21);
    expect(v15(29)?.stepIndex).toBe(27);
  });

  it("migrates v17 draft step index when save progress screen is removed", () => {
    const base = {
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    };
    const v17 = (stepIndex: number) =>
      normalizeOnboardingDraft({
        ...buildOnboardingDraft({ ...base, stepIndex }),
        version: 17,
      });

    expect(v17(26)?.stepIndex).toBe(26);
    expect(v17(27)?.stepIndex).toBe(27);
    expect(v17(28)?.stepIndex).toBe(27);
  });

  it("allows step 28 for post-pay success screen", () => {
    const draft = buildOnboardingDraft({
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
      stepIndex: ONBOARDING_STEP_FUTURE_YOU_SUCCESS,
      subscriptionTier: "pro",
    });
    expect(draft.stepIndex).toBe(28);
    expect(clampOnboardingStepIndex(28)).toBe(28);
  });

  it("migrates v7 draft step index when nutrition results move before training plan", () => {
    const base = {
      displayName: "Sam",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    };
    const v7 = (stepIndex: number) =>
      normalizeOnboardingDraft({
        ...buildOnboardingDraft({ ...base, stepIndex }),
        version: 7,
      });

    expect(v7(18)?.stepIndex).toBe(23);
    expect(v7(19)?.stepIndex).toBe(26);
    expect(v7(20)?.stepIndex).toBe(21);
    expect(v7(21)?.stepIndex).toBe(22);
    expect(v7(17)?.stepIndex).toBe(20);
    expect(v7(22)?.stepIndex).toBe(25);
  });

  it("migrates v2 draft step index to v3", () => {
    const raw = {
      ...buildOnboardingDraft({
        stepIndex: 7,
        displayName: "Sam",
        unitPreferences: DEFAULT_UNIT_PREFERENCES,
        experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
        equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
        profile: DEFAULT_ONBOARDING_PROFILE,
      }),
      version: 2,
    };
    expect(normalizeOnboardingDraft(raw)?.version).toBe(ONBOARDING_DRAFT_VERSION);
    expect(normalizeOnboardingDraft(raw)?.stepIndex).toBe(14);
  });

  it("merge prefers the draft with the later updatedAtIso", () => {
    const older = buildOnboardingDraft({
      stepIndex: 1,
      displayName: "Old",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    });
    const newer = {
      ...buildOnboardingDraft({
        stepIndex: 5,
        displayName: "New",
        unitPreferences: DEFAULT_UNIT_PREFERENCES,
        experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
        equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
        profile: DEFAULT_ONBOARDING_PROFILE,
      }),
      updatedAtIso: new Date(Date.parse(older.updatedAtIso) + 60_000).toISOString(),
    };
    const merged = mergeOnboardingDrafts(older, newer);
    expect(merged?.stepIndex).toBe(5);
    expect(merged?.displayName).toBe("New");
  });

  it("survives buildAppStateFromPersisted roundtrip", () => {
    const draft = buildOnboardingDraft({
      stepIndex: 3,
      displayName: "Alex",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    });
    const state = buildAppStateFromPersisted({ onboardingComplete: false, onboardingDraft: draft });
    expect(state.onboardingDraft?.stepIndex).toBe(3);
    expect(state.onboardingDraft?.displayName).toBe("Alex");
  });

  it("writes and reads gymmy_onboarding_draft key", () => {
    const store = mockLocalStorage();
    const draft = buildOnboardingDraft({
      stepIndex: 4,
      displayName: "Jimmy",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    });
    writeGymmyOnboardingDraft(draft);
    expect(store.has(GYMMY_ONBOARDING_DRAFT_KEY)).toBe(true);
    expect(readGymmyOnboardingDraft()?.stepIndex).toBe(4);
    expect(initialOnboardingWizardDraft(null)?.stepIndex).toBe(4);
    vi.unstubAllGlobals();
  });

  it("clears unsupported-version draft from dedicated key", () => {
    const store = mockLocalStorage();
    store.set(GYMMY_ONBOARDING_DRAFT_KEY, JSON.stringify({ version: 1, stepIndex: 3 }));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(readGymmyOnboardingDraft()).toBeNull();
    expect(store.has(GYMMY_ONBOARDING_DRAFT_KEY)).toBe(false);
    expect(warn).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("saveOnboardingDraftToLocalStorage writes dedicated key and fitness slice", () => {
    const store = mockLocalStorage();
    const draft = buildOnboardingDraft({
      stepIndex: 2,
      displayName: "Jimmy",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    });
    saveOnboardingDraftToLocalStorage(draft);
    expect(store.has(GYMMY_ONBOARDING_DRAFT_KEY)).toBe(true);
    const fitnessRaw = store.get(FITNESS_LOCAL_STORAGE_KEY);
    expect(fitnessRaw).toBeTruthy();
    expect(JSON.parse(fitnessRaw!).onboardingDraft.stepIndex).toBe(2);
    vi.unstubAllGlobals();
  });

  it("clearOnboardingDraftStorage removes dedicated key", () => {
    const store = mockLocalStorage();
    const draft = buildOnboardingDraft({
      stepIndex: 1,
      displayName: "Jimmy",
      unitPreferences: DEFAULT_UNIT_PREFERENCES,
      experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      equipmentSetup: DEFAULT_EQUIPMENT_SETUP,
      profile: DEFAULT_ONBOARDING_PROFILE,
    });
    saveOnboardingDraftToLocalStorage(draft);
    clearOnboardingDraftStorage();
    expect(store.has(GYMMY_ONBOARDING_DRAFT_KEY)).toBe(false);
    clearGymmyOnboardingDraft();
    vi.unstubAllGlobals();
  });
});
