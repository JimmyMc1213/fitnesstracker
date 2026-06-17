/** Equipment / variant tags for custom exercises, keeps labels consistent across workouts. */
export const EXERCISE_EQUIPMENT_LABELS = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Kettlebell",
  "Band",
  "EZ bar",
  "Smith machine",
  "Other",
] as const;

export type ExerciseEquipmentLabel = (typeof EXERCISE_EQUIPMENT_LABELS)[number];

const LABEL_OVERRIDES: Record<string, ExerciseEquipmentLabel> = {
  chin_up_bicep: "Bodyweight",
  overhead_tricep_extension: "Dumbbell",
  ab_wheel: "Other",
  trap_bar_deadlift: "Other",
  skull_crusher: "EZ bar",
  front_squat: "Barbell",
  good_morning: "Barbell",
  romanian_deadlift: "Barbell",
  tbar_row: "Barbell",
};

/** Derive display tag from library id + name (used when seeding the exercise library). */
export function inferExerciseEquipmentLabel(id: string, name: string): ExerciseEquipmentLabel {
  const override = LABEL_OVERRIDES[id];
  if (override) return override;

  const t = `${id} ${name}`.toLowerCase();
  if (t.includes("kettlebell")) return "Kettlebell";
  if (t.includes("ez bar") || t.includes("ez_bar")) return "EZ bar";
  if (t.includes("smith")) return "Smith machine";
  if (t.includes("band")) return "Band";
  if (t.includes("cable") || id === "face_pull" || id === "pallof_press") return "Cable";
  if (
    t.includes("machine") ||
    id.includes("pec_deck") ||
    id.includes("hack_squat") ||
    id.includes("leg_press") ||
    id.includes("lat_pulldown") ||
    id.includes("assisted_pullup") ||
    id.includes("lying_leg_curl") ||
    id.includes("seated_leg_curl") ||
    id.includes("standing_calf_raise") ||
    id.includes("seated_calf_raise") ||
    id.includes("leg_press_calf_raise")
  ) {
    return "Machine";
  }
  if (t.includes("trap bar") || id.includes("trap_bar")) return "Other";
  if (
    t.includes("barbell") ||
    id.includes("tbar") ||
    id.includes("good_morning") ||
    id.includes("close_grip_bench") ||
    (id.includes("hip_thrust") && t.includes("barbell")) ||
    (id.includes("romanian_deadlift") && !t.includes("dumbbell")) ||
    id.includes("front_squat") ||
    id.includes("overhead_press_barbell")
  ) {
    return "Barbell";
  }
  if (id.includes("skull_crusher")) return "EZ bar";
  if (
    t.includes("dumbbell") ||
    id.includes("goblet") ||
    id.includes("arnold") ||
    id.includes("hammer_curl") ||
    id.includes("kickback") ||
    id.includes("bulgarian") ||
    id === "lunge" ||
    id === "single_leg_rdl" ||
    id === "single_leg_calf_raise"
  ) {
    return "Dumbbell";
  }
  if (
    t.includes("push-up") ||
    t.includes("pushup") ||
    id.includes("pullup") ||
    id.includes("chinup") ||
    id.includes("inverted_row") ||
    id.includes("pistol") ||
    id.includes("bodyweight") ||
    id.includes("dips") ||
    id.includes("plank") ||
    id.includes("dead_bug") ||
    id.includes("hanging_leg") ||
    id.includes("lying_leg_raise") ||
    id.includes("russian_twist") ||
    id.includes("nordic_curl") ||
    id.includes("glute_bridge") ||
    id.includes("diamond") ||
    id.includes("handstand") ||
    id.includes("pike")
  ) {
    return "Bodyweight";
  }
  return "Other";
}
