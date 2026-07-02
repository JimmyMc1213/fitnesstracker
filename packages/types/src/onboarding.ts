import type { AppTheme } from "./app-theme";
import type { FutureYouDraft } from "./future-you";
import type { MacroTotals } from "./macros";
import type { NotificationPreferences } from "./notifications";
import type { UnitPreferences } from "./units";
import type { WorkoutRoutineTemplate } from "./workout";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type EquipmentSetup = "full_gym" | "home_gym" | "dumbbells_only" | "bodyweight_only";

export type NutritionGoal = "bulk" | "cut" | "maintain";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type UserGender = "male" | "female" | "other";

export type WorkoutDaysPerWeek = 3 | 4 | 5 | 6;

export type GoalPace = "slow" | "balanced" | "aggressive";

export type ReferralSource =
  | "app_store"
  | "tiktok"
  | "youtube"
  | "x"
  | "instagram"
  | "google"
  | "facebook"
  | "friend"
  | "reddit"
  | "other";

export type OnboardingBarrier =
  | "falling_off"
  | "eating"
  | "no_plan"
  | "life_busy"
  | "no_results";

export type DietaryRestriction =
  | "no_restrictions"
  | "no_red_meat"
  | "pescatarian"
  | "vegetarian"
  | "vegan"
  | "dairy_free"
  | "gluten_free";

export type TrainingStyle = "directive" | "flexible" | "accountable" | "beginner_guided";

/** Preferred session length bucket from onboarding. */
export type TrainingSessionDuration =
  | "30_or_less"
  | "30_to_45"
  | "45_to_60"
  | "60_to_90"
  | "90_plus";

export type SubscriptionTier = "free" | "pro";

export type ResidencyCountry = "US" | "CA";

/** Stats and preferences collected during full onboarding (FTI-14). */
export type OnboardingProfile = {
  /** Unset until the user picks a goal during onboarding. */
  goal?: NutritionGoal;
  heightIn: number;
  weightLbs: number;
  age: number;
  /** ISO YYYY-MM-DD; when set, age is derived at normalize time. */
  dateOfBirth?: string;
  /** Unset until the user picks a gender during onboarding. */
  gender?: UserGender;
  /** Unset until the user picks activity level during onboarding. */
  activityLevel?: ActivityLevel;
  /** Unset until the user picks training days during onboarding. */
  workoutDaysPerWeek?: WorkoutDaysPerWeek;
  /** Mon–Sun labels aligned to workout templates (backfilled on migrate). */
  trainingWeekdays?: string[];
  /** Target session length for workout planning. */
  sessionDuration?: TrainingSessionDuration;
  /** Target weight for cut/bulk progress bar. */
  goalWeightLbs?: number;
  /** Cut/bulk pace for calorie adjustment. */
  pace?: GoalPace;
  /** Where the user heard about Gymmy (onboarding survey). */
  referralSource?: ReferralSource;
  /** Barriers selected during onboarding ("What's held you back before?"). */
  barriers?: OnboardingBarrier[];
  /** Foods the user avoids; drives nutrition filtering. */
  dietaryRestrictions?: DietaryRestriction[];
  /** How the user prefers coach guidance during workouts. */
  trainingStyle?: TrainingStyle;
  /** Self-reported country for Future You regional availability. */
  residencyCountry?: ResidencyCountry;
  /** US state or Canadian province/territory code (e.g. CA, QC). */
  residencyRegion?: string;
};

/** Session length bucket from the workout plan engine (`splitTemplates.ts`). */
export type SessionLength = "under_30" | "30_45" | "45_60" | "60_90" | "90_plus";

/** In-progress onboarding wizard state for resume (FTI-70). */
export type OnboardingDraft = {
  version: number;
  stepIndex: number;
  updatedAtIso: string;
  displayName: string;
  unitPreferences: UnitPreferences;
  /** Unset until the experience step is completed. */
  experienceLevel?: ExperienceLevel;
  /** Unset until the equipment step is completed. */
  equipmentSetup?: EquipmentSetup;
  profile: OnboardingProfile;
  /** Preferred session length for plan generation. */
  sessionLength?: SessionLength;
  draftTemplates?: WorkoutRoutineTemplate[];
  macros?: MacroTotals;
  notificationPrefs?: NotificationPreferences;
  subscriptionTier?: SubscriptionTier;
  /** Light/dark appearance chosen during onboarding. */
  theme?: AppTheme;
  /** Future You photo path, motivation, and generation job (local onboarding draft only). */
  futureYou?: FutureYouDraft;
};
