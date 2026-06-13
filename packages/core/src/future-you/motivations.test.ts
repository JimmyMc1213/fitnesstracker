import { describe, expect, it } from "vitest";

import {
  FUTURE_YOU_MOTIVATIONS,
  getFutureYouGenericMotivations,
  getFutureYouMotivationById,
  getFutureYouMotivationsForPicker,
  getFutureYouSpecificMotivations,
} from "./motivations";

describe("futureYouMotivations", () => {
  it("has no duplicate ids", () => {
    const ids = FUTURE_YOU_MOTIVATIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has generics for cut, bulk, and maintain", () => {
    for (const goal of ["cut", "bulk", "maintain"] as const) {
      const generics = getFutureYouGenericMotivations(goal, "other");
      expect(generics.length).toBeGreaterThanOrEqual(3);
      expect(generics.every((m) => m.isGeneric)).toBe(true);
      expect(generics.every((m) => m.goals.includes(goal))).toBe(true);
    }
  });

  it("has cut specifics for male and female", () => {
    const maleSpecifics = getFutureYouSpecificMotivations("cut", "male");
    const femaleSpecifics = getFutureYouSpecificMotivations("cut", "female");

    expect(maleSpecifics.some((m) => m.id === "cut_m_veins")).toBe(true);
    expect(femaleSpecifics.some((m) => m.id === "cut_f_wedding_dress")).toBe(true);
    expect(maleSpecifics.every((m) => !m.isGeneric)).toBe(true);
    expect(femaleSpecifics.every((m) => !m.isGeneric)).toBe(true);
  });

  it("has bulk and maintain specifics", () => {
    expect(getFutureYouSpecificMotivations("bulk", "male").length).toBeGreaterThanOrEqual(2);
    expect(getFutureYouSpecificMotivations("bulk", "female").length).toBeGreaterThanOrEqual(2);
    expect(getFutureYouSpecificMotivations("maintain", "other").length).toBeGreaterThanOrEqual(3);
  });

  it("wedding dress and veins have distinct prompt fragments", () => {
    const wedding = getFutureYouMotivationById("cut_f_wedding_dress");
    const veins = getFutureYouMotivationById("cut_m_veins");
    expect(wedding?.promptFragment).toBeTruthy();
    expect(veins?.promptFragment).toBeTruthy();
    expect(wedding?.promptFragment).not.toBe(veins?.promptFragment);
  });

  it("every picker chip has required fields", () => {
    for (const m of FUTURE_YOU_MOTIVATIONS) {
      expect(m.id.length).toBeGreaterThan(0);
      expect(m.label.length).toBeGreaterThan(0);
      expect(m.promptFragment.length).toBeGreaterThan(0);
      expect(m.loadingPhrase.length).toBeGreaterThan(0);
      expect(m.goals.length).toBeGreaterThan(0);
      expect(m.genders.length).toBeGreaterThan(0);
    }
  });

  it("filters motivations by goal and gender", () => {
    const cutMale = getFutureYouMotivationsForPicker("cut", "male");
    expect(cutMale.every((m) => m.goals.includes("cut"))).toBe(true);
    expect(cutMale.every((m) => m.genders.includes("male"))).toBe(true);
    expect(cutMale.some((m) => m.id === "cut_m_veins")).toBe(true);
    expect(cutMale.some((m) => m.id === "cut_f_wedding_dress")).toBe(false);

    const maintainOther = getFutureYouMotivationsForPicker("maintain", "other");
    expect(maintainOther.some((m) => m.id === "maintain_generic_glow")).toBe(true);
    expect(maintainOther.some((m) => m.id === "maintain_m_definition")).toBe(false);
  });
});
