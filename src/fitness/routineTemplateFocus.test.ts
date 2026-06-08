import { describe, expect, it } from "vitest";

import { buildRoutinePreviewCoachBrief } from "./preWorkoutCoachBrief";
import { resolveRoutineFocusOnSave, templateFocusFromExercises } from "./routineTemplateFocus";
import type { WorkoutExercise } from "./types";

const bench: WorkoutExercise = {
  id: "1",
  name: "Bench Press",
  target: "3 x 8-12",
  sets: [{ w: 0, r: 12, done: false }],
};

const row: WorkoutExercise = {
  id: "2",
  name: "Barbell Row",
  target: "3 x 8-12",
  sets: [{ w: 0, r: 12, done: false }],
};

describe("templateFocusFromExercises", () => {
  it("builds preview copy from exercise names", () => {
    expect(templateFocusFromExercises([bench, row])).toBe("Bench Press · Barbell Row");
  });

  it("truncates long lists", () => {
    const exercises = [
      bench,
      row,
      { ...bench, id: "3", name: "Squat" },
      { ...bench, id: "4", name: "Curl" },
    ];
    expect(templateFocusFromExercises(exercises)).toBe("Bench Press · Barbell Row · Squat · +1 more");
  });
});

describe("resolveRoutineFocusOnSave", () => {
  it("refreshes focus from exercises when coach note was not edited", () => {
    expect(resolveRoutineFocusOnSave("Bench Press · Old Move", false, [bench, row])).toBe(
      "Bench Press · Barbell Row",
    );
  });

  it("keeps a manually edited coach note", () => {
    expect(resolveRoutineFocusOnSave("Heavy chest day", true, [bench, row])).toBe("Heavy chest day");
  });
});

describe("buildRoutinePreviewCoachBrief", () => {
  it("uses the template focus as coach rationale", () => {
    const brief = buildRoutinePreviewCoachBrief({
      id: "push",
      name: "Push",
      dayLabel: "Mon",
      focus: "Bench Press · Overhead Press",
      exercises: [bench],
    });

    expect(brief?.rationale).toBe("Bench Press · Overhead Press");
    expect(brief?.headline).toMatch(/Push/);
  });

  it("uses today's headline when previewing today's workout", () => {
    const brief = buildRoutinePreviewCoachBrief(
      {
        id: "push",
        name: "Push",
        dayLabel: "Mon",
        focus: "Chest focus",
        exercises: [bench],
      },
      { isTodayWorkout: true, todayHeadline: "Push, progression window" },
    );

    expect(brief?.headline).toBe("Push, progression window");
    expect(brief?.rationale).toBe("Chest focus");
  });
});
