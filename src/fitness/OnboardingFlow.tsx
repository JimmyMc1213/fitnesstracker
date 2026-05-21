import { useMemo, useState, type ReactNode } from "react";

import { loadTasksForToday, localDateKey } from "./dailyPlan";
import { DEFAULT_EXPERIENCE_LEVEL } from "./experienceLevel";
import { ExperienceLevelPicker } from "./ExperienceLevelPicker";
import { DEFAULT_EQUIPMENT_SETUP } from "./equipmentSetup";
import { EquipmentSetupPicker } from "./EquipmentSetupPicker";
import {
  activityLevelLabel,
  calculateNutritionTargets,
  nutritionGoalLabel,
} from "./nutritionCalculator";
import { DEFAULT_ONBOARDING_PROFILE, progressGoalFromOnboarding } from "./onboardingProfile";
import { OnboardingSegment } from "./OnboardingSegment";
import { OnboardingTemplateReview } from "./OnboardingTemplateReview";
import { UnitPreferencePicker } from "./UnitPreferencePicker";
import { DEFAULT_UNIT_PREFERENCES, cmFromInches, formatWeightFromLbs, inchesFromCm, parseWeightToLbs } from "./unitPreferences";
import { buildWorkoutTemplatesForDays } from "./workoutSplitByDays";
import type {
  ActivityLevel,
  AppState,
  ExperienceLevel,
  EquipmentSetup,
  MacroTotals,
  NutritionGoal,
  OnboardingProfile,
  UnitPreferences,
  UserGender,
  WorkoutDaysPerWeek,
  WorkoutRoutineTemplate,
} from "./types";

const STEP_LABELS = [
  "Units",
  "Experience",
  "Equipment",
  "Goal",
  "Stats",
  "Activity",
  "Schedule",
  "Templates",
  "Nutrition",
] as const;

const GOALS: NutritionGoal[] = ["bulk", "cut", "maintain"];
const ACTIVITY_LEVELS: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];
const GENDERS: UserGender[] = ["male", "female", "other"];
const DAY_OPTIONS: WorkoutDaysPerWeek[] = [3, 4, 5, 6];

function OnboardingShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}) {
  const pct = Math.round(((step + 1) / totalSteps) * 100);
  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "20px 20px 28px",
        background: "var(--bg)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
          <span>
            Step {step + 1} of {totalSteps}
          </span>
          <span>{STEP_LABELS[step]}</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "#fff", borderRadius: 2, transition: "width 0.2s" }} />
        </div>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 8px" }}>{title}</h1>
      <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.5)" }}>{subtitle}</p>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {onBack ? (
          <button
            type="button"
            className="tap"
            onClick={onBack}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 15,
              border: "0.5px solid var(--border)",
              background: "transparent",
              color: "#fff",
            }}
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          className="tap"
          disabled={continueDisabled}
          onClick={onContinue}
          style={{
            flex: onBack ? 2 : 1,
            padding: 14,
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            background: continueDisabled ? "rgba(255,255,255,0.25)" : "#fff",
            color: continueDisabled ? "rgba(0,0,0,0.4)" : "#000",
          }}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}

export function OnboardingFlow({ setState }: { setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const totalSteps = STEP_LABELS.length;
  const [step, setStep] = useState(0);
  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>({ ...DEFAULT_UNIT_PREFERENCES });
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(DEFAULT_EXPERIENCE_LEVEL);
  const [equipmentSetup, setEquipmentSetup] = useState<EquipmentSetup>(DEFAULT_EQUIPMENT_SETUP);
  const [profile, setProfile] = useState<OnboardingProfile>({ ...DEFAULT_ONBOARDING_PROFILE });
  const [draftTemplates, setDraftTemplates] = useState<WorkoutRoutineTemplate[]>(() =>
    buildWorkoutTemplatesForDays(5, DEFAULT_EXPERIENCE_LEVEL, DEFAULT_EQUIPMENT_SETUP),
  );
  const [macros, setMacros] = useState<MacroTotals>(() => calculateNutritionTargets(DEFAULT_ONBOARDING_PROFILE));

  const statsValid =
    profile.heightIn >= 48 &&
    profile.heightIn <= 96 &&
    profile.weightLbs >= 70 &&
    profile.weightLbs <= 450 &&
    profile.age >= 13 &&
    profile.age <= 100;

  const templatesValid = draftTemplates.length > 0 && draftTemplates.every((t) => t.exercises.length > 0);

  const computedMacros = useMemo(() => calculateNutritionTargets(profile), [profile]);

  function goNext() {
    if (step === 6) {
      setDraftTemplates(buildWorkoutTemplatesForDays(profile.workoutDaysPerWeek, experienceLevel, equipmentSetup));
    }
    if (step === 7) {
      setMacros(computedMacros);
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function finish() {
    const planStartIso = localDateKey(new Date());
    const progressGoal = progressGoalFromOnboarding(profile);
    setState((s) => ({
      ...s,
      unitPreferences,
      unitPreferencesChosen: true,
      experienceLevel,
      experienceLevelChosen: true,
      equipmentSetup,
      equipmentSetupChosen: true,
      onboardingProfile: profile,
      onboardingComplete: true,
      workoutTemplates: draftTemplates,
      nutritionTargets: macros,
      progressGoal,
      planStartIso,
      dailyTasks: loadTasksForToday(macros, planStartIso, s.stepsTarget, draftTemplates),
    }));
  }

  if (step === 0) {
    return (
      <OnboardingShell step={step} totalSteps={totalSteps} title="Choose your units" subtitle="Weight and height display across the app." onContinue={goNext}>
        <div className="card" style={{ padding: 20 }}>
          <UnitPreferencePicker value={unitPreferences} onChange={setUnitPreferences} />
        </div>
      </OnboardingShell>
    );
  }

  if (step === 1) {
    return (
      <OnboardingShell step={step} totalSteps={totalSteps} title="Your experience level" subtitle="Rep ranges and starting weights in your templates." onBack={goBack} onContinue={goNext}>
        <div className="card" style={{ padding: 20 }}>
          <ExperienceLevelPicker value={experienceLevel} onChange={setExperienceLevel} />
        </div>
      </OnboardingShell>
    );
  }

  if (step === 2) {
    return (
      <OnboardingShell step={step} totalSteps={totalSteps} title="Your equipment" subtitle="Exercises will match what you can perform." onBack={goBack} onContinue={goNext}>
        <div className="card" style={{ padding: 20 }}>
          <EquipmentSetupPicker value={equipmentSetup} onChange={setEquipmentSetup} />
        </div>
      </OnboardingShell>
    );
  }

  if (step === 3) {
    return (
      <OnboardingShell step={step} totalSteps={totalSteps} title="Your goal" subtitle="We'll adjust calories for bulk, cut, or maintenance." onBack={goBack} onContinue={goNext}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GOALS.map((g) => (
            <OnboardingSegment key={g} selected={profile.goal === g} onClick={() => setProfile((p) => ({ ...p, goal: g }))}>
              {nutritionGoalLabel(g)}
            </OnboardingSegment>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 4) {
    const wUnit = unitPreferences.weightUnit;
    const hUnit = unitPreferences.heightUnit;
    const weightDisplay = wUnit === "kg" ? profile.weightLbs / 2.2046226218 : profile.weightLbs;
    const heightCm = Math.round(cmFromInches(profile.heightIn));
    const heightFt = Math.floor(profile.heightIn / 12);
    const heightInRem = Math.round(profile.heightIn % 12);

    return (
      <OnboardingShell
        step={step}
        totalSteps={totalSteps}
        title="Your stats"
        subtitle="Used for calorie targets and progress tracking."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!statsValid}
      >
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            Weight ({wUnit})
            <input
              type="number"
              aria-label="Body weight"
              value={Number.isFinite(weightDisplay) ? Math.round(weightDisplay * 10) / 10 : ""}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                if (!Number.isFinite(n)) return;
                setProfile((p) => ({ ...p, weightLbs: parseWeightToLbs(n, wUnit) }));
              }}
              style={{ display: "block", width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
            />
          </label>
          {hUnit === "cm" ? (
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              Height (cm)
              <input
                type="number"
                aria-label="Height in centimeters"
                value={heightCm}
                onChange={(e) => {
                  const inches = inchesFromCm(parseFloat(e.target.value));
                  if (inches != null) setProfile((p) => ({ ...p, heightIn: inches }));
                }}
                style={{ display: "block", width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
              />
            </label>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <label style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                Ft
                <input
                  type="number"
                  aria-label="Height feet"
                  value={heightFt}
                  onChange={(e) => {
                    const ft = parseInt(e.target.value, 10);
                    if (!Number.isFinite(ft)) return;
                    setProfile((p) => ({ ...p, heightIn: ft * 12 + (p.heightIn % 12) }));
                  }}
                  style={{ display: "block", width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
                />
              </label>
              <label style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                In
                <input
                  type="number"
                  aria-label="Height inches"
                  value={heightInRem}
                  onChange={(e) => {
                    const inch = parseInt(e.target.value, 10);
                    if (!Number.isFinite(inch)) return;
                    setProfile((p) => ({ ...p, heightIn: Math.floor(p.heightIn / 12) * 12 + inch }));
                  }}
                  style={{ display: "block", width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
                />
              </label>
            </div>
          )}
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            Age
            <input
              type="number"
              aria-label="Age"
              value={profile.age}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) setProfile((p) => ({ ...p, age: n }));
              }}
              style={{ display: "block", width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
            />
          </label>
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>Gender (for BMR estimate)</div>
            <div style={{ display: "flex", gap: 8 }}>
              {GENDERS.map((g) => (
                <OnboardingSegment key={g} selected={profile.gender === g} onClick={() => setProfile((p) => ({ ...p, gender: g }))}>
                  {g === "male" ? "Male" : g === "female" ? "Female" : "Other"}
                </OnboardingSegment>
              ))}
            </div>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  if (step === 5) {
    return (
      <OnboardingShell step={step} totalSteps={totalSteps} title="Activity level" subtitle="How active you are outside the gym." onBack={goBack} onContinue={goNext}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ACTIVITY_LEVELS.map((level) => (
            <OnboardingSegment key={level} selected={profile.activityLevel === level} onClick={() => setProfile((p) => ({ ...p, activityLevel: level }))}>
              {activityLevelLabel(level)}
            </OnboardingSegment>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 6) {
    return (
      <OnboardingShell step={step} totalSteps={totalSteps} title="Training schedule" subtitle="How many days per week you plan to lift." onBack={goBack} onContinue={goNext}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {DAY_OPTIONS.map((d) => (
            <OnboardingSegment key={d} selected={profile.workoutDaysPerWeek === d} onClick={() => setProfile((p) => ({ ...p, workoutDaysPerWeek: d }))}>
              {d} days
            </OnboardingSegment>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  if (step === 7) {
    return (
      <OnboardingShell
        step={step}
        totalSteps={totalSteps}
        title="Review your program"
        subtitle="Reorder exercises, adjust targets, or swap moves. Each day shows an estimated session time."
        onBack={goBack}
        onContinue={goNext}
        continueDisabled={!templatesValid}
      >
        <OnboardingTemplateReview templates={draftTemplates} onChange={setDraftTemplates} />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={step}
      totalSteps={totalSteps}
      title="Nutrition targets"
      subtitle={`Estimated from your stats (~${computedMacros.cal} kcal). Adjust if needed.`}
      onBack={goBack}
      onContinue={finish}
      continueLabel="Finish setup"
    >
      <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
          Goal: {nutritionGoalLabel(profile.goal)} · {formatWeightFromLbs(profile.weightLbs, unitPreferences.weightUnit)} {unitPreferences.weightUnit}
        </p>
        {(["cal", "p", "c", "f"] as const).map((key) => (
          <label key={key} style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {key === "cal" ? "Calories" : key === "p" ? "Protein (g)" : key === "c" ? "Carbs (g)" : "Fat (g)"}
            <input
              type="number"
              aria-label={key}
              value={macros[key]}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n) && n >= 0) setMacros((m) => ({ ...m, [key]: n }));
              }}
              style={{ display: "block", width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "0.5px solid var(--border)", background: "#1A1A1A", color: "#fff" }}
            />
          </label>
        ))}
        <button
          type="button"
          className="tap"
          style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", background: "none", border: "none", textAlign: "left", padding: 0 }}
          onClick={() => setMacros(computedMacros)}
        >
          Reset to calculated values
        </button>
      </div>
    </OnboardingShell>
  );
}
