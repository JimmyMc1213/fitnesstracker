import { describe, expect, it, vi } from "vitest";

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
