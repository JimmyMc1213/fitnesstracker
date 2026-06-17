import { newTemplateExerciseLine } from "./templateExerciseUtils";
import { defaultTrainingWeekdaysForProfile } from "./workoutWeekCalendar";
import type { WorkoutRoutineTemplate } from "@newyouai/types";

export type WorkoutStarterExerciseDef = {
  name: string;
  label?: string;
  setCount?: number;
  target?: string;
};

export type WorkoutStarterDayDef = {
  dayLabel?: string;
  name: string;
  focus: string;
  exercises: WorkoutStarterExerciseDef[];
};

export type WorkoutStarterTemplateCategory =
  | "splits"
  | "full_body"
  | "bodyweight"
  | "programs"
  | "strength"
  | "specialty";

export type WorkoutStarterTemplate = {
  id: string;
  name: string;
  description: string;
  category: WorkoutStarterTemplateCategory;
  days: WorkoutStarterDayDef[];
};

export const WORKOUT_STARTER_CATEGORY_LABELS: Record<WorkoutStarterTemplateCategory, string> = {
  splits: "Split days",
  full_body: "Full body",
  bodyweight: "Bodyweight",
  programs: "Weekly programs",
  strength: "Strength",
  specialty: "Focus sessions",
};

function ex(
  name: string,
  opts?: Omit<WorkoutStarterExerciseDef, "name">,
): WorkoutStarterExerciseDef {
  return { name, ...opts };
}

export const WORKOUT_STARTER_TEMPLATES: WorkoutStarterTemplate[] = [
  {
    id: "push-day",
    name: "Push",
    description: "Chest, shoulders, and triceps.",
    category: "splits",
    days: [
      {
        name: "Push",
        focus: "Chest, shoulders, triceps",
        exercises: [
          ex("Barbell bench press", { label: "Barbell", setCount: 4 }),
          ex("Incline dumbbell press", { label: "Dumbbell", setCount: 3 }),
          ex("Dumbbell shoulder press", { label: "Dumbbell", setCount: 3 }),
          ex("Cable lateral raise", { label: "Cable", setCount: 3 }),
          ex("Cable tricep pushdown", { label: "Cable", setCount: 3 }),
          ex("Overhead tricep extension", { label: "Dumbbell", setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "pull-day",
    name: "Pull",
    description: "Back and biceps.",
    category: "splits",
    days: [
      {
        name: "Pull",
        focus: "Back and biceps",
        exercises: [
          ex("Barbell deadlift", { label: "Barbell", setCount: 4 }),
          ex("Pull-up", { setCount: 4 }),
          ex("Seated cable row", { label: "Cable", setCount: 3 }),
          ex("Lat pulldown", { label: "Cable", setCount: 3 }),
          ex("Face pull", { label: "Cable", setCount: 3 }),
          ex("Barbell curl", { label: "Barbell", setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "legs-day",
    name: "Legs",
    description: "Quads, hamstrings, glutes, and calves.",
    category: "splits",
    days: [
      {
        name: "Legs",
        focus: "Quads, hamstrings, glutes, calves",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 4 }),
          ex("Romanian deadlift", { label: "Barbell", setCount: 3 }),
          ex("Leg press", { label: "Machine", setCount: 3 }),
          ex("Lying leg curl", { label: "Machine", setCount: 3 }),
          ex("Barbell hip thrust", { label: "Barbell", setCount: 3 }),
          ex("Standing calf raise", { label: "Machine", setCount: 4 }),
        ],
      },
    ],
  },
  {
    id: "upper-day",
    name: "Upper body",
    description: "Balanced push and pull for one upper session.",
    category: "splits",
    days: [
      {
        name: "Upper body",
        focus: "Chest, back, shoulders, arms",
        exercises: [
          ex("Dumbbell bench press", { label: "Dumbbell", setCount: 3 }),
          ex("Barbell bent-over row", { label: "Barbell", setCount: 3 }),
          ex("Dumbbell shoulder press", { label: "Dumbbell", setCount: 3 }),
          ex("Lat pulldown", { label: "Cable", setCount: 3 }),
          ex("Dumbbell curl", { label: "Dumbbell", setCount: 3 }),
          ex("Cable tricep pushdown", { label: "Cable", setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "lower-day",
    name: "Lower body",
    description: "Squats, hinges, and single-leg work.",
    category: "splits",
    days: [
      {
        name: "Lower body",
        focus: "Quads, hamstrings, glutes",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 4 }),
          ex("Romanian deadlift", { label: "Barbell", setCount: 3 }),
          ex("Bulgarian split squat", { label: "Dumbbell", setCount: 3 }),
          ex("Leg extension", { label: "Machine", setCount: 3 }),
          ex("Seated leg curl", { label: "Machine", setCount: 3 }),
          ex("Seated calf raise", { label: "Machine", setCount: 4 }),
        ],
      },
    ],
  },
  {
    id: "chest-triceps",
    name: "Chest & triceps",
    description: "Pressing and isolation for chest and triceps.",
    category: "splits",
    days: [
      {
        name: "Chest & triceps",
        focus: "Chest and triceps",
        exercises: [
          ex("Barbell bench press", { label: "Barbell", setCount: 4 }),
          ex("Incline dumbbell press", { label: "Dumbbell", setCount: 3 }),
          ex("Cable fly", { label: "Cable", setCount: 3 }),
          ex("Machine chest press", { label: "Machine", setCount: 3 }),
          ex("Close-grip bench press", { label: "Barbell", setCount: 3 }),
          ex("Skull crusher", { label: "EZ bar", setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "back-biceps",
    name: "Back & biceps",
    description: "Rows, pulldowns, and curl variations.",
    category: "splits",
    days: [
      {
        name: "Back & biceps",
        focus: "Back and biceps",
        exercises: [
          ex("Barbell bent-over row", { label: "Barbell", setCount: 4 }),
          ex("Lat pulldown", { label: "Cable", setCount: 3 }),
          ex("Seated cable row", { label: "Cable", setCount: 3 }),
          ex("Chest supported row", { label: "Machine", setCount: 3 }),
          ex("Dumbbell curl", { label: "Dumbbell", setCount: 3 }),
          ex("Hammer curl", { label: "Dumbbell", setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "shoulders-arms",
    name: "Shoulders & arms",
    description: "Delts, biceps, and triceps in one session.",
    category: "splits",
    days: [
      {
        name: "Shoulders & arms",
        focus: "Shoulders, biceps, triceps",
        exercises: [
          ex("Barbell overhead press", { label: "Barbell", setCount: 4 }),
          ex("Dumbbell lateral raise", { label: "Dumbbell", setCount: 3 }),
          ex("Rear delt fly (dumbbell)", { label: "Dumbbell", setCount: 3 }),
          ex("Barbell curl", { label: "Barbell", setCount: 3 }),
          ex("Cable tricep pushdown", { label: "Cable", setCount: 3 }),
          ex("Overhead tricep extension", { label: "Dumbbell", setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "full-body-gym",
    name: "Full body",
    description: "Compound lifts covering the whole body.",
    category: "full_body",
    days: [
      {
        name: "Full body",
        focus: "Full body compounds",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 3 }),
          ex("Barbell bench press", { label: "Barbell", setCount: 3 }),
          ex("Barbell bent-over row", { label: "Barbell", setCount: 3 }),
          ex("Romanian deadlift", { label: "Barbell", setCount: 3 }),
          ex("Dumbbell shoulder press", { label: "Dumbbell", setCount: 3 }),
          ex("Plank", { setCount: 3, target: "3 × 30 sec" }),
        ],
      },
    ],
  },
  {
    id: "full-body-dumbbells",
    name: "Full body (dumbbells)",
    description: "Minimal equipment full-body session.",
    category: "full_body",
    days: [
      {
        name: "Full body (dumbbells)",
        focus: "Dumbbell-only full body",
        exercises: [
          ex("Goblet squat", { label: "Dumbbell", setCount: 3 }),
          ex("Dumbbell bench press", { label: "Dumbbell", setCount: 3 }),
          ex("Single-arm dumbbell row", { label: "Dumbbell", setCount: 3 }),
          ex("Romanian deadlift", { label: "Dumbbell", setCount: 3 }),
          ex("Dumbbell shoulder press", { label: "Dumbbell", setCount: 3 }),
          ex("Dumbbell curl", { label: "Dumbbell", setCount: 2 }),
        ],
      },
    ],
  },
  {
    id: "full-body-compound",
    name: "Full body (strength)",
    description: "Heavy compounds with lower rep ranges.",
    category: "full_body",
    days: [
      {
        name: "Full body (strength)",
        focus: "Heavy compound focus",
        exercises: [
          ex("Trap bar deadlift", { label: "Trap bar", setCount: 4, target: "4 × 5" }),
          ex("Front squat", { label: "Barbell", setCount: 4, target: "4 × 5" }),
          ex("Incline barbell press", { label: "Barbell", setCount: 4, target: "4 × 6" }),
          ex("Pull-up", { setCount: 4, target: "4 × 6" }),
          ex("Barbell hip thrust", { label: "Barbell", setCount: 3, target: "3 × 8" }),
        ],
      },
    ],
  },
  {
    id: "bodyweight-full",
    name: "Bodyweight full body",
    description: "No equipment: push, pull, legs, and core.",
    category: "bodyweight",
    days: [
      {
        name: "Bodyweight full body",
        focus: "Push, pull, legs, core",
        exercises: [
          ex("Push-up", { setCount: 4 }),
          ex("Inverted row", { setCount: 4 }),
          ex("Bodyweight squat", { setCount: 4 }),
          ex("Walking lunge", { setCount: 3 }),
          ex("Pike push-up", { setCount: 3 }),
          ex("Plank", { setCount: 3, target: "3 × 30 sec" }),
        ],
      },
    ],
  },
  {
    id: "bodyweight-push",
    name: "Bodyweight push",
    description: "Chest, shoulders, and triceps using bodyweight.",
    category: "bodyweight",
    days: [
      {
        name: "Bodyweight push",
        focus: "Chest, shoulders, triceps",
        exercises: [
          ex("Push-up", { setCount: 4 }),
          ex("Diamond push-up", { setCount: 3 }),
          ex("Pike push-up", { setCount: 3 }),
          ex("Bench dip", { setCount: 3 }),
          ex("Chest dips", { setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "bodyweight-pull",
    name: "Bodyweight pull",
    description: "Back and biceps with minimal equipment.",
    category: "bodyweight",
    days: [
      {
        name: "Bodyweight pull",
        focus: "Back and biceps",
        exercises: [
          ex("Pull-up", { setCount: 4 }),
          ex("Chin-up", { setCount: 3 }),
          ex("Inverted row", { setCount: 4 }),
          ex("Assisted pull-up", { setCount: 3 }),
          ex("Dead bug", { setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "bodyweight-legs",
    name: "Bodyweight legs",
    description: "Squats, lunges, and glute work without a barbell.",
    category: "bodyweight",
    days: [
      {
        name: "Bodyweight legs",
        focus: "Quads, glutes, hamstrings",
        exercises: [
          ex("Bodyweight squat", { setCount: 4 }),
          ex("Walking lunge", { setCount: 3 }),
          ex("Bulgarian split squat", { label: "Bodyweight", setCount: 3 }),
          ex("Glute bridge", { setCount: 3 }),
          ex("Nordic hamstring curl", { setCount: 3 }),
          ex("Single-leg calf raise", { setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "bodyweight-upper",
    name: "Bodyweight upper",
    description: "Upper body calisthenics circuit.",
    category: "bodyweight",
    days: [
      {
        name: "Bodyweight upper",
        focus: "Push and pull calisthenics",
        exercises: [
          ex("Push-up", { setCount: 4 }),
          ex("Pull-up", { setCount: 4 }),
          ex("Inverted row", { setCount: 3 }),
          ex("Pike push-up", { setCount: 3 }),
          ex("Diamond push-up", { setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "program-ppl",
    name: "Push / Pull / Legs",
    description: "Classic 3-day split, three sessions per week.",
    category: "programs",
    days: [
      {
        name: "Push",
        focus: "Chest, shoulders, triceps",
        exercises: [
          ex("Barbell bench press", { label: "Barbell", setCount: 4 }),
          ex("Incline dumbbell press", { label: "Dumbbell", setCount: 3 }),
          ex("Dumbbell shoulder press", { label: "Dumbbell", setCount: 3 }),
          ex("Cable lateral raise", { label: "Cable", setCount: 3 }),
          ex("Cable tricep pushdown", { label: "Cable", setCount: 3 }),
        ],
      },
      {
        name: "Pull",
        focus: "Back and biceps",
        exercises: [
          ex("Barbell deadlift", { label: "Barbell", setCount: 4 }),
          ex("Pull-up", { setCount: 4 }),
          ex("Seated cable row", { label: "Cable", setCount: 3 }),
          ex("Face pull", { label: "Cable", setCount: 3 }),
          ex("Barbell curl", { label: "Barbell", setCount: 3 }),
        ],
      },
      {
        name: "Legs",
        focus: "Quads, hamstrings, glutes",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 4 }),
          ex("Romanian deadlift", { label: "Barbell", setCount: 3 }),
          ex("Leg press", { label: "Machine", setCount: 3 }),
          ex("Lying leg curl", { label: "Machine", setCount: 3 }),
          ex("Standing calf raise", { label: "Machine", setCount: 4 }),
        ],
      },
    ],
  },
  {
    id: "program-upper-lower",
    name: "Upper / Lower",
    description: "4-day split alternating upper and lower.",
    category: "programs",
    days: [
      {
        name: "Upper A",
        focus: "Chest, back, shoulders, arms",
        exercises: [
          ex("Barbell bench press", { label: "Barbell", setCount: 4 }),
          ex("Barbell bent-over row", { label: "Barbell", setCount: 4 }),
          ex("Dumbbell shoulder press", { label: "Dumbbell", setCount: 3 }),
          ex("Lat pulldown", { label: "Cable", setCount: 3 }),
          ex("Dumbbell curl", { label: "Dumbbell", setCount: 3 }),
        ],
      },
      {
        name: "Lower A",
        focus: "Squat pattern and posterior chain",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 4 }),
          ex("Romanian deadlift", { label: "Barbell", setCount: 3 }),
          ex("Leg press", { label: "Machine", setCount: 3 }),
          ex("Lying leg curl", { label: "Machine", setCount: 3 }),
          ex("Standing calf raise", { label: "Machine", setCount: 4 }),
        ],
      },
      {
        name: "Upper B",
        focus: "Incline pressing and rowing volume",
        exercises: [
          ex("Incline dumbbell press", { label: "Dumbbell", setCount: 4 }),
          ex("Seated cable row", { label: "Cable", setCount: 4 }),
          ex("Cable lateral raise", { label: "Cable", setCount: 3 }),
          ex("Pull-up", { setCount: 3 }),
          ex("Cable tricep pushdown", { label: "Cable", setCount: 3 }),
        ],
      },
      {
        name: "Lower B",
        focus: "Hinge and single-leg emphasis",
        exercises: [
          ex("Trap bar deadlift", { label: "Trap bar", setCount: 4 }),
          ex("Bulgarian split squat", { label: "Dumbbell", setCount: 3 }),
          ex("Leg extension", { label: "Machine", setCount: 3 }),
          ex("Seated leg curl", { label: "Machine", setCount: 3 }),
          ex("Barbell hip thrust", { label: "Barbell", setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "program-full-body-3x",
    name: "Full body 3× week",
    description: "Three full-body sessions with varied emphasis.",
    category: "programs",
    days: [
      {
        name: "Full body A",
        focus: "Squat and push emphasis",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 3 }),
          ex("Barbell bench press", { label: "Barbell", setCount: 3 }),
          ex("Seated cable row", { label: "Cable", setCount: 3 }),
          ex("Dumbbell shoulder press", { label: "Dumbbell", setCount: 3 }),
          ex("Plank", { setCount: 3, target: "3 × 30 sec" }),
        ],
      },
      {
        name: "Full body B",
        focus: "Hinge and pull emphasis",
        exercises: [
          ex("Romanian deadlift", { label: "Barbell", setCount: 3 }),
          ex("Incline dumbbell press", { label: "Dumbbell", setCount: 3 }),
          ex("Pull-up", { setCount: 3 }),
          ex("Walking lunge", { label: "Dumbbell", setCount: 3 }),
          ex("Cable crunch", { label: "Cable", setCount: 3 }),
        ],
      },
      {
        name: "Full body C",
        focus: "Volume and accessory work",
        exercises: [
          ex("Leg press", { label: "Machine", setCount: 3 }),
          ex("Dumbbell bench press", { label: "Dumbbell", setCount: 3 }),
          ex("Lat pulldown", { label: "Cable", setCount: 3 }),
          ex("Bulgarian split squat", { label: "Dumbbell", setCount: 3 }),
          ex("Face pull", { label: "Cable", setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "program-bro-split",
    name: "5-day bro split",
    description: "One muscle group per session, classic bodybuilding split.",
    category: "programs",
    days: [
      {
        name: "Chest",
        focus: "Chest",
        exercises: [
          ex("Barbell bench press", { label: "Barbell", setCount: 4 }),
          ex("Incline dumbbell press", { label: "Dumbbell", setCount: 3 }),
          ex("Cable fly", { label: "Cable", setCount: 3 }),
          ex("Machine chest press", { label: "Machine", setCount: 3 }),
          ex("Push-up", { setCount: 3 }),
        ],
      },
      {
        name: "Back",
        focus: "Back",
        exercises: [
          ex("Barbell deadlift", { label: "Barbell", setCount: 4 }),
          ex("Pull-up", { setCount: 4 }),
          ex("Seated cable row", { label: "Cable", setCount: 3 }),
          ex("Lat pulldown", { label: "Cable", setCount: 3 }),
          ex("Chest supported row", { label: "Machine", setCount: 3 }),
        ],
      },
      {
        name: "Shoulders",
        focus: "Shoulders",
        exercises: [
          ex("Barbell overhead press", { label: "Barbell", setCount: 4 }),
          ex("Dumbbell lateral raise", { label: "Dumbbell", setCount: 3 }),
          ex("Rear delt fly (dumbbell)", { label: "Dumbbell", setCount: 3 }),
          ex("Face pull", { label: "Cable", setCount: 3 }),
          ex("Arnold press", { label: "Dumbbell", setCount: 3 }),
        ],
      },
      {
        name: "Legs",
        focus: "Legs",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 4 }),
          ex("Leg press", { label: "Machine", setCount: 3 }),
          ex("Romanian deadlift", { label: "Barbell", setCount: 3 }),
          ex("Lying leg curl", { label: "Machine", setCount: 3 }),
          ex("Standing calf raise", { label: "Machine", setCount: 4 }),
        ],
      },
      {
        name: "Arms",
        focus: "Biceps and triceps",
        exercises: [
          ex("Barbell curl", { label: "Barbell", setCount: 3 }),
          ex("Hammer curl", { label: "Dumbbell", setCount: 3 }),
          ex("Preacher curl", { label: "Machine", setCount: 3 }),
          ex("Cable tricep pushdown", { label: "Cable", setCount: 3 }),
          ex("Skull crusher", { label: "EZ bar", setCount: 3 }),
          ex("Overhead tricep extension", { label: "Dumbbell", setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "program-full-body-ab",
    name: "Full body A / B",
    description: "Two alternating full-body days, great for 2–4 sessions per week.",
    category: "programs",
    days: [
      {
        name: "Full body A",
        focus: "Squat and horizontal push/pull",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 3 }),
          ex("Barbell bench press", { label: "Barbell", setCount: 3 }),
          ex("Barbell bent-over row", { label: "Barbell", setCount: 3 }),
          ex("Dumbbell shoulder press", { label: "Dumbbell", setCount: 3 }),
        ],
      },
      {
        name: "Full body B",
        focus: "Hinge and vertical push/pull",
        exercises: [
          ex("Romanian deadlift", { label: "Barbell", setCount: 3 }),
          ex("Incline dumbbell press", { label: "Dumbbell", setCount: 3 }),
          ex("Pull-up", { setCount: 3 }),
          ex("Bulgarian split squat", { label: "Dumbbell", setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "strength-5x5",
    name: "StrongLifts 5×5",
    description: "Alternating A/B, squat, bench, row and squat, overhead press, deadlift.",
    category: "strength",
    days: [
      {
        name: "Workout A",
        focus: "Squat, bench, row",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 5, target: "5 × 5" }),
          ex("Barbell bench press", { label: "Barbell", setCount: 5, target: "5 × 5" }),
          ex("Barbell bent-over row", { label: "Barbell", setCount: 5, target: "5 × 5" }),
        ],
      },
      {
        name: "Workout B",
        focus: "Squat, overhead press, deadlift",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 5, target: "5 × 5" }),
          ex("Barbell overhead press", { label: "Barbell", setCount: 5, target: "5 × 5" }),
          ex("Barbell deadlift", { label: "Barbell", setCount: 1, target: "1 × 5" }),
        ],
      },
    ],
  },
  {
    id: "strength-starting-strength",
    name: "Starting Strength",
    description: "Novice linear progression, squat, press, deadlift focus.",
    category: "strength",
    days: [
      {
        name: "Workout A",
        focus: "Squat, press, deadlift",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 3, target: "3 × 5" }),
          ex("Barbell bench press", { label: "Barbell", setCount: 3, target: "3 × 5" }),
          ex("Barbell deadlift", { label: "Barbell", setCount: 1, target: "1 × 5" }),
        ],
      },
      {
        name: "Workout B",
        focus: "Squat, press, power clean",
        exercises: [
          ex("Barbell back squat", { label: "Barbell", setCount: 3, target: "3 × 5" }),
          ex("Barbell overhead press", { label: "Barbell", setCount: 3, target: "3 × 5" }),
          ex("Barbell bent-over row", { label: "Barbell", setCount: 3, target: "3 × 5" }),
        ],
      },
    ],
  },
  {
    id: "specialty-core",
    name: "Core & abs",
    description: "Anti-extension, flexion, and rotation work.",
    category: "specialty",
    days: [
      {
        name: "Core & abs",
        focus: "Core strength and stability",
        exercises: [
          ex("Plank", { setCount: 3, target: "3 × 45 sec" }),
          ex("Hanging leg raise", { setCount: 3 }),
          ex("Cable crunch", { label: "Cable", setCount: 3 }),
          ex("Russian twist", { label: "Dumbbell", setCount: 3 }),
          ex("Pallof press", { label: "Cable", setCount: 3 }),
          ex("Side plank", { setCount: 3, target: "3 × 30 sec" }),
        ],
      },
    ],
  },
  {
    id: "specialty-glutes",
    name: "Glute focus",
    description: "Hip thrusts, hinges, and abduction for glute growth.",
    category: "specialty",
    days: [
      {
        name: "Glute focus",
        focus: "Glutes and hamstrings",
        exercises: [
          ex("Barbell hip thrust", { label: "Barbell", setCount: 4 }),
          ex("Romanian deadlift", { label: "Barbell", setCount: 3 }),
          ex("Bulgarian split squat", { label: "Dumbbell", setCount: 3 }),
          ex("Cable glute kickback", { label: "Cable", setCount: 3 }),
          ex("Hip abduction machine", { label: "Machine", setCount: 3 }),
          ex("Glute bridge", { setCount: 3 }),
        ],
      },
    ],
  },
  {
    id: "specialty-conditioning",
    name: "Conditioning",
    description: "Kettlebell swings, carries, and metabolic finishers.",
    category: "specialty",
    days: [
      {
        name: "Conditioning",
        focus: "Strength and conditioning",
        exercises: [
          ex("Kettlebell swing", { setCount: 4, target: "4 × 15" }),
          ex("Goblet squat", { label: "Dumbbell", setCount: 3 }),
          ex("Push-up", { setCount: 3 }),
          ex("Farmers carry", { setCount: 3 }),
          ex("Battle rope waves", { setCount: 4, target: "4 × 30 sec" }),
        ],
      },
    ],
  },
];

const STARTER_CATEGORY_ORDER: WorkoutStarterTemplateCategory[] = [
  "splits",
  "full_body",
  "bodyweight",
  "programs",
  "strength",
  "specialty",
];

export function workoutStarterTemplatesByCategory(): Array<{
  category: WorkoutStarterTemplateCategory;
  label: string;
  templates: WorkoutStarterTemplate[];
}> {
  return STARTER_CATEGORY_ORDER.map((category) => ({
    category,
    label: WORKOUT_STARTER_CATEGORY_LABELS[category],
    templates: WORKOUT_STARTER_TEMPLATES.filter((t) => t.category === category),
  })).filter((group) => group.templates.length > 0);
}

export function findWorkoutStarterTemplate(id: string): WorkoutStarterTemplate | undefined {
  return WORKOUT_STARTER_TEMPLATES.find((t) => t.id === id);
}

export function defaultWeekdaysForStarter(starter: WorkoutStarterTemplate): string[] {
  const count = starter.days.length;
  if (count === 1) return ["Mon"];
  if (count === 2) return ["Mon", "Thu"];
  if (count === 3 || count === 4 || count === 5 || count === 6) {
    return [...defaultTrainingWeekdaysForProfile(count)];
  }
  return defaultTrainingWeekdaysForProfile(3);
}

/** Materialize a starter template into saved routine blueprints. */
export function buildRoutineTemplatesFromStarter(
  starter: WorkoutStarterTemplate,
  stamp = Date.now(),
): WorkoutRoutineTemplate[] {
  const weekdays = defaultWeekdaysForStarter(starter);
  return starter.days.map((day, idx) => ({
    id: `starter-${starter.id}-${stamp}-${idx}`,
    name: day.name,
    dayLabel: day.dayLabel ?? weekdays[idx] ?? "",
    focus: day.focus,
    exercises: day.exercises.map((row) =>
      newTemplateExerciseLine(row.name, {
        label: row.label,
        setCount: row.setCount,
        target: row.target,
      }),
    ),
  }));
}

export function isMultiDayStarter(starter: WorkoutStarterTemplate): boolean {
  return starter.days.length > 1;
}
