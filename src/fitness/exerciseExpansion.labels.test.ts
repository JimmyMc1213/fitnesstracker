import { describe, expect, it } from "vitest";

import { EXERCISE_EQUIPMENT_LABELS } from "./exerciseLabels";
import exerciseExpansion from "./exerciseExpansion";
import exerciseLibrary from "./exerciseLibrary";

describe("exerciseExpansion equipment labels", () => {
  it("every expansion exercise uses a valid equipment label", () => {
    for (const ex of exerciseExpansion) {
      expect(EXERCISE_EQUIPMENT_LABELS).toContain(ex.label);
    }
  });

  it("expansion ids and names do not collide with the program library", () => {
    const libIds = new Set(exerciseLibrary.map((ex) => ex.id));
    const libNames = new Set(exerciseLibrary.map((ex) => ex.name.toLowerCase()));

    for (const ex of exerciseExpansion) {
      expect(libIds.has(ex.id), ex.id).toBe(false);
      expect(libNames.has(ex.name.toLowerCase()), ex.name).toBe(false);
    }
  });
});
