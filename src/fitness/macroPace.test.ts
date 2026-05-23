import { describe, expect, it } from "vitest";

import { buildMacroPaceSnapshot } from "./macroPace";
import { buildCoachContext } from "./coachEngine";
import { minimalAppState } from "./testFixtures/appStateFixtures";

const MONDAY = new Date(2026, 4, 18, 18, 0); // 6pm
const MONDAY_KEY = "2026-05-18";

describe("buildMacroPaceSnapshot", () => {
  it("reports behind pace when protein is low late in the day", () => {
    const state = minimalAppState({
      nutritionTargets: { cal: 2500, p: 180, c: 250, f: 70 },
      nutritionManualByDay: { [MONDAY_KEY]: { cal: 400, p: 40, c: 0, f: 0 } },
    });
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const pace = buildMacroPaceSnapshot(ctx);

    expect(pace.status).toBe("behind");
    expect(pace.hint).toMatch(/behind pace/i);
  });

  it("reports hit when protein floor is met", () => {
    const state = minimalAppState({
      nutritionTargets: { cal: 2500, p: 180, c: 250, f: 70 },
      nutritionManualByDay: { [MONDAY_KEY]: { cal: 2000, p: 180, c: 0, f: 0 } },
    });
    const ctx = buildCoachContext(state, MONDAY_KEY, MONDAY);
    const pace = buildMacroPaceSnapshot(ctx);

    expect(pace.status).toBe("hit");
    expect(pace.hint).toMatch(/floor hit/i);
  });
});
