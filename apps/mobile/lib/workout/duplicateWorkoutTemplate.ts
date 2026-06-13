import type { WorkoutRoutineTemplate } from "@newyouai/types";

/** Deep-clone a saved routine with a new id and fresh exercise ids. */
export function duplicateWorkoutTemplate(template: WorkoutRoutineTemplate): WorkoutRoutineTemplate {
  const t = Date.now();
  const baseName = template.name.trim() || "Workout";
  return {
    ...template,
    id: `tpl_${t}-${Math.random().toString(36).slice(2, 9)}`,
    name: `${baseName} copy`,
    exercises: template.exercises.map((e, i) => ({
      ...e,
      id: `te${t}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      sets: e.sets.map((s) => ({ ...s })),
    })),
    warmupItems: template.warmupItems ? template.warmupItems.map((item) => ({ ...item })) : undefined,
  };
}
