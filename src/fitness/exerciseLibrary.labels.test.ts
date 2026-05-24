import { describe, expect, it } from "vitest";

import { EXERCISE_EQUIPMENT_LABELS } from "./exerciseLabels";
import exerciseLibrary from "./exerciseLibrary";

describe("exerciseLibrary equipment labels", () => {
  it("every exercise uses a valid equipment label", () => {
    for (const ex of exerciseLibrary) {
      expect(EXERCISE_EQUIPMENT_LABELS).toContain(ex.label);
    }
  });

  it("labels match explicit equipment in the exercise name", () => {
    const mismatches: string[] = [];

    for (const ex of exerciseLibrary) {
      const name = ex.name.toLowerCase();

      if (name.includes("barbell") && ex.label !== "Barbell") {
        mismatches.push(`${ex.id}: name says barbell but label is ${ex.label}`);
      }
      if (name.includes("dumbbell") && ex.label !== "Dumbbell") {
        mismatches.push(`${ex.id}: name says dumbbell but label is ${ex.label}`);
      }
      if (name.includes("cable") && ex.label !== "Cable") {
        mismatches.push(`${ex.id}: name says cable but label is ${ex.label}`);
      }
      if (name.includes("kettlebell") && ex.label !== "Kettlebell") {
        mismatches.push(`${ex.id}: name says kettlebell but label is ${ex.label}`);
      }
      if (name.includes("ez bar") && ex.label !== "EZ bar") {
        mismatches.push(`${ex.id}: name says ez bar but label is ${ex.label}`);
      }
      if (name.includes("trap bar") && ex.label === "Barbell") {
        mismatches.push(`${ex.id}: trap bar must not be labeled Barbell`);
      }
      if (
        /machine|pec deck|hack squat|leg press|lat pulldown|assisted pull-up|lying leg curl|seated leg curl|standing calf raise|seated calf raise/.test(
          name,
        ) &&
        ex.label !== "Machine"
      ) {
        mismatches.push(`${ex.id}: machine-type name but label is ${ex.label}`);
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("canonical bodyweight movements are labeled Bodyweight", () => {
    const bodyweightNames = new Set([
      "Push-up",
      "Weighted push-up",
      "Pike push-up",
      "Handstand push-up",
      "Pull-up",
      "Chin-up",
      "Neutral grip pull-up",
      "Inverted row",
      "Bodyweight squat",
      "Pistol squat",
      "Chest dips",
      "Tricep dips",
      "Diamond push-up",
      "Plank",
      "Dead bug",
      "Hanging leg raise",
      "Lying leg raise",
      "Glute bridge",
      "Nordic hamstring curl",
      "Chin-up (bicep focus)",
    ]);

    for (const ex of exerciseLibrary) {
      if (bodyweightNames.has(ex.name)) {
        expect(ex.label, ex.id).toBe("Bodyweight");
      }
    }
  });
});
