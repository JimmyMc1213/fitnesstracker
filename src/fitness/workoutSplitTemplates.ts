import { defaultWorkoutRoutineTemplates, workoutTemplateForSplitId } from "./data";
import type { WorkoutExercise, WorkoutRoutineTemplate } from "./types";

function ex(id: string, name: string, target: string, setCount: number): WorkoutExercise {
  const n = Math.min(Math.max(setCount, 1), 6);
  return {
    id,
    name,
    target,
    sets: Array.from({ length: n }, () => ({ w: 0, r: 0, done: false })),
  };
}

function cloneExercises(list: WorkoutExercise[]): WorkoutExercise[] {
  return list.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
}

function routine(
  id: string,
  name: string,
  dayLabel: string,
  focus: string,
  exercises: WorkoutExercise[],
): WorkoutRoutineTemplate {
  return { id, name, dayLabel, focus, exercises: cloneExercises(exercises) };
}

const FULL_BODY: WorkoutExercise[] = [
  ex("fb1", "Squat or leg press", "3 × 6–10", 3),
  ex("fb2", "Bench press", "3 × 6–10", 3),
  ex("fb3", "Lat pulldown or pull-up", "3 × 8–12", 3),
  ex("fb4", "Romanian deadlift", "3 × 8–10", 3),
  ex("fb5", "Dumbbell shoulder press", "3 × 8–12", 3),
  ex("fb6", "Cable row", "3 × 10–12", 3),
  ex("fb7", "Plank", "3 × 45s", 3),
];

const FULL_BODY_A: WorkoutExercise[] = [
  ex("fba1", "Goblet squat", "4 × 8–10", 4),
  ex("fba2", "Bench press", "4 × 6–8", 4),
  ex("fba3", "Lat pulldown", "3 × 8–12", 3),
  ex("fba4", "Leg curl", "3 × 10–15", 3),
  ex("fba5", "Triceps pushdown", "3 × 10–15", 3),
];

const FULL_BODY_B: WorkoutExercise[] = [
  ex("fbb1", "Romanian deadlift", "4 × 8–10", 4),
  ex("fbb2", "Incline dumbbell press", "4 × 8–10", 4),
  ex("fbb3", "Chest-supported row", "3 × 8–12", 3),
  ex("fbb4", "Leg extension", "3 × 12–15", 3),
  ex("fbb5", "Dumbbell curl", "3 × 10–15", 3),
];

const PUSH: WorkoutExercise[] = [
  ex("pu1", "Incline bench press", "4 × 8–10", 4),
  ex("pu2", "Machine chest press", "3 × 10–12", 3),
  ex("pu3", "Seated dumbbell shoulder press", "3 × 8–12", 3),
  ex("pu4", "Lateral raise", "3 × 15–20", 3),
  ex("pu5", "Overhead triceps extension", "3 × 10–15", 3),
];

const PULL: WorkoutExercise[] = [
  ex("pl1", "Lat pulldown", "4 × 8–12", 4),
  ex("pl2", "Chest-supported row", "4 × 8–12", 4),
  ex("pl3", "Face pull", "3 × 15–20", 3),
  ex("pl4", "Incline dumbbell curl", "3 × 10–12", 3),
  ex("pl5", "Hammer curl", "3 × 10–15", 3),
];

const LEGS: WorkoutExercise[] = [
  ex("lg1", "Front squat or hack squat", "4 × 6–10", 4),
  ex("lg2", "Romanian deadlift", "3 × 8–10", 3),
  ex("lg3", "Leg press", "3 × 10–12", 3),
  ex("lg4", "Leg curl", "3 × 12–15", 3),
  ex("lg5", "Calf raise", "4 × 12–15", 4),
];

const UPPER: WorkoutExercise[] = [
  ex("up1", "Bench press", "4 × 5–8", 4),
  ex("up2", "Pull-up or lat pulldown", "4 × 6–10", 4),
  ex("up3", "Incline dumbbell press", "3 × 8–10", 3),
  ex("up4", "Seated cable row", "3 × 8–10", 3),
  ex("up5", "Lateral raise", "3 × 12–20", 3),
];

const LOWER: WorkoutExercise[] = [
  ex("lo1", "Goblet squat or hack squat", "4 × 6–10", 4),
  ex("lo2", "Romanian deadlift", "3 × 8–10", 3),
  ex("lo3", "Leg press", "3 × 10–12", 3),
  ex("lo4", "Leg curl", "3 × 10–15", 3),
  ex("lo5", "Cable crunch", "3 × 10–15", 3),
];

export type SplitOption = {
  key: string;
  name: string;
  description: string;
  daysPerWeek: number;
};

export const SPLIT_OPTIONS_BY_DAYS: Record<number, SplitOption[]> = {
  1: [{ key: "full-body", name: "Full Body", description: "One session hits every major muscle group.", daysPerWeek: 1 }],
  2: [
    {
      key: "full-body-ab",
      name: "Full Body A/B",
      description: "Two full-body days with different emphasis each session.",
      daysPerWeek: 2,
    },
  ],
  3: [
    {
      key: "full-body-3x",
      name: "Full Body ×3",
      description: "Three balanced full-body sessions through the week.",
      daysPerWeek: 3,
    },
    { key: "ppl-3", name: "Push / Pull / Legs", description: "Classic PPL split across three training days.", daysPerWeek: 3 },
  ],
  4: [
    {
      key: "upper-lower-x2",
      name: "Upper / Lower ×2",
      description: "Two upper and two lower sessions for balanced volume.",
      daysPerWeek: 4,
    },
  ],
  5: [
    {
      key: "ppl-upper-lower",
      name: "PPL + Upper/Lower",
      description: "Push, pull, legs, then upper and lower strength work.",
      daysPerWeek: 5,
    },
  ],
  6: [
    { key: "ppl-x2", name: "PPL ×2", description: "Push, pull, legs repeated twice per week.", daysPerWeek: 6 },
    {
      key: "pplrul",
      name: "PPLRUL",
      description: "Push, pull, legs, repeat, then upper and lower finishers.",
      daysPerWeek: 6,
    },
  ],
};

function templatesForSplitKey(splitKey: string): WorkoutRoutineTemplate[] {
  switch (splitKey) {
    case "full-body":
      return [routine("ob-fb", "Full body", "Mon", "Squat · Push · Pull · Core", FULL_BODY)];
    case "full-body-ab":
      return [
        routine("ob-fba", "Full body A", "Mon", "Squat · Bench · Pulldown", FULL_BODY_A),
        routine("ob-fbb", "Full body B", "Thu", "Hinge · Incline · Row", FULL_BODY_B),
      ];
    case "full-body-3x":
      return [
        routine("ob-fb1", "Full body", "Mon", "Squat · Bench · Row", FULL_BODY),
        routine("ob-fb2", "Full body", "Wed", "Hinge · Incline · Pulldown", FULL_BODY_B),
        routine("ob-fb3", "Full body", "Fri", "Legs · Press · Pull", FULL_BODY_A),
      ];
    case "ppl-3":
      return [
        routine("ob-push", "Push", "Mon", "Chest · Shoulders · Triceps", PUSH),
        routine("ob-pull", "Pull", "Wed", "Back · Biceps · Rear delts", PULL),
        routine("ob-legs", "Legs", "Fri", "Quads · Hinge · Calves", LEGS),
      ];
    case "upper-lower-x2":
      return [
        routine("ob-up1", "Upper", "Mon", "Bench · Row · Accessories", UPPER),
        routine("ob-lo1", "Lower", "Tue", "Squat · Hinge · Core", LOWER),
        routine("ob-up2", "Upper", "Thu", "Incline · Pulldown · Delts", UPPER),
        routine("ob-lo2", "Lower", "Sat", "Leg press · RDL · Abs", LOWER),
      ];
    case "ppl-upper-lower":
      return defaultWorkoutRoutineTemplates();
    case "ppl-x2":
      return [
        routine("ob-p1", "Push", "Mon", "Chest · Shoulders · Triceps", PUSH),
        routine("ob-p2", "Pull", "Tue", "Back · Biceps", PULL),
        routine("ob-p3", "Legs", "Wed", "Quads · Hinge · Calves", LEGS),
        routine("ob-p4", "Push", "Thu", "Incline · Delts · Tri", PUSH),
        routine("ob-p5", "Pull", "Fri", "Rows · Pulldown · Bi", PULL),
        routine("ob-p6", "Legs", "Sat", "Squat · RDL · Leg curl", LEGS),
      ];
    case "pplrul":
      return [
        routine("ob-r1", "Push", "Mon", "Chest · Shoulders · Triceps", PUSH),
        routine("ob-r2", "Pull", "Tue", "Back · Biceps", PULL),
        routine("ob-r3", "Legs", "Wed", "Quads · Hinge · Calves", LEGS),
        routine("ob-r4", "Push", "Thu", "Incline · Delts · Tri", PUSH),
        routine("ob-r5", "Pull", "Fri", "Rows · Pulldown · Bi", PULL),
        routine("ob-r6", "Legs", "Sat", "Squat · RDL · Core", LEGS),
      ];
    default:
      return defaultWorkoutRoutineTemplates();
  }
}

export function buildWorkoutTemplatesForSplit(splitKey: string): WorkoutRoutineTemplate[] {
  return templatesForSplitKey(splitKey).map((t) => ({
    ...t,
    exercises: t.exercises.map((e) => ({
      ...e,
      sets: e.sets.map((s) => ({ ...s })),
    })),
  }));
}

export function defaultSplitKeyForDays(days: number): string {
  const options = SPLIT_OPTIONS_BY_DAYS[days];
  return options?.[0]?.key ?? "ppl-upper-lower";
}

export function splitLabelForKey(splitKey: string): string {
  for (const options of Object.values(SPLIT_OPTIONS_BY_DAYS)) {
    const hit = options.find((o) => o.key === splitKey);
    if (hit) return hit.name;
  }
  return "Custom split";
}

/** First routine id for starting workouts after onboarding. */
export function primarySplitIdForTemplates(templates: WorkoutRoutineTemplate[]): string {
  return templates[0]?.id ?? "mon-upper";
}

/** Re-export for editor swap lists. */
export { workoutTemplateForSplitId };
