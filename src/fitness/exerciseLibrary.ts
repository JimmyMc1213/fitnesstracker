import type { ExerciseEquipmentLabel } from './exerciseLabels';

export type Equipment = 'full_gym' | 'home_gym' | 'dumbbells_only' | 'bodyweight';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'core' | 'traps' | 'rear_delt';
export type MovementPattern =
  | 'horizontal_push'
  | 'vertical_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'squat_pattern'
  | 'hinge_pattern'
  | 'leg_press_pattern'
  | 'leg_curl_pattern'
  | 'calf_raise'
  | 'bicep_curl'
  | 'tricep_extension'
  | 'lateral_raise'
  | 'rear_delt'
  | 'core_anti_extension'
  | 'core_rotation'
  | 'core_flexion'
  | 'carry'
  | 'full_body_pull'
  | 'full_body_push';

export interface Exercise {
  id: string;
  name: string;
  label: ExerciseEquipmentLabel;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  movementPattern: MovementPattern;
  equipment: Equipment[];
  experience: Experience[];
  substitutes: string[];
  coachNote?: string;
}

export const exerciseLibrary: Exercise[] = [

  // ─── HORIZONTAL PUSH ───────────────────────────────────────────────
  {
    id: 'barbell_bench_press',
    name: 'Barbell bench press',
    label: 'Barbell',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_bench_press', 'pushup_weighted'],
    coachNote: 'Retract scapula, drive feet into floor, controlled descent'
  },
  {
    id: 'dumbbell_bench_press',
    name: 'Dumbbell bench press',
    label: 'Dumbbell',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_bench_press', 'pushup_weighted'],
    coachNote: 'Full stretch at bottom, squeeze at top'
  },
  {
    id: 'incline_barbell_press',
    name: 'Incline barbell press',
    label: 'Barbell',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'triceps'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['incline_dumbbell_press', 'incline_pushup'],
    coachNote: '30–45 degree incline, elbows slightly tucked'
  },
  {
    id: 'incline_dumbbell_press',
    name: 'Incline dumbbell press',
    label: 'Dumbbell',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'triceps'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['incline_barbell_press', 'incline_pushup'],
    coachNote: 'Control the descent, pause at chest'
  },
  {
    id: 'machine_chest_press',
    name: 'Machine chest press',
    label: 'Machine',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_bench_press', 'pushup'],
    coachNote: 'Great for beginners. Stable movement pattern'
  },
  {
    id: 'cable_chest_press',
    name: 'Cable chest press',
    label: 'Cable',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_bench_press'],
    coachNote: 'Constant tension throughout the range of motion'
  },
  {
    id: 'pushup',
    name: 'Push-up',
    label: 'Bodyweight',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders', 'core'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['dumbbell_bench_press', 'machine_chest_press'],
    coachNote: 'Straight body line, chest touches floor'
  },
  {
    id: 'pushup_weighted',
    name: 'Weighted push-up',
    label: 'Bodyweight',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders', 'core'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_bench_press', 'barbell_bench_press'],
    coachNote: 'Plate on back or weight vest'
  },
  {
    id: 'dips_chest',
    name: 'Chest dips',
    label: 'Bodyweight',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_bench_press', 'pushup_weighted'],
    coachNote: 'Lean forward to bias chest, control descent'
  },

  // ─── CHEST ISOLATION ───────────────────────────────────────────────
  {
    id: 'cable_fly',
    name: 'Cable fly',
    label: 'Cable',
    muscleGroup: 'chest',
    secondaryMuscles: [],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_fly', 'pec_deck'],
    coachNote: 'Slight bend in elbows, squeeze hard at center'
  },
  {
    id: 'dumbbell_fly',
    name: 'Dumbbell fly',
    label: 'Dumbbell',
    muscleGroup: 'chest',
    secondaryMuscles: [],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_fly', 'pec_deck'],
    coachNote: 'Wide arc, slight elbow bend, feel the stretch'
  },
  {
    id: 'pec_deck',
    name: 'Pec deck / machine fly',
    label: 'Machine',
    muscleGroup: 'chest',
    secondaryMuscles: [],
    movementPattern: 'horizontal_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_fly', 'dumbbell_fly'],
    coachNote: 'Full range, pause and squeeze at peak contraction'
  },

  // ─── VERTICAL PUSH ─────────────────────────────────────────────────
  {
    id: 'overhead_press_barbell',
    name: 'Barbell overhead press',
    label: 'Barbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps', 'traps'],
    movementPattern: 'vertical_push',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_shoulder_press', 'machine_shoulder_press'],
    coachNote: 'Brace core, press in straight line, full lockout'
  },
  {
    id: 'dumbbell_shoulder_press',
    name: 'Dumbbell shoulder press',
    label: 'Dumbbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    movementPattern: 'vertical_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['overhead_press_barbell', 'machine_shoulder_press'],
    coachNote: 'Neutral or pronated grip, full range of motion'
  },
  {
    id: 'seated_dumbbell_press',
    name: 'Seated dumbbell shoulder press',
    label: 'Dumbbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    movementPattern: 'vertical_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_shoulder_press', 'machine_shoulder_press'],
    coachNote: 'Back supported, strict form, full range of motion'
  },
  {
    id: 'machine_shoulder_press',
    name: 'Machine shoulder press',
    label: 'Machine',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    movementPattern: 'vertical_push',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_shoulder_press'],
    coachNote: 'Stable base, great for beginners'
  },
  {
    id: 'arnold_press',
    name: 'Arnold press',
    label: 'Dumbbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    movementPattern: 'vertical_push',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_shoulder_press'],
    coachNote: 'Rotate through full range, hits all three delt heads'
  },
  {
    id: 'pike_pushup',
    name: 'Pike push-up',
    label: 'Bodyweight',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    movementPattern: 'vertical_push',
    equipment: ['bodyweight', 'dumbbells_only', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['dumbbell_shoulder_press', 'handstand_pushup'],
    coachNote: 'Hips high, press down and through'
  },
  {
    id: 'handstand_pushup',
    name: 'Handstand push-up',
    label: 'Bodyweight',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps', 'core'],
    movementPattern: 'vertical_push',
    equipment: ['bodyweight'],
    experience: ['advanced'],
    substitutes: ['pike_pushup', 'dumbbell_shoulder_press'],
    coachNote: 'Wall-supported, head to floor, controlled'
  },

  // ─── LATERAL RAISE ─────────────────────────────────────────────────
  {
    id: 'dumbbell_lateral_raise',
    name: 'Dumbbell lateral raise',
    label: 'Dumbbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    movementPattern: 'lateral_raise',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_lateral_raise', 'machine_lateral_raise'],
    coachNote: 'Slight forward lean, lead with elbows, stop at shoulder height'
  },
  {
    id: 'cable_lateral_raise',
    name: 'Cable lateral raise',
    label: 'Cable',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    movementPattern: 'lateral_raise',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_lateral_raise'],
    coachNote: 'Constant tension, cross-body cable gives better stretch'
  },
  {
    id: 'machine_lateral_raise',
    name: 'Machine lateral raise',
    label: 'Machine',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    movementPattern: 'lateral_raise',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_lateral_raise'],
    coachNote: 'Adjust pad to elbow height, slow controlled reps'
  },

  // ─── REAR DELT ─────────────────────────────────────────────────────
  {
    id: 'rear_delt_fly_dumbbell',
    name: 'Rear delt fly (dumbbell)',
    label: 'Dumbbell',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['traps'],
    movementPattern: 'rear_delt',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['face_pull', 'rear_delt_machine'],
    coachNote: 'Hinge forward, lead with elbows, light weight'
  },
  {
    id: 'face_pull',
    name: 'Face pull',
    label: 'Cable',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['traps', 'rear_delt'],
    movementPattern: 'rear_delt',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['rear_delt_fly_dumbbell', 'band_pull_apart'],
    coachNote: 'Pull to forehead, external rotate at end, elbows high'
  },
  {
    id: 'rear_delt_machine',
    name: 'Rear delt machine',
    label: 'Machine',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['traps'],
    movementPattern: 'rear_delt',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['rear_delt_fly_dumbbell', 'face_pull'],
    coachNote: 'Full range, squeeze rear delts at peak'
  },

  // ─── HORIZONTAL PULL ───────────────────────────────────────────────
  {
    id: 'barbell_row',
    name: 'Barbell bent-over row',
    label: 'Barbell',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'traps'],
    movementPattern: 'horizontal_pull',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_row', 'cable_row'],
    coachNote: 'Hip hinge, neutral spine, drive elbows back'
  },
  {
    id: 'dumbbell_row',
    name: 'Single-arm dumbbell row',
    label: 'Dumbbell',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'horizontal_pull',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_row', 'cable_row'],
    coachNote: 'Full stretch at bottom, drive elbow to hip'
  },
  {
    id: 'cable_row',
    name: 'Seated cable row',
    label: 'Cable',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'traps'],
    movementPattern: 'horizontal_pull',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_row', 'machine_row'],
    coachNote: 'Upright torso, squeeze shoulder blades together'
  },
  {
    id: 'machine_row',
    name: 'Machine row',
    label: 'Machine',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'horizontal_pull',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_row', 'dumbbell_row'],
    coachNote: 'Chest pad keeps torso stable, full range'
  },
  {
    id: 'tbar_row',
    name: 'T-bar row',
    label: 'Barbell',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'traps'],
    movementPattern: 'horizontal_pull',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['barbell_row', 'cable_row'],
    coachNote: 'Neutral grip, drive elbows back, chest up'
  },
  {
    id: 'inverted_row',
    name: 'Inverted row',
    label: 'Bodyweight',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'core'],
    movementPattern: 'horizontal_pull',
    equipment: ['bodyweight', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['dumbbell_row', 'cable_row'],
    coachNote: 'Straight body, pull chest to bar'
  },
  {
    id: 'chest_supported_row',
    name: 'Chest supported row',
    label: 'Dumbbell',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'rear_delt'],
    movementPattern: 'horizontal_pull',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_row', 'machine_row'],
    coachNote: 'Chest on incline bench — removes lower back from equation'
  },

  // ─── VERTICAL PULL ─────────────────────────────────────────────────
  {
    id: 'pullup',
    name: 'Pull-up',
    label: 'Bodyweight',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'vertical_pull',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['lat_pulldown', 'assisted_pullup'],
    coachNote: 'Dead hang start, chin over bar, controlled descent'
  },
  {
    id: 'assisted_pullup',
    name: 'Assisted pull-up',
    label: 'Machine',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'vertical_pull',
    equipment: ['full_gym'],
    experience: ['beginner'],
    substitutes: ['lat_pulldown', 'pullup'],
    coachNote: 'Use machine or band, build to unassisted'
  },
  {
    id: 'lat_pulldown',
    name: 'Lat pulldown',
    label: 'Machine',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'vertical_pull',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['pullup', 'cable_pulldown'],
    coachNote: 'Slight lean back, pull to upper chest, full stretch'
  },
  {
    id: 'close_grip_lat_pulldown',
    name: 'Close grip lat pulldown',
    label: 'Cable',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'vertical_pull',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['lat_pulldown', 'chinup'],
    coachNote: 'Neutral grip, elbows drive to hips — more bicep involvement'
  },
  {
    id: 'cable_pulldown',
    name: 'Cable straight-arm pulldown',
    label: 'Cable',
    muscleGroup: 'back',
    secondaryMuscles: [],
    movementPattern: 'vertical_pull',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['lat_pulldown'],
    coachNote: 'Isolates lats, keep arms straight throughout'
  },
  {
    id: 'chinup',
    name: 'Chin-up',
    label: 'Bodyweight',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'vertical_pull',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['pullup', 'lat_pulldown'],
    coachNote: 'Supinated grip hits biceps more, full range'
  },
  {
    id: 'neutral_grip_pullup',
    name: 'Neutral grip pull-up',
    label: 'Bodyweight',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    movementPattern: 'vertical_pull',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['pullup', 'lat_pulldown'],
    coachNote: 'Easier on wrists and shoulders than pronated grip'
  },

  // ─── SQUAT PATTERN ─────────────────────────────────────────────────
  {
    id: 'barbell_squat',
    name: 'Barbell back squat',
    label: 'Barbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings', 'core'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['goblet_squat', 'hack_squat'],
    coachNote: 'Chest up, knees track toes, break parallel'
  },
  {
    id: 'front_squat',
    name: 'Front squat',
    label: 'Barbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'core'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['advanced'],
    substitutes: ['barbell_squat', 'hack_squat'],
    coachNote: 'More quad dominant, requires mobility'
  },
  {
    id: 'hack_squat',
    name: 'Hack squat machine',
    label: 'Machine',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_squat', 'leg_press'],
    coachNote: 'Feet placement changes emphasis, go deep'
  },
  {
    id: 'goblet_squat',
    name: 'Goblet squat',
    label: 'Dumbbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'core'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['barbell_squat', 'dumbbell_squat'],
    coachNote: 'Hold dumbbell at chest, elbows inside knees'
  },
  {
    id: 'dumbbell_squat',
    name: 'Dumbbell squat',
    label: 'Dumbbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['goblet_squat', 'barbell_squat'],
    coachNote: 'Dumbbells at sides or goblet position'
  },
  {
    id: 'bulgarian_split_squat',
    name: 'Bulgarian split squat',
    label: 'Dumbbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['lunge', 'goblet_squat'],
    coachNote: 'Rear foot elevated, knee tracks over toe'
  },
  {
    id: 'lunge',
    name: 'Walking lunge',
    label: 'Dumbbell',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['bulgarian_split_squat', 'goblet_squat'],
    coachNote: 'Long stride, knee stays behind toe'
  },
  {
    id: 'bodyweight_squat',
    name: 'Bodyweight squat',
    label: 'Bodyweight',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes'],
    movementPattern: 'squat_pattern',
    equipment: ['bodyweight', 'dumbbells_only', 'home_gym', 'full_gym'],
    experience: ['beginner'],
    substitutes: ['goblet_squat', 'lunge'],
    coachNote: 'Arms forward for balance, sit back and down'
  },
  {
    id: 'pistol_squat',
    name: 'Pistol squat',
    label: 'Bodyweight',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'core'],
    movementPattern: 'squat_pattern',
    equipment: ['bodyweight'],
    experience: ['advanced'],
    substitutes: ['bulgarian_split_squat', 'lunge'],
    coachNote: 'Single leg, requires significant strength and balance'
  },
  {
    id: 'leg_extension',
    name: 'Leg extension',
    label: 'Machine',
    muscleGroup: 'quads',
    secondaryMuscles: [],
    movementPattern: 'squat_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['hack_squat', 'leg_press'],
    coachNote: 'Full extension, pause and squeeze at top — quad isolation'
  },

  // ─── HINGE PATTERN ─────────────────────────────────────────────────
  {
    id: 'barbell_deadlift',
    name: 'Barbell deadlift',
    label: 'Barbell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'back', 'traps'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['romanian_deadlift', 'trap_bar_deadlift'],
    coachNote: 'Bar over mid-foot, hinge not squat, brace hard'
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian deadlift',
    label: 'Barbell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'back'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_deadlift', 'single_leg_rdl'],
    coachNote: 'Soft knee, push hips back, feel hamstring stretch'
  },
  {
    id: 'trap_bar_deadlift',
    name: 'Trap bar deadlift',
    label: 'Other',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'quads', 'back'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_deadlift', 'romanian_deadlift'],
    coachNote: 'More quad friendly, great for beginners learning hinge'
  },
  {
    id: 'single_leg_rdl',
    name: 'Single-leg RDL',
    label: 'Dumbbell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'core'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['romanian_deadlift', 'good_morning'],
    coachNote: 'Hip hinge on one leg, keep hips square'
  },
  {
    id: 'good_morning',
    name: 'Good morning',
    label: 'Barbell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'back'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['romanian_deadlift'],
    coachNote: 'Bar on back, hinge at hips, slight knee bend'
  },
  {
    id: 'kettlebell_swing',
    name: 'Kettlebell swing',
    label: 'Kettlebell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'core', 'shoulders'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['romanian_deadlift'],
    coachNote: 'Hip power drives the swing, not the arms'
  },
  {
    id: 'hip_thrust',
    name: 'Barbell hip thrust',
    label: 'Barbell',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_hip_thrust', 'glute_bridge'],
    coachNote: 'Full hip extension, squeeze glutes at top'
  },
  {
    id: 'dumbbell_hip_thrust',
    name: 'Dumbbell hip thrust',
    label: 'Dumbbell',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['hip_thrust', 'glute_bridge'],
    coachNote: 'Bench at shoulder blade height, drive through heels'
  },
  {
    id: 'glute_bridge',
    name: 'Glute bridge',
    label: 'Bodyweight',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings'],
    movementPattern: 'hinge_pattern',
    equipment: ['bodyweight', 'dumbbells_only', 'home_gym', 'full_gym'],
    experience: ['beginner'],
    substitutes: ['dumbbell_hip_thrust', 'hip_thrust'],
    coachNote: 'Feet flat, drive hips up, squeeze at top'
  },
  {
    id: 'cable_kickback',
    name: 'Cable glute kickback',
    label: 'Cable',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings'],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['hip_thrust', 'glute_bridge'],
    coachNote: 'Ankle attachment, kick straight back — squeeze at top'
  },
  {
    id: 'abduction_machine',
    name: 'Hip abduction machine',
    label: 'Machine',
    muscleGroup: 'glutes',
    secondaryMuscles: [],
    movementPattern: 'hinge_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['cable_kickback', 'glute_bridge'],
    coachNote: 'Push knees out against pads — outer glute and hip'
  },

  // ─── LEG PRESS ─────────────────────────────────────────────────────
  {
    id: 'leg_press',
    name: 'Leg press',
    label: 'Machine',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    movementPattern: 'leg_press_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['hack_squat', 'goblet_squat'],
    coachNote: 'Feet shoulder width, do not lock knees at top'
  },
  {
    id: 'single_leg_press',
    name: 'Single-leg press',
    label: 'Machine',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes'],
    movementPattern: 'leg_press_pattern',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['leg_press', 'bulgarian_split_squat'],
    coachNote: 'One leg at a time — identifies and fixes imbalances'
  },

  // ─── LEG CURL ──────────────────────────────────────────────────────
  {
    id: 'lying_leg_curl',
    name: 'Lying leg curl',
    label: 'Machine',
    muscleGroup: 'hamstrings',
    secondaryMuscles: [],
    movementPattern: 'leg_curl_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['seated_leg_curl', 'nordic_curl'],
    coachNote: 'Full range, slow eccentric, hips stay flat'
  },
  {
    id: 'seated_leg_curl',
    name: 'Seated leg curl',
    label: 'Machine',
    muscleGroup: 'hamstrings',
    secondaryMuscles: [],
    movementPattern: 'leg_curl_pattern',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['lying_leg_curl', 'nordic_curl'],
    coachNote: 'Stretched position is superior for muscle growth'
  },
  {
    id: 'nordic_curl',
    name: 'Nordic hamstring curl',
    label: 'Bodyweight',
    muscleGroup: 'hamstrings',
    secondaryMuscles: [],
    movementPattern: 'leg_curl_pattern',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['advanced'],
    substitutes: ['lying_leg_curl', 'romanian_deadlift'],
    coachNote: 'Eccentric only to start, extremely challenging'
  },
  {
    id: 'dumbbell_leg_curl',
    name: 'Dumbbell leg curl',
    label: 'Dumbbell',
    muscleGroup: 'hamstrings',
    secondaryMuscles: [],
    movementPattern: 'leg_curl_pattern',
    equipment: ['dumbbells_only', 'home_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['lying_leg_curl', 'nordic_curl'],
    coachNote: 'On bench face down, dumbbell between feet'
  },

  // ─── CALF RAISE ────────────────────────────────────────────────────
  {
    id: 'standing_calf_raise',
    name: 'Standing calf raise',
    label: 'Machine',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    movementPattern: 'calf_raise',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['seated_calf_raise', 'single_leg_calf_raise'],
    coachNote: 'Full stretch at bottom, full squeeze at top'
  },
  {
    id: 'seated_calf_raise',
    name: 'Seated calf raise',
    label: 'Machine',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    movementPattern: 'calf_raise',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['standing_calf_raise', 'single_leg_calf_raise'],
    coachNote: 'Targets soleus, bent knee position'
  },
  {
    id: 'single_leg_calf_raise',
    name: 'Single-leg calf raise',
    label: 'Dumbbell',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    movementPattern: 'calf_raise',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only', 'bodyweight'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['standing_calf_raise'],
    coachNote: 'Hold dumbbell for load, use step for range'
  },
  {
    id: 'leg_press_calf_raise',
    name: 'Leg press calf raise',
    label: 'Machine',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    movementPattern: 'calf_raise',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['standing_calf_raise'],
    coachNote: 'Toes on edge of platform, full range'
  },

  // ─── BICEP CURL ────────────────────────────────────────────────────
  {
    id: 'barbell_curl',
    name: 'Barbell curl',
    label: 'Barbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_curl', 'ez_bar_curl'],
    coachNote: 'Elbows pinned, no swinging, full range'
  },
  {
    id: 'ez_bar_curl',
    name: 'EZ bar curl',
    label: 'EZ bar',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_curl', 'dumbbell_curl'],
    coachNote: 'Easier on wrists than straight bar'
  },
  {
    id: 'dumbbell_curl',
    name: 'Dumbbell curl',
    label: 'Dumbbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_curl', 'hammer_curl'],
    coachNote: 'Supinate at top, squeeze hard, alternate or together'
  },
  {
    id: 'hammer_curl',
    name: 'Hammer curl',
    label: 'Dumbbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_curl', 'cable_curl'],
    coachNote: 'Neutral grip, hits brachialis and brachioradialis'
  },
  {
    id: 'cable_curl',
    name: 'Cable curl',
    label: 'Cable',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_curl', 'barbell_curl'],
    coachNote: 'Constant tension, great as finisher'
  },
  {
    id: 'incline_dumbbell_curl',
    name: 'Incline dumbbell curl',
    label: 'Dumbbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['dumbbell_curl', 'cable_curl'],
    coachNote: 'Long head stretch, elbows behind body at start'
  },
  {
    id: 'preacher_curl_barbell',
    name: 'Preacher curl',
    label: 'Barbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['barbell_curl', 'ez_bar_curl'],
    coachNote: 'Pad supports upper arm — eliminates cheating'
  },
  {
    id: 'concentration_curl',
    name: 'Concentration curl',
    label: 'Dumbbell',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['dumbbell_curl', 'cable_curl'],
    coachNote: 'Elbow on inner thigh — peak contraction focus'
  },
  {
    id: 'chin_up_bicep',
    name: 'Chin-up (bicep focus)',
    label: 'Bodyweight',
    muscleGroup: 'biceps',
    secondaryMuscles: ['back'],
    movementPattern: 'bicep_curl',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['barbell_curl', 'dumbbell_curl'],
    coachNote: 'Supinated grip, think about curling the bar to your chin'
  },

  // ─── TRICEP EXTENSION ──────────────────────────────────────────────
  {
    id: 'tricep_pushdown_cable',
    name: 'Cable tricep pushdown',
    label: 'Cable',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    movementPattern: 'tricep_extension',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['overhead_tricep_extension', 'skull_crusher'],
    coachNote: 'Elbows pinned, full extension, squeeze at bottom'
  },
  {
    id: 'skull_crusher',
    name: 'Skull crusher',
    label: 'EZ bar',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    movementPattern: 'tricep_extension',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['tricep_pushdown_cable', 'overhead_tricep_extension'],
    coachNote: 'EZ bar or dumbbells, elbows stay up, lower to forehead'
  },
  {
    id: 'overhead_tricep_extension',
    name: 'Overhead tricep extension',
    label: 'Dumbbell',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    movementPattern: 'tricep_extension',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['skull_crusher', 'tricep_pushdown_cable'],
    coachNote: 'Long head stretch, elbows close to head'
  },
  {
    id: 'cable_overhead_tricep',
    name: 'Cable overhead tricep extension',
    label: 'Cable',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    movementPattern: 'tricep_extension',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['overhead_tricep_extension', 'skull_crusher'],
    coachNote: 'Rope attachment overhead — long head stretch'
  },
  {
    id: 'tricep_dips',
    name: 'Tricep dips',
    label: 'Bodyweight',
    muscleGroup: 'triceps',
    secondaryMuscles: ['chest', 'shoulders'],
    movementPattern: 'tricep_extension',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['tricep_pushdown_cable', 'close_grip_bench'],
    coachNote: 'Upright torso biases triceps, lower to 90 degrees'
  },
  {
    id: 'close_grip_bench',
    name: 'Close-grip bench press',
    label: 'Barbell',
    muscleGroup: 'triceps',
    secondaryMuscles: ['chest', 'shoulders'],
    movementPattern: 'tricep_extension',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['skull_crusher', 'tricep_dips'],
    coachNote: 'Shoulder width grip, elbows tucked in'
  },
  {
    id: 'diamond_pushup',
    name: 'Diamond push-up',
    label: 'Bodyweight',
    muscleGroup: 'triceps',
    secondaryMuscles: ['chest'],
    movementPattern: 'tricep_extension',
    equipment: ['bodyweight', 'dumbbells_only', 'home_gym', 'full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['tricep_dips', 'overhead_tricep_extension'],
    coachNote: 'Hands close together, elbows track back'
  },
  {
    id: 'kickback_dumbbell',
    name: 'Dumbbell kickback',
    label: 'Dumbbell',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    movementPattern: 'tricep_extension',
    equipment: ['full_gym', 'home_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['overhead_tricep_extension', 'tricep_pushdown_cable'],
    coachNote: 'Upper arm parallel to floor, full extension'
  },
  {
    id: 'bench_dip',
    name: 'Bench dip',
    label: 'Bodyweight',
    muscleGroup: 'triceps',
    secondaryMuscles: ['chest', 'shoulders'],
    movementPattern: 'tricep_extension',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['tricep_dips', 'diamond_pushup'],
    coachNote: 'Hands on bench behind you — beginner friendly dip'
  },

  // ─── CORE ──────────────────────────────────────────────────────────
  {
    id: 'plank',
    name: 'Plank',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_anti_extension',
    equipment: ['bodyweight', 'dumbbells_only', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['ab_wheel', 'dead_bug'],
    coachNote: 'Straight line, squeeze everything, breathe'
  },
  {
    id: 'ab_wheel',
    name: 'Ab wheel rollout',
    label: 'Other',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_anti_extension',
    equipment: ['full_gym', 'home_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['plank', 'dead_bug'],
    coachNote: 'Brace hard before you roll, do not let lower back collapse'
  },
  {
    id: 'dead_bug',
    name: 'Dead bug',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_anti_extension',
    equipment: ['bodyweight', 'dumbbells_only', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['plank', 'ab_wheel'],
    coachNote: 'Lower back flat, slow controlled, opposite arm and leg'
  },
  {
    id: 'hanging_leg_raise',
    name: 'Hanging leg raise',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_flexion',
    equipment: ['full_gym', 'home_gym', 'bodyweight'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['cable_crunch', 'lying_leg_raise'],
    coachNote: 'Control the swing, posterior pelvic tilt at top'
  },
  {
    id: 'cable_crunch',
    name: 'Cable crunch',
    label: 'Cable',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_flexion',
    equipment: ['full_gym'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['hanging_leg_raise', 'lying_leg_raise'],
    coachNote: 'Hips stay still, crunch with abs not hip flexors'
  },
  {
    id: 'lying_leg_raise',
    name: 'Lying leg raise',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_flexion',
    equipment: ['bodyweight', 'dumbbells_only', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['hanging_leg_raise', 'cable_crunch'],
    coachNote: 'Lower back flat, slow controlled descent'
  },
  {
    id: 'russian_twist',
    name: 'Russian twist',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_rotation',
    equipment: ['bodyweight', 'dumbbells_only', 'home_gym', 'full_gym'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['pallof_press', 'cable_woodchop'],
    coachNote: 'Feet up, rotate fully, control the movement'
  },
  {
    id: 'bicycle_crunch',
    name: 'Bicycle crunch',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_rotation',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate'],
    substitutes: ['russian_twist', 'cable_crunch'],
    coachNote: 'Slow and controlled — opposite elbow to knee'
  },
  {
    id: 'side_plank',
    name: 'Side plank',
    label: 'Bodyweight',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_rotation',
    equipment: ['bodyweight', 'home_gym', 'full_gym', 'dumbbells_only'],
    experience: ['beginner', 'intermediate', 'advanced'],
    substitutes: ['plank', 'pallof_press'],
    coachNote: 'Hips up, straight line — targets obliques'
  },
  {
    id: 'pallof_press',
    name: 'Pallof press',
    label: 'Cable',
    muscleGroup: 'core',
    secondaryMuscles: [],
    movementPattern: 'core_rotation',
    equipment: ['full_gym'],
    experience: ['intermediate', 'advanced'],
    substitutes: ['russian_twist', 'plank'],
    coachNote: 'Anti-rotation, resist the cable pulling you sideways'
  },
];

export default exerciseLibrary;
