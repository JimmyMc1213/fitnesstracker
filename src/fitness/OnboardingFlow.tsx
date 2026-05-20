import { useMemo, useState, type CSSProperties } from "react";

import { calculateMacroTargets } from "./nutritionCalculator";
import {
  SPLIT_OPTIONS_BY_DAYS,
  buildWorkoutTemplatesForSplit,
  defaultSplitKeyForDays,
  splitLabelForKey,
} from "./workoutSplitTemplates";
import { WorkoutRoutineEditor } from "./screens/WorkoutRoutineEditor";
import { applyOnboardingToState, consumePendingDisplayName } from "./onboarding";
import { MacroBar } from "./shared";
import type {
  ActivityLevel,
  AppState,
  FitnessGoal,
  Gender,
  OnboardingProfile,
  WorkoutRoutineTemplate,
} from "./types";

type OnboardingFlowProps = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onComplete: () => void;
};

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const GOALS: { id: FitnessGoal; label: string; hint: string }[] = [
  { id: "bulk", label: "Bulk", hint: "Build muscle with a calorie surplus" },
  { id: "cut", label: "Cut", hint: "Lose fat while keeping strength" },
  { id: "maintain", label: "Maintain", hint: "Stay at your current weight" },
];

const ACTIVITY: { id: ActivityLevel; label: string; hint: string }[] = [
  { id: "sedentary", label: "Sedentary", hint: "Desk job, little exercise" },
  { id: "lightly_active", label: "Lightly active", hint: "Light exercise 1–3 days/week" },
  { id: "moderately_active", label: "Moderately active", hint: "Moderate exercise 3–5 days/week" },
  { id: "very_active", label: "Very active", hint: "Hard training 6–7 days/week" },
];

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

type HeightUnit = "ft" | "in";

function totalHeightInches(unit: HeightUnit, feet: string, inchesPart: string, inchesOnly: string): number | null {
  if (unit === "in") {
    const h = Number(inchesOnly);
    return Number.isFinite(h) && h > 0 ? h : null;
  }
  const ft = Number(feet);
  const inch = Number(inchesPart);
  if (!Number.isFinite(ft) || ft < 0 || !Number.isFinite(inch) || inch < 0 || inch > 11) return null;
  const total = ft * 12 + inch;
  return total > 0 ? total : null;
}

function feetInchesFromTotal(totalIn: number): { feet: string; inches: string } {
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn % 12);
  return { feet: String(ft), inches: String(inch) };
}

export function OnboardingFlow({ state, setState, onComplete }: OnboardingFlowProps) {
  const pendingName = useMemo(() => consumePendingDisplayName(), []);
  const [step, setStep] = useState<Step>(0);
  const [goal, setGoal] = useState<FitnessGoal>("maintain");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("ft");
  const [heightFeet, setHeightFeet] = useState("5");
  const [heightInchesPart, setHeightInchesPart] = useState("10");
  const [heightIn, setHeightIn] = useState("70");
  const [weightLbs, setWeightLbs] = useState("175");
  const [age, setAge] = useState("30");
  const [gender, setGender] = useState<Gender>("male");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderately_active");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [splitKey, setSplitKey] = useState(() => defaultSplitKeyForDays(4));
  const [templates, setTemplates] = useState<WorkoutRoutineTemplate[]>(() =>
    state.workoutTemplates.length ? state.workoutTemplates : [],
  );
  const [macroOverride, setMacroOverride] = useState<{ cal: string; p: string; c: string; f: string } | null>(null);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

  const profileDraft = useMemo((): OnboardingProfile | null => {
    const h = totalHeightInches(heightUnit, heightFeet, heightInchesPart, heightIn);
    const w = Number(weightLbs);
    const a = Number(age);
    if (h == null || !Number.isFinite(w) || w <= 0 || !Number.isFinite(a) || a <= 0) return null;
    return { goal, heightIn: h, weightLbs: w, age: a, gender, activityLevel, daysPerWeek, splitKey };
  }, [goal, heightUnit, heightFeet, heightInchesPart, heightIn, weightLbs, age, gender, activityLevel, daysPerWeek, splitKey]);

  const calculatedMacros = useMemo(() => {
    if (!profileDraft) return state.nutritionTargets;
    return calculateMacroTargets(
      profileDraft.weightLbs,
      profileDraft.heightIn,
      profileDraft.age,
      profileDraft.gender,
      profileDraft.activityLevel,
      profileDraft.goal,
    );
  }, [profileDraft, state.nutritionTargets]);

  const finalMacros = useMemo(() => {
    if (!macroOverride) return calculatedMacros;
    return {
      cal: Number(macroOverride.cal) || calculatedMacros.cal,
      p: Number(macroOverride.p) || calculatedMacros.p,
      c: Number(macroOverride.c) || calculatedMacros.c,
      f: Number(macroOverride.f) || calculatedMacros.f,
    };
  }, [macroOverride, calculatedMacros]);

  const splitOptions = SPLIT_OPTIONS_BY_DAYS[daysPerWeek] ?? [];

  const inputStyle: CSSProperties = {
    background: "#1A1A1A",
    border: "0.5px solid var(--border)",
    borderRadius: 12,
    padding: "14px 16px",
    color: "#fff",
    fontFamily: "var(--ui)",
    fontSize: 16,
    width: "100%",
    boxSizing: "border-box",
  };

  const goNext = () => {
    if (step === 3 && profileDraft) {
      setTemplates(buildWorkoutTemplatesForSplit(profileDraft.splitKey));
    }
    if (step < 5) setStep((s) => (s + 1) as Step);
  };

  const goBack = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
  };

  const switchHeightUnit = (unit: HeightUnit) => {
    if (unit === heightUnit) return;
    if (unit === "ft") {
      const total = totalHeightInches("in", "", "", heightIn);
      if (total != null) {
        const { feet, inches } = feetInchesFromTotal(total);
        setHeightFeet(feet);
        setHeightInchesPart(inches);
      }
    } else {
      const total = totalHeightInches("ft", heightFeet, heightInchesPart, "");
      if (total != null) setHeightIn(String(total));
    }
    setHeightUnit(unit);
  };

  const finish = () => {
    if (!profileDraft) return;
    const profile = { ...profileDraft };
    setState((s) => {
      const next = applyOnboardingToState(s, profile, pendingName ?? s.displayName);
      return { ...next, nutritionTargets: finalMacros, workoutTemplates: templates };
    });
    onComplete();
  };

  const editingTemplate = editingRoutineId ? templates.find((t) => t.id === editingRoutineId) ?? null : null;

  if (editingTemplate) {
    return (
      <WorkoutRoutineEditor
        state={state}
        template={editingTemplate}
        customExercises={state.customExercises}
        exerciseNotesByKey={state.exerciseNotesByKey}
        onNotePress={() => {}}
        onSave={(t) => {
          setTemplates((prev) => prev.map((x) => (x.id === t.id ? t : x)));
          setEditingRoutineId(null);
        }}
        onDelete={null}
        onClose={() => setEditingRoutineId(null)}
      />
    );
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-inner">
        <div className="onboarding-progress" aria-label={`Step ${step + 1} of 6`}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`onboarding-dot${i <= step ? " active" : ""}`} />
          ))}
        </div>

        {step === 0 ? (
          <>
            <h1 className="onboarding-title">What&apos;s your goal?</h1>
            <p className="onboarding-sub">We&apos;ll tailor calories and training around this.</p>
            <div className="onboarding-options">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`onboarding-option tap${goal === g.id ? " selected" : ""}`}
                  onClick={() => setGoal(g.id)}
                >
                  <span className="onboarding-option-label">{g.label}</span>
                  <span className="onboarding-option-hint">{g.hint}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <h1 className="onboarding-title">Your stats</h1>
            <p className="onboarding-sub">Used to calculate daily calories and macros.</p>
            <div className="onboarding-field">
              <span>Height</span>
              <div className="onboarding-segment" style={{ marginBottom: 10 }}>
                {(
                  [
                    { id: "ft" as const, label: "Feet + inches" },
                    { id: "in" as const, label: "Inches only" },
                  ] as const
                ).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={`onboarding-segment-btn tap${heightUnit === u.id ? " selected" : ""}`}
                    onClick={() => switchHeightUnit(u.id)}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
              {heightUnit === "ft" ? (
                <div className="onboarding-height-row">
                  <label className="onboarding-height-part">
                    <span>Feet</span>
                    <input
                      style={inputStyle}
                      inputMode="numeric"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      aria-label="Height feet"
                    />
                  </label>
                  <label className="onboarding-height-part">
                    <span>Inches</span>
                    <input
                      style={inputStyle}
                      inputMode="numeric"
                      value={heightInchesPart}
                      onChange={(e) => setHeightInchesPart(e.target.value)}
                      aria-label="Height inches"
                    />
                  </label>
                </div>
              ) : (
                <input
                  style={inputStyle}
                  inputMode="decimal"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  aria-label="Height in inches"
                />
              )}
            </div>
            <label className="onboarding-field">
              <span>Weight (lbs)</span>
              <input style={inputStyle} inputMode="decimal" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} />
            </label>
            <label className="onboarding-field">
              <span>Age</span>
              <input style={inputStyle} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
            </label>
            <div className="onboarding-field">
              <span>Gender</span>
              <div className="onboarding-segment">
                {(["male", "female"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`onboarding-segment-btn tap${gender === g ? " selected" : ""}`}
                    onClick={() => setGender(g)}
                  >
                    {g === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="onboarding-title">Activity level</h1>
            <p className="onboarding-sub">How active are you outside the gym?</p>
            <div className="onboarding-options">
              {ACTIVITY.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`onboarding-option tap${activityLevel === a.id ? " selected" : ""}`}
                  onClick={() => setActivityLevel(a.id)}
                >
                  <span className="onboarding-option-label">{a.label}</span>
                  <span className="onboarding-option-hint">{a.hint}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h1 className="onboarding-title">Training days</h1>
            <p className="onboarding-sub">How many days per week can you train?</p>
            <div className="onboarding-day-row">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`onboarding-day-btn tap${daysPerWeek === d ? " selected" : ""}`}
                  onClick={() => {
                    setDaysPerWeek(d);
                    setSplitKey(defaultSplitKeyForDays(d));
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="onboarding-options" style={{ marginTop: 20 }}>
              {splitOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`onboarding-option tap${splitKey === opt.key ? " selected" : ""}`}
                  onClick={() => setSplitKey(opt.key)}
                >
                  <span className="onboarding-option-label">{opt.name}</span>
                  <span className="onboarding-option-hint">{opt.description}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h1 className="onboarding-title">Review your split</h1>
            <p className="onboarding-sub">
              {splitLabelForKey(splitKey)} · {templates.length} workout{templates.length === 1 ? "" : "s"}
            </p>
            <div className="onboarding-routine-list">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="card tap onboarding-routine-card"
                  onClick={() => setEditingRoutineId(t.id)}
                >
                  <div className="between">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                        {t.dayLabel} · {t.exercises.length} exercises
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Edit</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>{t.focus}</div>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <h1 className="onboarding-title">Daily nutrition</h1>
            <p className="onboarding-sub">Calculated from your stats. Override any value if needed.</p>
            <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <label className="onboarding-field">
                <span>Calories</span>
                <input
                  style={inputStyle}
                  inputMode="numeric"
                  value={macroOverride?.cal ?? String(finalMacros.cal)}
                  onChange={(e) => setMacroOverride({ cal: e.target.value, p: macroOverride?.p ?? String(finalMacros.p), c: macroOverride?.c ?? String(finalMacros.c), f: macroOverride?.f ?? String(finalMacros.f) })}
                />
              </label>
              <label className="onboarding-field">
                <span>Protein (g)</span>
                <input
                  style={inputStyle}
                  inputMode="numeric"
                  value={macroOverride?.p ?? String(finalMacros.p)}
                  onChange={(e) => setMacroOverride({ cal: macroOverride?.cal ?? String(finalMacros.cal), p: e.target.value, c: macroOverride?.c ?? String(finalMacros.c), f: macroOverride?.f ?? String(finalMacros.f) })}
                />
              </label>
              <label className="onboarding-field">
                <span>Carbs (g)</span>
                <input
                  style={inputStyle}
                  inputMode="numeric"
                  value={macroOverride?.c ?? String(finalMacros.c)}
                  onChange={(e) => setMacroOverride({ cal: macroOverride?.cal ?? String(finalMacros.cal), p: macroOverride?.p ?? String(finalMacros.p), c: e.target.value, f: macroOverride?.f ?? String(finalMacros.f) })}
                />
              </label>
              <label className="onboarding-field">
                <span>Fat (g)</span>
                <input
                  style={inputStyle}
                  inputMode="numeric"
                  value={macroOverride?.f ?? String(finalMacros.f)}
                  onChange={(e) => setMacroOverride({ cal: macroOverride?.cal ?? String(finalMacros.cal), p: macroOverride?.p ?? String(finalMacros.p), c: macroOverride?.c ?? String(finalMacros.c), f: e.target.value })}
                />
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
                <MacroBar label="Protein" value={0} target={finalMacros.p} />
                <MacroBar label="Carbs" value={0} target={finalMacros.c} />
                <MacroBar label="Fat" value={0} target={finalMacros.f} />
              </div>
            </div>
          </>
        ) : null}

        <div className="onboarding-nav">
          {step > 0 ? (
            <button type="button" className="onboarding-back tap" onClick={goBack}>
              Back
            </button>
          ) : (
            <span />
          )}
          {step < 5 ? (
            <button
              type="button"
              className="onboarding-next tap"
              disabled={step === 1 && !profileDraft}
              onClick={goNext}
            >
              Continue
            </button>
          ) : (
            <button type="button" className="onboarding-next tap" onClick={finish}>
              Get started
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
