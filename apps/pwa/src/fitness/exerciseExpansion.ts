// ─── GYMMY EXERCISE EXPANSION ─────────────────────────────────────────────
// These exercises are for user browsing/adding only — not programmed by the engine
// Same schema as exerciseLibrary.ts

import type { Exercise } from './exerciseLibrary';

export const exerciseExpansion: Exercise[] = [

  {
    id: 'low_cable_fly',
    name: 'Low cable fly',
    label: 'Cable',
    muscleGroup: 'chest',
    secondaryMuscles: [],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_fly', 'dumbbell_fly'],
    coachNote: 'Cables set low, sweep up and in — hits upper chest'
  },

  {
    id: 'high_cable_fly',
    name: 'High cable fly',
    label: 'Cable',
    muscleGroup: 'chest',
    secondaryMuscles: [],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_fly', 'dumbbell_fly'],
    coachNote: 'Cables set high, sweep down — hits lower chest'
  },

  {
    id: 'decline_barbell_press',
    name: 'Decline barbell press',
    label: 'Barbell',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['barbell_bench_press', 'decline_dumbbell_press'],
    coachNote: 'Feet locked in, lower chest emphasis, full range'
  },

  {
    id: 'decline_dumbbell_press',
    name: 'Decline dumbbell press',
    label: 'Dumbbell',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['decline_barbell_press', 'dumbbell_bench_press'],
    coachNote: 'Lower chest emphasis, control the descent'
  },

  {
    id: 'smith_machine_bench_press',
    name: 'Smith machine bench press',
    label: 'Smith machine',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_bench_press', 'machine_chest_press'],
    coachNote: 'Stable path — good for learning the press pattern'
  },

  {
    id: 'smith_machine_incline_press',
    name: 'Smith machine incline press',
    label: 'Smith machine',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['incline_barbell_press', 'incline_dumbbell_press'],
    coachNote: '30-45 degree incline, upper chest focus'
  },

  {
    id: 'landmine_press',
    name: 'Landmine press',
    label: 'Barbell',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'triceps'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['incline_dumbbell_press', 'dumbbell_shoulder_press'],
    coachNote: 'Arc path — shoulder-friendly pressing variation'
  },

  {
    id: 'svend_press',
    name: 'Svend press',
    label: 'Other',
    muscleGroup: 'chest',
    secondaryMuscles: [],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_fly', 'pec_deck'],
    coachNote: 'Squeeze two plates together throughout — constant chest tension'
  },

  {
    id: 'cable_crossover',
    name: 'Cable crossover',
    label: 'Cable',
    muscleGroup: 'chest',
    secondaryMuscles: [],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_fly', 'pec_deck'],
    coachNote: 'Cross hands at end for peak contraction'
  },

  {
    id: 'dumbbell_pullover',
    name: 'Dumbbell pullover',
    label: 'Dumbbell',
    muscleGroup: 'chest',
    secondaryMuscles: ['back'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_pulldown', 'dumbbell_fly'],
    coachNote: 'Full stretch overhead, keep slight elbow bend'
  },

  {
    id: 'resistance_band_chest_press',
    name: 'Resistance band chest press',
    label: 'Band',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    equipment: ['bodyweight', 'home_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['pushup', 'dumbbell_bench_press'],
    coachNote: 'Band anchored behind you, press forward'
  },

  {
    id: 'push_press',
    name: 'Push press',
    label: 'Barbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps', 'quads'],
    movementPattern: 'vertical_push',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['overhead_press_barbell', 'dumbbell_shoulder_press'],
    coachNote: 'Slight dip and drive from legs — more weight than strict press'
  },

  {
    id: 'z_press',
    name: 'Z press',
    label: 'Barbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['core', 'triceps'],
    movementPattern: 'vertical_push',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['overhead_press_barbell', 'dumbbell_shoulder_press'],
    coachNote: 'Seated on floor, legs straight — brutal core demand'
  },

  {
    id: 'smith_machine_shoulder_press',
    name: 'Smith machine shoulder press',
    label: 'Smith machine',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    movementPattern: 'vertical_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['machine_shoulder_press', 'dumbbell_shoulder_press'],
    coachNote: 'Fixed path — keep torso upright'
  },

  {
    id: 'single_arm_dumbbell_press',
    name: 'Single-arm dumbbell press',
    label: 'Dumbbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps', 'core'],
    movementPattern: 'vertical_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_shoulder_press', 'arnold_press'],
    coachNote: 'Anti-rotation challenge — brace the core hard'
  },

  {
    id: 'cable_overhead_press',
    name: 'Cable overhead press',
    label: 'Cable',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    movementPattern: 'vertical_push',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_shoulder_press', 'machine_shoulder_press'],
    coachNote: 'Cables from low position, constant tension throughout'
  },

  {
    id: 'band_lateral_raise',
    name: 'Band lateral raise',
    label: 'Band',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    movementPattern: 'lateral_raise',
    equipment: ['bodyweight', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['dumbbell_lateral_raise', 'cable_lateral_raise'],
    coachNote: 'Band under foot, constant tension — great for high reps'
  },

  {
    id: 'leaning_cable_lateral_raise',
    name: 'Leaning cable lateral raise',
    label: 'Cable',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    movementPattern: 'lateral_raise',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['cable_lateral_raise', 'dumbbell_lateral_raise'],
    coachNote: 'Lean away from cable — better stretch at bottom'
  },

  {
    id: 'plate_lateral_raise',
    name: 'Plate lateral raise',
    label: 'Other',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    movementPattern: 'lateral_raise',
    equipment: ['full_gym', 'home_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['dumbbell_lateral_raise'],
    coachNote: 'Hold plate with both hands, raise to shoulder height'
  },

  {
    id: 'band_pull_apart',
    name: 'Band pull apart',
    label: 'Band',
    muscleGroup: 'rear_delt',
    secondaryMuscles: ['traps'],
    movementPattern: 'rear_delt',
    equipment: ['bodyweight', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['face_pull', 'rear_delt_fly_dumbbell'],
    coachNote: 'Arms straight, pull band apart at chest height'
  },

  {
    id: 'cable_rear_delt_fly',
    name: 'Cable rear delt fly',
    label: 'Cable',
    muscleGroup: 'rear_delt',
    secondaryMuscles: ['traps'],
    movementPattern: 'rear_delt',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['rear_delt_fly_dumbbell', 'face_pull'],
    coachNote: 'Cross cables, pull apart — constant tension'
  },

  {
    id: 'seated_rear_delt_fly',
    name: 'Seated rear delt fly',
    label: 'Dumbbell',
    muscleGroup: 'rear_delt',
    secondaryMuscles: ['traps'],
    movementPattern: 'rear_delt',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['rear_delt_fly_dumbbell', 'rear_delt_machine'],
    coachNote: 'Chest on thighs, elbows slightly bent, lead with elbows'
  },

  {
    id: 'cable_row_wide_grip',
    name: 'Wide grip cable row',
    label: 'Cable',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'rear_delt'],
    movementPattern: 'horizontal_pull',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_row', 'machine_row'],
    coachNote: 'Wide grip hits upper back and rear delts more'
  },

  {
    id: 'pendlay_row',
    name: 'Pendlay row',
    label: 'Barbell',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'traps'],
    movementPattern: 'horizontal_pull',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['barbell_row', 'cable_row'],
    coachNote: 'Bar starts on floor each rep — explosive pull, strict form'
  },

  {
    id: 'meadows_row',
    name: 'Meadows row',
    label: 'Barbell',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'horizontal_pull',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_row', 'cable_row'],
    coachNote: 'Landmine style, perpendicular to bar — great stretch'
  },

  {
    id: 'smith_machine_row',
    name: 'Smith machine row',
    label: 'Smith machine',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'horizontal_pull',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_row', 'machine_row'],
    coachNote: 'Fixed path row — good for beginners learning the movement'
  },

  {
    id: 'resistance_band_row',
    name: 'Resistance band row',
    label: 'Band',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'horizontal_pull',
    equipment: ['bodyweight', 'home_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['cable_row', 'dumbbell_row'],
    coachNote: 'Band anchored to door or post, drive elbows back'
  },

  {
    id: 'single_arm_lat_pulldown',
    name: 'Single-arm lat pulldown',
    label: 'Cable',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'vertical_pull',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['lat_pulldown', 'dumbbell_row'],
    coachNote: 'Full stretch and rotation at top — great lat isolation'
  },

  {
    id: 'band_pull_down',
    name: 'Band pulldown',
    label: 'Band',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'vertical_pull',
    equipment: ['bodyweight', 'home_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['lat_pulldown', 'cable_pulldown'],
    coachNote: 'Band anchored overhead, pull to chest'
  },

  {
    id: 'weighted_pullup',
    name: 'Weighted pull-up',
    label: 'Bodyweight',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'vertical_pull',
    equipment: ['full_gym', 'home_gym'],
    experience: ['advanced'],
    substitutes: ['pullup', 'lat_pulldown'],
    coachNote: 'Belt or dumbbell between legs — full dead hang each rep'
  },

  {
    id: 'muscle_up',
    name: 'Muscle up',
    label: 'Bodyweight',
    muscleGroup: 'back',
    secondaryMuscles: ['chest', 'triceps'],
    movementPattern: 'vertical_pull',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['advanced'],
    substitutes: ['pullup', 'dips_chest'],
    coachNote: 'Pull then transition to dip — requires serious strength'
  },

  {
    id: 'step_up',
    name: 'Step up',
    label: 'Dumbbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['lunge', 'bulgarian_split_squat'],
    coachNote: 'Drive through heel of front foot — dont push off back foot'
  },

  {
    id: 'reverse_lunge',
    name: 'Reverse lunge',
    label: 'Dumbbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['lunge', 'bulgarian_split_squat'],
    coachNote: 'Step back instead of forward — easier on knees'
  },

  {
    id: 'lateral_lunge',
    name: 'Lateral lunge',
    label: 'Bodyweight',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['lunge', 'goblet_squat'],
    coachNote: 'Step wide to side, sit into hip — hits adductors'
  },

  {
    id: 'sumo_squat',
    name: 'Sumo squat',
    label: 'Dumbbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['goblet_squat', 'barbell_squat'],
    coachNote: 'Wide stance toes out — more glute and inner thigh'
  },

  {
    id: 'zercher_squat',
    name: 'Zercher squat',
    label: 'Barbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['core', 'glutes'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['front_squat', 'goblet_squat'],
    coachNote: 'Bar in the crook of elbows — brutal core and quad demand'
  },

  {
    id: 'box_squat',
    name: 'Box squat',
    label: 'Barbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_squat', 'goblet_squat'],
    coachNote: 'Sit back to box, pause, drive up — teaches proper hip hinge'
  },

  {
    id: 'wall_sit',
    name: 'Wall sit',
    label: 'Bodyweight',
    muscleGroup: 'quads',
    secondaryMuscles: [],
    movementPattern: 'squat_pattern',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['beginner'],
    substitutes: ['bodyweight_squat', 'leg_extension'],
    coachNote: 'Timed hold at 90 degrees — pure quad endurance'
  },

  {
    id: 'sissy_squat',
    name: 'Sissy squat',
    label: 'Bodyweight',
    muscleGroup: 'quads',
    secondaryMuscles: [],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'bodyweight', 'home_gym'],
    experience: ['advanced'],
    substitutes: ['leg_extension', 'hack_squat'],
    coachNote: 'Lean back as you lower — extreme quad stretch'
  },

  {
    id: 'split_squat',
    name: 'Split squat',
    label: 'Barbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['lunge', 'bulgarian_split_squat'],
    coachNote: 'Static position, straight down — front foot stays flat'
  },

  {
    id: 'sumo_deadlift',
    name: 'Sumo deadlift',
    label: 'Barbell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'quads', 'back'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['barbell_deadlift', 'trap_bar_deadlift'],
    coachNote: 'Wide stance, toes out, more hip and less back'
  },

  {
    id: 'deficit_deadlift',
    name: 'Deficit deadlift',
    label: 'Barbell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'back'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['advanced'],
    substitutes: ['barbell_deadlift', 'romanian_deadlift'],
    coachNote: 'Stand on plate — longer range of motion, more hamstring'
  },

  {
    id: 'stiff_leg_deadlift',
    name: 'Stiff leg deadlift',
    label: 'Barbell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'back'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['romanian_deadlift', 'good_morning'],
    coachNote: 'Knees nearly locked — max hamstring stretch'
  },

  {
    id: 'cable_pull_through',
    name: 'Cable pull through',
    label: 'Cable',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['hip_thrust', 'kettlebell_swing'],
    coachNote: 'Face away from cable, hip hinge, drive hips forward'
  },

  {
    id: 'single_leg_hip_thrust',
    name: 'Single-leg hip thrust',
    label: 'Bodyweight',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym', 'bodyweight', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['hip_thrust', 'glute_bridge'],
    coachNote: 'One leg extended — targets each glute independently'
  },

  {
    id: 'frog_pump',
    name: 'Frog pump',
    label: 'Bodyweight',
    muscleGroup: 'glutes',
    secondaryMuscles: [],
    movementPattern: 'hinge_pattern',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['glute_bridge', 'hip_thrust'],
    coachNote: 'Feet together soles touching, drive hips up — glute burnout'
  },

  {
    id: 'romanian_deadlift_dumbbell',
    name: 'Dumbbell Romanian deadlift',
    label: 'Dumbbell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'back'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['romanian_deadlift', 'single_leg_rdl'],
    coachNote: 'Dumbbells allow more range of motion than barbell'
  },

  {
    id: 'snatch_grip_deadlift',
    name: 'Snatch grip deadlift',
    label: 'Barbell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['traps', 'back', 'glutes'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym'],
    experience: ['advanced'],
    substitutes: ['barbell_deadlift', 'deficit_deadlift'],
    coachNote: 'Extra wide grip — hits traps and upper back harder'
  },

  {
    id: 'hack_squat_barbell',
    name: 'Barbell hack squat',
    label: 'Barbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes'],
    movementPattern: 'leg_press_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['hack_squat', 'barbell_squat'],
    coachNote: 'Bar behind legs on floor — old school quad builder'
  },

  {
    id: 'single_leg_curl',
    name: 'Single-leg curl',
    label: 'Machine',
    muscleGroup: 'hamstrings',
    secondaryMuscles: [],
    movementPattern: 'leg_curl_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['lying_leg_curl', 'seated_leg_curl'],
    coachNote: 'One leg at a time — fixes left-right imbalances'
  },

  {
    id: 'stability_ball_curl',
    name: 'Stability ball leg curl',
    label: 'Other',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'core'],
    movementPattern: 'leg_curl_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['lying_leg_curl', 'nordic_curl'],
    coachNote: 'Hips up, roll ball to glutes — unstable surface adds core work'
  },

  {
    id: 'cable_leg_curl',
    name: 'Cable leg curl',
    label: 'Cable',
    muscleGroup: 'hamstrings',
    secondaryMuscles: [],
    movementPattern: 'leg_curl_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['lying_leg_curl', 'seated_leg_curl'],
    coachNote: 'Ankle attachment, curl heel to glute — constant tension'
  },

  {
    id: 'donkey_calf_raise',
    name: 'Donkey calf raise',
    label: 'Machine',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    movementPattern: 'calf_raise',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['standing_calf_raise', 'single_leg_calf_raise'],
    coachNote: 'Bent over position — stretches gastroc further'
  },

  {
    id: 'jump_rope',
    name: 'Jump rope calf raises',
    label: 'Other',
    muscleGroup: 'calves',
    secondaryMuscles: ['core'],
    movementPattern: 'calf_raise',
    equipment: ['bodyweight', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['standing_calf_raise'],
    coachNote: 'High rep endurance work — great finisher'
  },

  {
    id: 'tibialis_raise',
    name: 'Tibialis raise',
    label: 'Bodyweight',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    movementPattern: 'calf_raise',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['standing_calf_raise'],
    coachNote: 'Raise toes up — trains the front of lower leg, prevents shin splints'
  },

  {
    id: 'preacher_curl_dumbbell',
    name: 'Dumbbell preacher curl',
    label: 'Dumbbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_curl', 'cable_curl'],
    coachNote: 'Single arm on pad — full isolation, supinate at top'
  },

  {
    id: 'spider_curl',
    name: 'Spider curl',
    label: 'Barbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['preacher_curl_barbell', 'incline_dumbbell_curl'],
    coachNote: 'Chest on incline bench, arms hang — peak contraction'
  },

  {
    id: 'cable_hammer_curl',
    name: 'Cable hammer curl',
    label: 'Cable',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['hammer_curl', 'cable_curl'],
    coachNote: 'Rope attachment, neutral grip — brachialis emphasis'
  },

  {
    id: 'reverse_curl',
    name: 'Reverse curl',
    label: 'Barbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['hammer_curl', 'barbell_curl'],
    coachNote: 'Overhand grip — trains brachioradialis and forearms'
  },

  {
    id: 'zottman_curl',
    name: 'Zottman curl',
    label: 'Dumbbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_curl', 'reverse_curl'],
    coachNote: 'Supinate up, pronate down — trains both heads and forearms'
  },

  {
    id: 'band_curl',
    name: 'Band curl',
    label: 'Band',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['bodyweight', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['dumbbell_curl', 'cable_curl'],
    coachNote: 'Band under foot — good for high rep pump work'
  },

  {
    id: 'jm_press',
    name: 'JM press',
    label: 'Barbell',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    movementPattern: 'tricep_extension',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['skull_crusher', 'close_grip_bench'],
    coachNote: 'Hybrid between skull crusher and close grip — tricep mass builder'
  },

  {
    id: 'single_arm_cable_pushdown',
    name: 'Single-arm cable pushdown',
    label: 'Cable',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    movementPattern: 'tricep_extension',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['tricep_pushdown_cable', 'kickback_dumbbell'],
    coachNote: 'One arm at a time — isolates each side'
  },

  {
    id: 'tate_press',
    name: 'Tate press',
    label: 'Dumbbell',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    movementPattern: 'tricep_extension',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['skull_crusher', 'overhead_tricep_extension'],
    coachNote: 'Elbows flared out, lower dumbbells to chest — lateral head'
  },

  {
    id: 'band_tricep_pushdown',
    name: 'Band tricep pushdown',
    label: 'Band',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    movementPattern: 'tricep_extension',
    equipment: ['bodyweight', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['tricep_pushdown_cable', 'kickback_dumbbell'],
    coachNote: 'Band anchored overhead — great for high rep pump'
  },

  {
    id: 'dragon_flag',
    name: 'Dragon flag',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_anti_extension',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['advanced'],
    substitutes: ['ab_wheel', 'hanging_leg_raise'],
    coachNote: 'Shoulder supported, body straight — one of the hardest core moves'
  },

  {
    id: 'l_sit',
    name: 'L-sit hold',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: ['quads', 'triceps'],
    movementPattern: 'core_anti_extension',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['advanced'],
    substitutes: ['plank', 'hanging_leg_raise'],
    coachNote: 'Arms straight, legs parallel to floor — timed hold'
  },

  {
    id: 'hollow_body_hold',
    name: 'Hollow body hold',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_anti_extension',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['plank', 'dead_bug'],
    coachNote: 'Lower back pressed to floor, arms and legs extended — timed'
  },

  {
    id: 'v_up',
    name: 'V-up',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_flexion',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['lying_leg_raise', 'cable_crunch'],
    coachNote: 'Simultaneous upper and lower crunch — meet in the middle'
  },

  {
    id: 'wood_chop',
    name: 'Cable wood chop',
    label: 'Cable',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_rotation',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['pallof_press', 'russian_twist'],
    coachNote: 'Rotate from high to low — power through hips not arms'
  },

  {
    id: 'toe_to_bar',
    name: 'Toes to bar',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_flexion',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['advanced'],
    substitutes: ['hanging_leg_raise', 'lying_leg_raise'],
    coachNote: 'Straight legs to bar — control the swing'
  },

  {
    id: 'weighted_crunch',
    name: 'Weighted crunch',
    label: 'Dumbbell',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_flexion',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['cable_crunch', 'lying_leg_raise'],
    coachNote: 'Plate or dumbbell on chest — add load to basic crunch'
  },

  {
    id: 'suitcase_carry',
    name: 'Suitcase carry',
    label: 'Dumbbell',
    muscleGroup: 'core',
    secondaryMuscles: ['traps'],
    movementPattern: 'carry',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['pallof_press', 'side_plank'],
    coachNote: 'Single weight, resist leaning — oblique anti-lateral flexion'
  },

  {
    id: 'farmers_carry',
    name: 'Farmers carry',
    label: 'Dumbbell',
    muscleGroup: 'core',
    secondaryMuscles: ['traps', 'forearms'],
    movementPattern: 'carry',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['plank', 'suitcase_carry'],
    coachNote: 'Walk with heavy weights — total body stability challenge'
  },

  {
    id: 'barbell_shrug',
    name: 'Barbell shrug',
    label: 'Barbell',
    muscleGroup: 'traps',
    secondaryMuscles: [],
    movementPattern: 'rear_delt',
    equipment: ['full_gym', 'home_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_shrug', 'cable_shrug'],
    coachNote: 'Straight up shrug, pause at top, no rolling'
  },

  {
    id: 'dumbbell_shrug',
    name: 'Dumbbell shrug',
    label: 'Dumbbell',
    muscleGroup: 'traps',
    secondaryMuscles: [],
    movementPattern: 'rear_delt',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_shrug', 'cable_shrug'],
    coachNote: 'Neutral grip, straight up — pause and squeeze at top'
  },

  {
    id: 'cable_shrug',
    name: 'Cable shrug',
    label: 'Cable',
    muscleGroup: 'traps',
    secondaryMuscles: [],
    movementPattern: 'rear_delt',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_shrug', 'dumbbell_shrug'],
    coachNote: 'Constant tension throughout — better than free weights for pumps'
  },

  {
    id: 'rack_pull',
    name: 'Rack pull',
    label: 'Barbell',
    muscleGroup: 'traps',
    secondaryMuscles: ['back', 'hamstrings'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['barbell_shrug', 'barbell_deadlift'],
    coachNote: 'Bar starts at knee height — overload trap and upper back'
  },

  {
    id: 'upright_row_barbell',
    name: 'Barbell upright row',
    label: 'Barbell',
    muscleGroup: 'traps',
    secondaryMuscles: ['shoulders'],
    movementPattern: 'rear_delt',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_upright_row', 'barbell_shrug'],
    coachNote: 'Narrow grip, pull to chin — elbows lead'
  },

  {
    id: 'dumbbell_upright_row',
    name: 'Dumbbell upright row',
    label: 'Dumbbell',
    muscleGroup: 'traps',
    secondaryMuscles: ['shoulders'],
    movementPattern: 'rear_delt',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['barbell_upright_row', 'dumbbell_shrug'],
    coachNote: 'Wider grip than barbell version — easier on wrists'
  },

  {
    id: 'clamshell',
    name: 'Clamshell',
    label: 'Bodyweight',
    muscleGroup: 'glutes',
    secondaryMuscles: [],
    movementPattern: 'hinge_pattern',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['beginner'],
    substitutes: ['glute_bridge', 'frog_pump'],
    coachNote: 'Side lying, feet together, rotate top knee up — hip abductor'
  },

  {
    id: 'donkey_kick',
    name: 'Donkey kick',
    label: 'Bodyweight',
    muscleGroup: 'glutes',
    secondaryMuscles: [],
    movementPattern: 'hinge_pattern',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['cable_kickback', 'glute_bridge'],
    coachNote: 'On all fours, kick heel to ceiling — squeeze at top'
  },

  {
    id: 'adduction_machine',
    name: 'Hip adduction machine',
    label: 'Machine',
    muscleGroup: 'glutes',
    secondaryMuscles: [],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['lateral_lunge', 'sumo_squat'],
    coachNote: 'Pull knees together against pads — inner thigh'
  },

  {
    id: 'clean_and_press',
    name: 'Clean and press',
    label: 'Barbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['back', 'quads', 'core'],
    movementPattern: 'full_body_push',
    equipment: ['full_gym', 'home_gym'],
    experience: ['advanced'],
    substitutes: ['push_press', 'overhead_press_barbell'],
    coachNote: 'Power clean then strict press — full body movement'
  },

  {
    id: 'thruster',
    name: 'Thruster',
    label: 'Barbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['quads', 'core'],
    movementPattern: 'full_body_push',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['push_press', 'front_squat'],
    coachNote: 'Front squat into press — drive from legs into lockout'
  },

  {
    id: 'burpee',
    name: 'Burpee',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: ['chest', 'shoulders', 'quads'],
    movementPattern: 'full_body_push',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['pushup', 'bodyweight_squat'],
    coachNote: 'Jump up, drop to push-up, repeat — conditioning'
  },

  {
    id: 'dumbbell_clean',
    name: 'Dumbbell clean',
    label: 'Dumbbell',
    muscleGroup: 'back',
    secondaryMuscles: ['quads', 'shoulders', 'core'],
    movementPattern: 'full_body_pull',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['kettlebell_swing', 'dumbbell_row'],
    coachNote: 'Hip drive pulls weight up — power transfer from floor'
  },

  {
    id: 'battle_rope',
    name: 'Battle rope waves',
    label: 'Other',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['core', 'back'],
    movementPattern: 'full_body_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['burpee', 'dumbbell_lateral_raise'],
    coachNote: 'Alternating or simultaneous waves — conditioning and shoulder endurance'
  },

  {
    id: 'wrist_curl',
    name: 'Wrist curl',
    label: 'Barbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['reverse_curl', 'zottman_curl'],
    coachNote: 'Forearms on bench, curl wrist up — flexor strength'
  },

  {
    id: 'reverse_wrist_curl',
    name: 'Reverse wrist curl',
    label: 'Barbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['reverse_curl'],
    coachNote: 'Forearms on bench, extend wrist up — extensor strength'
  },

  {
    id: 'plate_pinch',
    name: 'Plate pinch',
    label: 'Other',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'carry',
    equipment: ['full_gym', 'home_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['farmers_carry', 'suitcase_carry'],
    coachNote: 'Pinch two plates smooth side out — grip endurance'
  }
];

export default exerciseExpansion;
