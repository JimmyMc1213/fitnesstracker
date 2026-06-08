import { describe, expect, it } from "vitest";

import {
  catalogExerciseGroupsForEquipment,
  catalogExercisesForEquipment,
  expansionCatalogExercisesForEquipment,
  programCatalogExercisesForEquipment,
} from "./exerciseCatalog";
import exerciseExpansion from "./exerciseExpansion";
import exerciseLibrary from "./exerciseLibrary";

describe("exerciseCatalog", () => {
  it("program catalog only includes core library exercises", () => {
    const program = programCatalogExercisesForEquipment("full_gym");
    const expansion = expansionCatalogExercisesForEquipment("full_gym");

    expect(program.length).toBeGreaterThan(0);
    expect(expansion.length).toBeGreaterThan(0);
    expect(program.length + expansion.length).toBe(catalogExercisesForEquipment("full_gym").length);

    for (const row of program) {
      expect(exerciseLibrary.some((ex) => ex.name === row.name)).toBe(true);
      expect(exerciseExpansion.some((ex) => ex.name === row.name)).toBe(false);
    }
    for (const row of expansion) {
      expect(exerciseExpansion.some((ex) => ex.name === row.name)).toBe(true);
      expect(exerciseLibrary.some((ex) => ex.name === row.name)).toBe(false);
    }
  });

  it("groups program and expansion separately", () => {
    const groups = catalogExerciseGroupsForEquipment("full_gym");
    expect(groups.program.map((e) => e.name)).not.toEqual(groups.expansion.map((e) => e.name));
  });
});
