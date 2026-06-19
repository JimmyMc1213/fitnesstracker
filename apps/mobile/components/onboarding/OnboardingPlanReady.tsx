import { weekdayMonStartIndex } from "@newyouai/core";
import { Text, View } from "react-native";

import { OnboardingContentReveal } from "@/components/motion";
import { TypewriterText } from "@/components/motion/TypewriterText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { MACRO_COLORS } from "@/lib/macroColors";
import type { OnboardingPlanSnapshot } from "@/lib/onboardingPlanSnapshot";
import { planReadyFirstCoachNote } from "@/lib/onboardingReinforcementCopy";
import { formatWaterVolume } from "@/lib/waterIntake";

const PLAN_READY_LABEL_MS = 600;
const PLAN_READY_SECTION_PAUSE_MS = 120;
const PLAN_READY_WAVE_PAUSE_MS = 350;
const PLAN_READY_WAVE_STEP_MS = 170;
const PLAN_READY_WAVE_MS = 600;

function planReadyMacroDelayMs(index: number): number {
  return PLAN_READY_LABEL_MS + PLAN_READY_SECTION_PAUSE_MS + index * PLAN_READY_WAVE_STEP_MS;
}

function planReadyWeekLabelDelayMs(): number {
  const macroWaveEndMs =
    PLAN_READY_LABEL_MS + PLAN_READY_SECTION_PAUSE_MS + 3 * PLAN_READY_WAVE_STEP_MS + PLAN_READY_WAVE_MS;
  return macroWaveEndMs + PLAN_READY_SECTION_PAUSE_MS;
}

function planReadyWeekSectionBaseMs(): number {
  return planReadyWeekLabelDelayMs() + PLAN_READY_LABEL_MS + PLAN_READY_WAVE_PAUSE_MS;
}

/** Stagger index after the "Your week" label: rows, then hydration label, oz, steps label, steps value. */
function planReadyWeekSequenceDelayMs(sequenceIndex: number): number {
  return planReadyWeekSectionBaseMs() + sequenceIndex * PLAN_READY_WAVE_STEP_MS;
}

function planReadyCoachDelayMs(weekRowCount: number): number {
  const lastSequenceIndex = weekRowCount + 3;
  return (
    planReadyWeekSectionBaseMs() +
    lastSequenceIndex * PLAN_READY_WAVE_STEP_MS +
    PLAN_READY_WAVE_MS +
    PLAN_READY_SECTION_PAUSE_MS
  );
}

type Props = {
  planSnapshot: OnboardingPlanSnapshot;
};

function MacroStat({
  value,
  label,
  tone,
  delay,
}: {
  value: number;
  label: string;
  tone?: "protein" | "carbs" | "fat";
  delay: number;
}) {
  const { colors } = useAppTheme();
  const toneColor =
    tone === "protein"
      ? MACRO_COLORS.protein
      : tone === "carbs"
        ? MACRO_COLORS.carbs
        : tone === "fat"
          ? MACRO_COLORS.fat
          : colors.textPrimary;

  return (
    <OnboardingContentReveal delay={delay} style={{ flex: 1 }}>
      <View className="items-start gap-1" testID={`plan-ready-macro-${label.replace(/\s+/g, "-")}`}>
        <Text className="text-xl font-bold" style={{ color: toneColor }}>
          {value.toLocaleString()}
        </Text>
        <Text className="text-[11px] leading-[13px]" style={{ color: colors.textTertiary }}>
          {label}
        </Text>
      </View>
    </OnboardingContentReveal>
  );
}

export function OnboardingPlanReady({ planSnapshot }: Props) {
  const { colors } = useAppTheme();
  const { ob, scheme } = useOnboardingTheme();
  const { macros, profile, templates, waterDailyTargetOz, stepsTarget, volumeUnit, timeline } = planSnapshot;
  const weekTemplates = [...templates].sort(
    (a, b) => weekdayMonStartIndex(a.dayLabel) - weekdayMonStartIndex(b.dayLabel),
  );
  const coachNote = planReadyFirstCoachNote(profile);
  const coachNoteColor = scheme === "light" ? "rgba(0, 0, 0, 0.78)" : "rgba(255, 255, 255, 0.72)";

  const weekLabelDelay = planReadyWeekLabelDelayMs();
  const coachDelay = planReadyCoachDelayMs(weekTemplates.length);
  const hydrationLabelDelay = planReadyWeekSequenceDelayMs(weekTemplates.length);
  const hydrationValueDelay = planReadyWeekSequenceDelayMs(weekTemplates.length + 1);
  const stepsLabelDelay = planReadyWeekSequenceDelayMs(weekTemplates.length + 2);
  const stepsValueDelay = planReadyWeekSequenceDelayMs(weekTemplates.length + 3);

  return (
    <View testID="onboarding-plan-ready" className="gap-3">
      <View className="gap-2">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: colors.textTertiary }}>
          Daily fuel
        </Text>
        <View className="flex-row gap-1.5">
          <MacroStat value={macros.cal} label="cal" delay={planReadyMacroDelayMs(0)} />
          <MacroStat value={macros.p} label="g protein" tone="protein" delay={planReadyMacroDelayMs(1)} />
          <MacroStat value={macros.c} label="g carbs" tone="carbs" delay={planReadyMacroDelayMs(2)} />
          <MacroStat value={macros.f} label="g fat" tone="fat" delay={planReadyMacroDelayMs(3)} />
        </View>
        <OnboardingContentReveal delay={planReadyMacroDelayMs(3) + 350}>
          <Text className="text-center text-[13px] font-medium" style={{ color: colors.textTertiary }}>
            Goal timeline · {timeline}
          </Text>
        </OnboardingContentReveal>
      </View>

      <View className="h-px" style={{ backgroundColor: colors.border }} />

      <View className="flex-row items-start">
        <View className="flex-1 gap-2">
          <OnboardingContentReveal delay={weekLabelDelay}>
            <Text className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: colors.textTertiary }}>
              Your week
            </Text>
          </OnboardingContentReveal>
          <View className="gap-1.5">
            {weekTemplates.map((routine, index) => (
              <OnboardingContentReveal key={routine.id} delay={planReadyWeekSequenceDelayMs(index)}>
                <View className="flex-row items-baseline gap-2.5">
                  <Text
                    className="text-xs font-medium"
                    style={{ color: colors.textTertiary, minWidth: 30 }}
                  >
                    {routine.dayLabel}
                  </Text>
                  <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {routine.name}
                  </Text>
                </View>
              </OnboardingContentReveal>
            ))}
          </View>
        </View>
        <View className="flex-1 gap-3.5 pt-[19px] pl-8">
          <View className="gap-1">
            <OnboardingContentReveal delay={hydrationLabelDelay}>
              <Text className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: colors.textTertiary }}>
                Hydration
              </Text>
            </OnboardingContentReveal>
            <OnboardingContentReveal delay={hydrationValueDelay}>
              <Text className="text-xl font-bold" style={{ color: MACRO_COLORS.hydration }}>
                {formatWaterVolume(waterDailyTargetOz, volumeUnit)}
              </Text>
            </OnboardingContentReveal>
          </View>
          <View className="gap-1">
            <OnboardingContentReveal delay={stepsLabelDelay}>
              <Text className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: colors.textTertiary }}>
                Steps
              </Text>
            </OnboardingContentReveal>
            <OnboardingContentReveal delay={stepsValueDelay}>
              <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                {stepsTarget.toLocaleString()}
              </Text>
            </OnboardingContentReveal>
          </View>
        </View>
      </View>

      <View className="h-px" style={{ backgroundColor: colors.border }} />

      <View className="gap-2.5">
        <OnboardingContentReveal delay={coachDelay + 120}>
          <Text className="text-base font-semibold" style={{ color: ob.coachBlueLabel }}>
            Coach
          </Text>
        </OnboardingContentReveal>
        <TypewriterText
          text={coachNote}
          startDelayMs={coachDelay + 720}
          className="text-[13px] font-medium"
          style={{ color: coachNoteColor, lineHeight: 19 }}
        />
      </View>
    </View>
  );
}
