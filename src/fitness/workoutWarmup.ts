import { exerciseLibrary, type MovementPattern } from "./exerciseLibrary";
import type { WorkoutExercise } from "./types";

export type WorkoutWarmupDrill = {
  name: string;
  prescription?: string;
  note?: string;
};

export type WorkoutWarmupGroup = {
  label: string;
  drills: WorkoutWarmupDrill[];
};

export type WorkoutWarmupPlan = {
  groups: WorkoutWarmupGroup[];
  tip?: string;
};

type WarmupCategory = "shoulders" | "pull" | "squat" | "hinge" | "arms" | "core" | "calves";

const RAMP_PATTERNS = new Set<MovementPattern>([
  "horizontal_push",
  "vertical_push",
  "horizontal_pull",
  "vertical_pull",
  "squat_pattern",
  "hinge_pattern",
  "leg_press_pattern",
  "full_body_push",
  "full_body_pull",
]);

const PATTERN_TO_CATEGORY: Partial<Record<MovementPattern, WarmupCategory>> = {
  horizontal_push: "shoulders",
  vertical_push: "shoulders",
  lateral_raise: "shoulders",
  rear_delt: "shoulders",
  horizontal_pull: "pull",
  vertical_pull: "pull",
  full_body_pull: "pull",
  squat_pattern: "squat",
  leg_press_pattern: "squat",
  hinge_pattern: "hinge",
  leg_curl_pattern: "hinge",
  bicep_curl: "arms",
  tricep_extension: "arms",
  core_anti_extension: "core",
  core_rotation: "core",
  core_flexion: "core",
  carry: "core",
  calf_raise: "calves",
  full_body_push: "shoulders",
};

const CATEGORY_ORDER: WarmupCategory[] = ["shoulders", "pull", "squat", "hinge", "arms", "core", "calves"];

const CATEGORY_GROUPS: Record<WarmupCategory, WorkoutWarmupGroup> = {
  shoulders: {
    label: "Chest & shoulders",
    drills: [
      { name: "Band pull-aparts", prescription: "2 × 15" },
      { name: "Scapular push-ups", prescription: "2 × 10" },
      { name: "Arm circles", prescription: "10 each way" },
    ],
  },
  pull: {
    label: "Back & lats",
    drills: [
      { name: "Band face pulls", prescription: "2 × 15" },
      { name: "Light lat stretch", prescription: "20–30 sec" },
      { name: "Dead hang", prescription: "15–20 sec", note: "Only if shoulders feel good" },
    ],
  },
  squat: {
    label: "Quads & glutes",
    drills: [
      { name: "Goblet or air squats", prescription: "2 × 10", note: "Slow, controlled reps" },
      { name: "Knee-to-wall ankle mobilization", prescription: "Each side" },
    ],
  },
  hinge: {
    label: "Hamstrings & glutes",
    drills: [
      { name: "Hip hinges", prescription: "2 × 10" },
      { name: "Glute bridges", prescription: "2 × 12" },
      { name: "Hinge patterning", prescription: "Empty bar or light load" },
    ],
  },
  arms: {
    label: "Arms",
    drills: [
      { name: "Elbow circles", prescription: "10 each way" },
      { name: "Easy curl or pushdown", prescription: "15 reps", note: "Stay far from failure" },
    ],
  },
  core: {
    label: "Core",
    drills: [
      { name: "Dead bug or cat-cow", prescription: "8–10 reps" },
      { name: "Bracing practice", note: "Before working sets" },
    ],
  },
  calves: {
    label: "Calves",
    drills: [
      { name: "Calf raises", prescription: "20 reps" },
      { name: "Ankle rocks", prescription: "10 each leg" },
    ],
  },
};

const GENERAL_GROUP: WorkoutWarmupGroup = {
  label: "General",
  drills: [
    {
      name: "Easy cardio",
      prescription: "5–8 min",
      note: "Bike, incline walk, or row until light sweat",
    },
  ],
};

function cloneDrills(drills: WorkoutWarmupDrill[]): WorkoutWarmupDrill[] {
  return drills.map((drill) => ({ ...drill }));
}

function findLibraryExercise(name: string, label?: string) {
  const normalized = name.toLowerCase().trim();
  const labelNorm = label?.toLowerCase().trim();
  const exact = exerciseLibrary.find((ex) => {
    if (ex.name.toLowerCase() !== normalized) return false;
    if (labelNorm) return ex.label.toLowerCase() === labelNorm;
    return true;
  });
  if (exact) return exact;
  return exerciseLibrary.find((ex) => {
    const exName = ex.name.toLowerCase();
    if (exName === normalized) return true;
    if (labelNorm && exName.includes(labelNorm) && exName.includes(normalized.split(" ")[0] ?? "")) {
      return true;
    }
    return exName.includes(normalized) || normalized.includes(exName);
  });
}

function inferPatternFromName(name: string): MovementPattern | undefined {
  const n = name.toLowerCase();
  if (/\b(squat|lunge|split squat|step[- ]?up|leg press)\b/.test(n)) return "squat_pattern";
  if (/\b(deadlift|rdl|romanian|hip thrust|good morning|back extension)\b/.test(n)) return "hinge_pattern";
  if (/\b(bench|push[- ]?up|dip|fly|press)\b/.test(n) && !/\b(leg|calf|overhead|shoulder|military|incline)\b/.test(n)) {
    return "horizontal_push";
  }
  if (/\b(overhead|shoulder press|military|arnold)\b/.test(n)) return "vertical_push";
  if (/\b(row|pull[- ]?down|pull[- ]?up|chin[- ]?up|lat)\b/.test(n)) return "horizontal_pull";
  if (/\b(face pull|rear delt|reverse fly)\b/.test(n)) return "rear_delt";
  if (/\b(lateral raise|side raise)\b/.test(n)) return "lateral_raise";
  if (/\b(curl|hammer)\b/.test(n)) return "bicep_curl";
  if (/\b(tricep|pushdown|skull|extension)\b/.test(n)) return "tricep_extension";
  if (/\b(calf|heel raise)\b/.test(n)) return "calf_raise";
  if (/\b(leg curl|hamstring curl|nordic)\b/.test(n)) return "leg_curl_pattern";
  if (/\b(plank|dead bug|pallof|carry|farmer|crunch|twist|core)\b/.test(n)) return "core_anti_extension";
  return undefined;
}

function resolveMovementPattern(exercise: WorkoutExercise): MovementPattern | undefined {
  return findLibraryExercise(exercise.name, exercise.label)?.movementPattern ?? inferPatternFromName(exercise.name);
}

function rampSetDrill(exerciseName: string): WorkoutWarmupDrill {
  return {
    name: exerciseName,
    prescription: "2–4 sets",
    note: "Empty bar or light weight to first working set",
  };
}

/** Build a session warm-up from the exercises actually in the workout (live or template). */
export function buildWorkoutWarmup(exercises: WorkoutExercise[]): WorkoutWarmupPlan {
  if (exercises.length === 0) {
    return {
      groups: [
        {
          label: "General",
          drills: [
            {
              name: "Easy cardio",
              prescription: "5–8 min",
              note: "Then warm up for your first lift",
            },
          ],
        },
      ],
    };
  }

  const groups: WorkoutWarmupGroup[] = [
    { label: GENERAL_GROUP.label, drills: cloneDrills(GENERAL_GROUP.drills) },
  ];

  const categoriesNeeded = new Set<WarmupCategory>();
  const rampExercises: WorkoutExercise[] = [];
  const seenRampPatterns = new Set<MovementPattern>();

  for (const exercise of exercises) {
    const pattern = resolveMovementPattern(exercise);
    if (!pattern) continue;

    const category = PATTERN_TO_CATEGORY[pattern];
    if (category) categoriesNeeded.add(category);

    if (RAMP_PATTERNS.has(pattern) && !seenRampPatterns.has(pattern)) {
      seenRampPatterns.add(pattern);
      rampExercises.push(exercise);
    }
  }

  for (const category of CATEGORY_ORDER) {
    if (!categoriesNeeded.has(category)) continue;
    const group = CATEGORY_GROUPS[category];
    groups.push({ label: group.label, drills: cloneDrills(group.drills) });
  }

  if (rampExercises.length > 0) {
    groups.push({
      label: "Ramp sets",
      drills: rampExercises.slice(0, 3).map((exercise) => rampSetDrill(exercise.name)),
    });
  }

  const tip =
    rampExercises.length > 0
      ? "Leave 2-3 reps in reserve on your last warm-up set."
      : undefined;

  return { groups, tip };
}
