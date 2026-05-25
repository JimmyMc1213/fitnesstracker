import type { CSSProperties, ReactNode } from "react";

import { planReadyFirstCoachNote } from "./onboardingReinforcementCopy";
import { weekdayMonStartIndex } from "./trainingCalendar";
import { TypewriterText } from "./TypewriterText";
import type { MacroTotals, OnboardingProfile, VolumeUnit, WorkoutRoutineTemplate } from "./types";
import {
  DEFAULT_WATER_DAILY_TARGET_OZ,
  formatWaterVolume,
} from "./waterIntake";

const DEFAULT_STEPS_TARGET = 10_000;

const PLAN_READY_LABEL_MS = 600;
const PLAN_READY_SECTION_PAUSE_MS = 120;
const PLAN_READY_WAVE_PAUSE_MS = 350;
const PLAN_READY_WAVE_STEP_MS = 170;
const PLAN_READY_WAVE_MS = 600;

function planReadyMacroDelay(index: number): number {
  return (PLAN_READY_LABEL_MS + PLAN_READY_SECTION_PAUSE_MS + index * PLAN_READY_WAVE_STEP_MS) / 1000;
}

function planReadyWeekLabelDelay(): number {
  const macroWaveEndMs =
    PLAN_READY_LABEL_MS + PLAN_READY_SECTION_PAUSE_MS + 3 * PLAN_READY_WAVE_STEP_MS + PLAN_READY_WAVE_MS;
  return (macroWaveEndMs + PLAN_READY_SECTION_PAUSE_MS) / 1000;
}

function planReadyWeekSectionBaseMs(): number {
  return planReadyWeekLabelDelay() * 1000 + PLAN_READY_LABEL_MS + PLAN_READY_WAVE_PAUSE_MS;
}

/** Stagger index after the “Your week” label: rows, then hydration label, oz, steps label, steps value. */
function planReadyWeekSequenceDelay(sequenceIndex: number): number {
  return (planReadyWeekSectionBaseMs() + sequenceIndex * PLAN_READY_WAVE_STEP_MS) / 1000;
}

function planReadyCoachDelay(weekRowCount: number): number {
  const lastSequenceIndex = weekRowCount + 3;
  const coachStartMs =
    planReadyWeekSectionBaseMs() + lastSequenceIndex * PLAN_READY_WAVE_STEP_MS + PLAN_READY_WAVE_MS + PLAN_READY_SECTION_PAUSE_MS;
  return coachStartMs / 1000;
}

type Props = {
  displayName: string;
  macros: MacroTotals;
  profile: OnboardingProfile;
  templates: WorkoutRoutineTemplate[];
  waterDailyTargetOz?: number;
  stepsTarget?: number;
  volumeUnit?: VolumeUnit;
};

function MacroStat({
  value,
  label,
  tone,
  waveIndex,
}: {
  value: number;
  label: string;
  tone?: "protein" | "carbs" | "fat";
  waveIndex: number;
}) {
  return (
    <div
      className="onboarding-plan-ready__macro onboarding-plan-ready__wave-item onboarding-plan-ready__wave-item--horizontal"
      style={{ animationDelay: `${planReadyMacroDelay(waveIndex)}s` }}
    >
      <span
        className={`onboarding-plan-ready__macro-value${tone ? ` onboarding-plan-ready__macro-value--${tone}` : ""}`}
      >
        {value.toLocaleString()}
      </span>
      <span className="onboarding-plan-ready__macro-label">{label}</span>
    </div>
  );
}

function HabitWave({
  delaySec,
  className,
  children,
}: {
  delaySec: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`onboarding-plan-ready__wave-item onboarding-plan-ready__wave-item--vertical${className ? ` ${className}` : ""}`}
      style={{ animationDelay: `${delaySec}s` }}
    >
      {children}
    </span>
  );
}

export function OnboardingPlanReady({
  macros,
  profile,
  templates,
  waterDailyTargetOz = DEFAULT_WATER_DAILY_TARGET_OZ,
  stepsTarget = DEFAULT_STEPS_TARGET,
  volumeUnit = "oz",
}: Props) {
  const weekTemplates = [...templates].sort(
    (a, b) => weekdayMonStartIndex(a.dayLabel) - weekdayMonStartIndex(b.dayLabel),
  );

  const weekLabelDelay = planReadyWeekLabelDelay();
  const coachDelay = planReadyCoachDelay(weekTemplates.length);
  const coachNote = planReadyFirstCoachNote(profile);
  const hydrationLabelDelay = planReadyWeekSequenceDelay(weekTemplates.length);
  const hydrationValueDelay = planReadyWeekSequenceDelay(weekTemplates.length + 1);
  const stepsLabelDelay = planReadyWeekSequenceDelay(weekTemplates.length + 2);
  const stepsValueDelay = planReadyWeekSequenceDelay(weekTemplates.length + 3);

  return (
    <div
      className="onboarding-plan-ready"
      style={
        {
          "--plan-ready-week-delay": `${weekLabelDelay}s`,
          "--plan-ready-coach-delay": `${coachDelay}s`,
        } as CSSProperties
      }
    >
      <section className="onboarding-plan-ready__section onboarding-plan-ready__section--fuel">
        <h3 className="onboarding-plan-ready__label">Daily fuel</h3>
        <div className="onboarding-plan-ready__macros">
          <MacroStat value={macros.cal} label="kcal" waveIndex={0} />
          <MacroStat value={macros.p} label="g protein" tone="protein" waveIndex={1} />
          <MacroStat value={macros.c} label="g carbs" tone="carbs" waveIndex={2} />
          <MacroStat value={macros.f} label="g fat" tone="fat" waveIndex={3} />
        </div>
      </section>

      <div className="onboarding-plan-ready__divider" aria-hidden />

      <section className="onboarding-plan-ready__section onboarding-plan-ready__section--week">
        <div className="onboarding-plan-ready__week-layout">
          <div className="onboarding-plan-ready__week-main">
            <h3
              className="onboarding-plan-ready__label onboarding-plan-ready__wave-item onboarding-plan-ready__wave-item--vertical"
              style={{ animationDelay: `${weekLabelDelay}s` }}
            >
              Your week
            </h3>
            <ul className="onboarding-plan-ready__week">
              {weekTemplates.map((routine, index) => (
                <li
                  key={routine.id}
                  className="onboarding-plan-ready__week-row onboarding-plan-ready__wave-item onboarding-plan-ready__wave-item--vertical"
                  style={{ animationDelay: `${planReadyWeekSequenceDelay(index)}s` }}
                >
                  <span className="onboarding-plan-ready__week-day">{routine.dayLabel}</span>
                  <span className="onboarding-plan-ready__week-name">{routine.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="onboarding-plan-ready__habits">
            <div className="onboarding-plan-ready__habit">
              <HabitWave delaySec={hydrationLabelDelay} className="onboarding-plan-ready__label">
                Hydration
              </HabitWave>
              <HabitWave
                delaySec={hydrationValueDelay}
                className="onboarding-plan-ready__habit-value onboarding-plan-ready__habit-value--hydration"
              >
                {formatWaterVolume(waterDailyTargetOz, volumeUnit)}
              </HabitWave>
            </div>
            <div className="onboarding-plan-ready__habit">
              <HabitWave delaySec={stepsLabelDelay} className="onboarding-plan-ready__label">
                Steps
              </HabitWave>
              <HabitWave
                delaySec={stepsValueDelay}
                className="onboarding-plan-ready__habit-value onboarding-plan-ready__habit-value--steps"
              >
                {stepsTarget.toLocaleString()}
              </HabitWave>
            </div>
          </div>
        </div>
      </section>

      <div className="onboarding-plan-ready__divider onboarding-plan-ready__divider--coach" aria-hidden />

      <section className="onboarding-plan-ready__section onboarding-plan-ready__section--coach">
        <p className="onboarding-plan-ready__coach-heading onboarding-plan-ready__wave-item onboarding-plan-ready__wave-item--vertical">
          Coach
        </p>
        <TypewriterText
          text={coachNote}
          speed={28}
          startDelayMs={(coachDelay + 0.72) * 1000}
          className="onboarding-plan-ready__coach-note"
        />
      </section>
    </div>
  );
}
