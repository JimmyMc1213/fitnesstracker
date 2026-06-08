import type { EquipmentSetup, WorkoutExercise } from "./types";

function normalizeExerciseKey(name: string): string {
  return name.trim().toLowerCase();
}

/** Setups where the default template exercise can be performed as written. */
const COMPATIBLE_SETUPS: Record<string, EquipmentSetup[]> = {
  "bench press": ["full_gym", "home_gym"],
  "pull-up or lat pulldown": ["full_gym", "home_gym", "bodyweight_only"],
  "incline dumbbell press": ["full_gym", "home_gym", "dumbbells_only"],
  "seated cable row": ["full_gym"],
  "dumbbell shoulder press": ["full_gym", "home_gym", "dumbbells_only"],
  "lateral raise": ["full_gym", "home_gym", "dumbbells_only"],
  "triceps pushdown": ["full_gym"],
  "dumbbell curl": ["full_gym", "home_gym", "dumbbells_only"],
  "goblet squat or hack squat": ["full_gym", "home_gym", "dumbbells_only", "bodyweight_only"],
  "romanian deadlift (light/moderate)": ["full_gym", "home_gym", "dumbbells_only"],
  "leg press": ["full_gym"],
  "leg curl": ["full_gym"],
  "calf raise": ["full_gym", "home_gym", "dumbbells_only", "bodyweight_only"],
  plank: ["full_gym", "home_gym", "dumbbells_only", "bodyweight_only"],
  "incline bench press": ["full_gym", "home_gym"],
  "machine chest press": ["full_gym"],
  "cable fly": ["full_gym"],
  "seated dumbbell shoulder press": ["full_gym", "home_gym", "dumbbells_only"],
  "rear delt fly": ["full_gym", "home_gym", "dumbbells_only"],
  "overhead triceps extension": ["full_gym", "home_gym", "dumbbells_only"],
  "push-up": ["full_gym", "home_gym", "dumbbells_only", "bodyweight_only"],
  "lat pulldown": ["full_gym"],
  "chest-supported row": ["full_gym", "home_gym"],
  "single-arm cable row": ["full_gym"],
  "straight-arm pulldown": ["full_gym"],
  "face pull": ["full_gym"],
  "incline dumbbell curl": ["full_gym", "home_gym", "dumbbells_only"],
  "hammer curl": ["full_gym", "home_gym", "dumbbells_only"],
  "back extension": ["full_gym", "home_gym", "dumbbells_only", "bodyweight_only"],
  "front squat, goblet squat, or hack squat": ["full_gym", "home_gym", "dumbbells_only", "bodyweight_only"],
  "bulgarian split squat": ["full_gym", "home_gym", "dumbbells_only", "bodyweight_only"],
  "leg extension": ["full_gym"],
  "hanging knee raise": ["full_gym", "home_gym", "bodyweight_only"],
  "farmer carry": ["full_gym", "home_gym", "dumbbells_only"],
};

type Substitution = { name: string; target?: string };

const SUBSTITUTIONS: Record<string, Partial<Record<EquipmentSetup, Substitution>>> = {
  "bench press": {
    dumbbells_only: { name: "Dumbbell bench press" },
    bodyweight_only: { name: "Push-up", target: "3 × near failure" },
  },
  "pull-up or lat pulldown": {
    dumbbells_only: { name: "Dumbbell row", target: "4 × 8-12 / arm" },
    home_gym: { name: "Pull-up", target: "4 × 6-10" },
  },
  "incline dumbbell press": {
    bodyweight_only: { name: "Push-up", target: "3 × near failure" },
  },
  "seated cable row": {
    home_gym: { name: "Dumbbell row", target: "3 × 8-10" },
    dumbbells_only: { name: "Dumbbell row", target: "3 × 8-10" },
    bodyweight_only: { name: "Inverted row", target: "3 × 8-12" },
  },
  "dumbbell shoulder press": {
    bodyweight_only: { name: "Pike push-up", target: "3 × 8-12" },
  },
  "lateral raise": {
    bodyweight_only: { name: "Pike push-up", target: "3 × 10-15" },
  },
  "triceps pushdown": {
    home_gym: { name: "Overhead dumbbell extension", target: "3 × 10-15" },
    dumbbells_only: { name: "Overhead dumbbell extension", target: "3 × 10-15" },
    bodyweight_only: { name: "Diamond push-up", target: "3 × near failure" },
  },
  "dumbbell curl": {
    bodyweight_only: { name: "Inverted row", target: "3 × 8-12" },
  },
  "goblet squat or hack squat": {
    bodyweight_only: { name: "Bodyweight squat", target: "4 × 12-20" },
  },
  "romanian deadlift (light/moderate)": {
    bodyweight_only: { name: "Single-leg glute bridge", target: "3 × 10-12 / leg" },
  },
  "leg press": {
    home_gym: { name: "Goblet squat", target: "3 × 10-12" },
    dumbbells_only: { name: "Goblet squat", target: "3 × 10-12" },
    bodyweight_only: { name: "Bodyweight squat", target: "3 × 15-20" },
  },
  "leg curl": {
    home_gym: { name: "Glute bridge", target: "3 × 12-15" },
    dumbbells_only: { name: "Glute bridge", target: "3 × 12-15" },
    bodyweight_only: { name: "Glute bridge", target: "3 × 12-15" },
  },
  "incline bench press": {
    dumbbells_only: { name: "Incline dumbbell press", target: "4 × 8-10" },
    bodyweight_only: { name: "Pike push-up", target: "4 × 8-12" },
  },
  "machine chest press": {
    home_gym: { name: "Dumbbell bench press", target: "3 × 10-12" },
    dumbbells_only: { name: "Dumbbell bench press", target: "3 × 10-12" },
    bodyweight_only: { name: "Push-up", target: "3 × near failure" },
  },
  "cable fly": {
    home_gym: { name: "Dumbbell fly", target: "3 × 12-15" },
    dumbbells_only: { name: "Dumbbell fly", target: "3 × 12-15" },
    bodyweight_only: { name: "Push-up", target: "3 × near failure" },
  },
  "seated dumbbell shoulder press": {
    bodyweight_only: { name: "Pike push-up", target: "3 × 8-12" },
  },
  "rear delt fly": {
    bodyweight_only: { name: "Prone Y raise", target: "3 × 12-15" },
  },
  "overhead triceps extension": {
    bodyweight_only: { name: "Diamond push-up", target: "3 × near failure" },
  },
  "lat pulldown": {
    home_gym: { name: "Pull-up", target: "4 × 6-10" },
    dumbbells_only: { name: "Dumbbell row", target: "4 × 8-12 / arm" },
    bodyweight_only: { name: "Pull-up or inverted row", target: "4 × 8-12" },
  },
  "chest-supported row": {
    dumbbells_only: { name: "Dumbbell row", target: "4 × 8-12" },
    bodyweight_only: { name: "Inverted row", target: "4 × 8-12" },
  },
  "single-arm cable row": {
    home_gym: { name: "Single-arm dumbbell row", target: "3 × 10-12 / arm" },
    dumbbells_only: { name: "Single-arm dumbbell row", target: "3 × 10-12 / arm" },
    bodyweight_only: { name: "Inverted row", target: "3 × 10-12" },
  },
  "straight-arm pulldown": {
    home_gym: { name: "Dumbbell pullover", target: "3 × 12-15" },
    dumbbells_only: { name: "Dumbbell pullover", target: "3 × 12-15" },
    bodyweight_only: { name: "Arm circles", target: "3 × 15-20" },
  },
  "face pull": {
    home_gym: { name: "Rear delt fly", target: "3 × 15-20" },
    dumbbells_only: { name: "Rear delt fly", target: "3 × 15-20" },
    bodyweight_only: { name: "Prone Y raise", target: "3 × 15-20" },
  },
  "incline dumbbell curl": {
    bodyweight_only: { name: "Inverted row", target: "3 × 10-12" },
  },
  "hammer curl": {
    bodyweight_only: { name: "Inverted row", target: "3 × 10-12" },
  },
  "front squat, goblet squat, or hack squat": {
    dumbbells_only: { name: "Goblet squat", target: "3 × 8-10" },
    bodyweight_only: { name: "Bodyweight squat", target: "3 × 12-20" },
  },
  "leg extension": {
    home_gym: { name: "Goblet squat", target: "3 × 12-15" },
    dumbbells_only: { name: "Goblet squat", target: "3 × 12-15" },
    bodyweight_only: { name: "Bodyweight squat", target: "3 × 15-20" },
  },
  "hanging knee raise": {
    dumbbells_only: { name: "Lying leg raise", target: "3 × 10-15" },
    home_gym: { name: "Lying leg raise", target: "3 × 10-15" },
  },
  "farmer carry": {
    bodyweight_only: { name: "Bear crawl", target: "3 × 30s" },
  },
  "cable crunch": {
    home_gym: { name: "Dead bug", target: "3 × 10-15 / side" },
    dumbbells_only: { name: "Dead bug", target: "3 × 10-15 / side" },
    bodyweight_only: { name: "Dead bug", target: "3 × 10-15 / side" },
  },
};

export function isExerciseCompatibleWithSetup(name: string, setup: EquipmentSetup): boolean {
  const key = normalizeExerciseKey(name);
  const setups = COMPATIBLE_SETUPS[key];
  if (!setups) return true;
  return setups.includes(setup);
}

export function adaptExerciseForEquipment(
  exercise: WorkoutExercise,
  setup: EquipmentSetup,
): WorkoutExercise {
  const key = normalizeExerciseKey(exercise.name);
  if (isExerciseCompatibleWithSetup(exercise.name, setup)) return exercise;

  const sub = SUBSTITUTIONS[key]?.[setup];
  if (!sub) return exercise;

  return {
    ...exercise,
    name: sub.name,
    target: sub.target ?? exercise.target,
  };
}
