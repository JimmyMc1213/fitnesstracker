import { useEffect, useMemo } from "react";
import {
  IconBarbell,
  IconChecks,
  IconStopwatch,
  IconTrophy,
} from "@tabler/icons-react-native";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConfettiBurst, FullScreenOverlay, OnboardingContentReveal } from "@/components/motion";
import { WorkoutSummaryRing } from "@/components/workout/WorkoutSummaryRing";

import { BottomActionBar } from "@/components/BottomActionBar";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { GradientCard } from "@/components/ui/GradientCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { hapticSuccess } from "@/lib/haptics";
import type { TablerIcon } from "@/lib/tablerIcon";
import { COACH_GOLD_BG_SUBTLE, workoutAccentLabel } from "@/lib/workoutUiTokens";
import { formatWorkoutDuration, LBS_PER_KG } from "@newyouai/core";
import type {
  CompletedWorkoutSession,
  UnitPreferences,
  WorkoutSessionSummary,
} from "@newyouai/types";

const REVEAL_STEP_MS = 90;

/**
 * Spacing is inline rather than NativeWind classes: unused Tailwind spacing
 * classes are not compiled into the RN stylesheet, so they silently no-op.
 */
const SPACE = {
  ringTop: 32,
  ringToTitle: 24,
  titleToStats: 28,
  section: 30,
  headingToCard: 12,
  cardPad: 16,
  exerciseRow: 18,
  prCardGap: 10,
  bottom: 32,
} as const;

const RING_SIZE = 116;
const RING_STROKE = 8;

type Props = {
  open: boolean;
  summary: WorkoutSessionSummary;
  unitPreferences: UnitPreferences;
  /** Just-finished session, used for the per-exercise breakdown. */
  session?: CompletedWorkoutSession;
  onDone: () => void;
};

type ExerciseLine = {
  key: string;
  name: string;
  label?: string;
  sets: number;
  volume: number;
};

function StatTile({
  icon: Icon,
  value,
  label,
  tint,
}: {
  icon: TablerIcon;
  value: string;
  label: string;
  tint?: string;
}) {
  const { colors } = useAppTheme();

  return (
    <GradientCard padding={16} style={{ flex: 1 }}>
      <Icon size={16} color={tint ?? colors.textTertiary} strokeWidth={1.9} />
      <Text
        className="font-bold tabular-nums"
        style={{ marginTop: 12, fontSize: 18, letterSpacing: -0.4, color: colors.textPrimary }}
      >
        {value}
      </Text>
      <Text
        className="font-medium"
        style={{ marginTop: 5, fontSize: 11, color: colors.textTertiary }}
      >
        {label}
      </Text>
    </GradientCard>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  trailing,
  tint,
}: {
  icon: TablerIcon;
  title: string;
  trailing?: string;
  tint: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        marginBottom: SPACE.headingToCard,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Icon size={16} color={tint} strokeWidth={1.9} />
      <Text
        className="font-bold uppercase"
        style={{ flex: 1, fontSize: 13, letterSpacing: 1.4, color: colors.textSecondary }}
      >
        {title}
      </Text>
      {trailing ? (
        <Text className="font-bold" style={{ fontSize: 13, color: tint }}>
          {trailing}
        </Text>
      ) : null}
    </View>
  );
}

export function WorkoutSummarySheet({ open, summary, unitPreferences, session, onDone }: Props) {
  const { colors, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const gold = workoutAccentLabel(theme);
  const isKg = unitPreferences.weightUnit === "kg";
  const volLabel = isKg ? "kg·reps" : "lb·reps";

  const toDisplayVolume = (raw: number) => (isKg ? Math.round(raw / LBS_PER_KG) : Math.round(raw));
  const displayVolume = summary.totalVolume > 0 ? toDisplayVolume(summary.totalVolume) : 0;

  const completion =
    summary.totalSets > 0 ? Math.min(1, summary.doneSets / summary.totalSets) : 0;
  const completionPct = Math.round(completion * 100);

  const exerciseLines = useMemo<ExerciseLine[]>(() => {
    if (!session) return [];
    return session.exercises.map((ex) => ({
      key: ex.id,
      name: ex.name,
      label: ex.label,
      sets: ex.sets.length,
      volume: ex.sets.reduce((total, st) => total + st.w * st.r, 0),
    }));
  }, [session]);

  const peakVolume = exerciseLines.reduce((max, line) => Math.max(max, line.volume), 0);

  useEffect(() => {
    if (open) hapticSuccess();
  }, [open]);

  return (
    <FullScreenOverlay open={open} motionVariant="fade" onRequestClose={onDone}>
      <View testID="workout-summary" className="flex-1" style={{ paddingTop: insets.top }}>
        <ScrollView
          className="flex-1 px-screen-x"
          contentContainerStyle={{ paddingBottom: SPACE.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <OnboardingContentReveal delay={REVEAL_STEP_MS}>
            <View style={{ alignItems: "center", paddingTop: SPACE.ringTop }}>
              <WorkoutSummaryRing
                progress={completion}
                size={RING_SIZE}
                stroke={RING_STROKE}
                trackColor={colors.border}
              >
                <Text
                  className="font-bold tabular-nums"
                  style={{ fontSize: 27, letterSpacing: -0.6, color: colors.textPrimary }}
                >
                  {completionPct}
                  <Text style={{ fontSize: 15, color: gold }}>%</Text>
                </Text>
                <Text
                  className="font-semibold uppercase"
                  style={{
                    marginTop: 5,
                    fontSize: 10,
                    letterSpacing: 0.9,
                    color: colors.textTertiary,
                  }}
                >
                  {summary.doneSets} of {summary.totalSets} sets
                </Text>
              </WorkoutSummaryRing>
            </View>
          </OnboardingContentReveal>

          <OnboardingContentReveal delay={REVEAL_STEP_MS * 2}>
            <View style={{ alignItems: "center", paddingTop: SPACE.ringToTitle }}>
              <Text
                className="font-semibold uppercase"
                style={{ fontSize: 11, letterSpacing: 2, color: gold }}
              >
                Workout complete
              </Text>
              <Text
                className="text-center font-bold"
                style={{
                  marginTop: 10,
                  fontSize: 25,
                  letterSpacing: -0.5,
                  color: colors.textPrimary,
                }}
              >
                {summary.title}
              </Text>
              <Text
                className="font-medium"
                style={{ marginTop: 6, fontSize: 14, color: colors.textSecondary }}
              >
                Nice work, session saved
              </Text>
            </View>
          </OnboardingContentReveal>

          <OnboardingContentReveal delay={REVEAL_STEP_MS * 3}>
            <View style={{ marginTop: SPACE.titleToStats, flexDirection: "row", gap: 12 }}>
              <StatTile
                icon={IconStopwatch}
                value={formatWorkoutDuration(summary.durationSec)}
                label="Duration"
                tint={gold}
              />
              <StatTile
                icon={IconChecks}
                value={`${summary.doneSets}`}
                label="Sets done"
                tint={gold}
              />
              <StatTile
                icon={IconBarbell}
                value={displayVolume > 0 ? displayVolume.toLocaleString() : "—"}
                label={displayVolume > 0 ? volLabel : "Volume"}
                tint={gold}
              />
            </View>
          </OnboardingContentReveal>

          {exerciseLines.length > 0 ? (
            <OnboardingContentReveal delay={REVEAL_STEP_MS * 4}>
              <View style={{ marginTop: SPACE.section }}>
                <SectionHeading
                  icon={IconBarbell}
                  title="Exercises"
                  trailing={`${exerciseLines.length}`}
                  tint={gold}
                />
                <GradientCard padding={SPACE.cardPad}>
                  <View style={{ gap: SPACE.exerciseRow }}>
                    {exerciseLines.map((line) => {
                      const displayLineVolume = toDisplayVolume(line.volume);
                      const fill = peakVolume > 0 ? Math.max(0.06, line.volume / peakVolume) : 0;
                      return (
                        <View key={line.key} style={{ gap: 12 }}>
                          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                            <Text
                              className="font-semibold"
                              style={{
                                minWidth: 0,
                                flex: 1,
                                fontSize: 15,
                                color: colors.textPrimary,
                              }}
                              numberOfLines={1}
                            >
                              {line.name}
                              {line.label ? (
                                <Text className="font-semibold" style={{ fontSize: 11, color: gold }}>
                                  {"  "}
                                  {line.label.toUpperCase()}
                                </Text>
                              ) : null}
                            </Text>
                            <Text
                              className="font-semibold tabular-nums"
                              style={{ fontSize: 13, color: colors.textSecondary }}
                            >
                              {line.sets} × set{line.sets === 1 ? "" : "s"}
                            </Text>
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <View
                              style={{
                                height: 6,
                                flex: 1,
                                overflow: "hidden",
                                borderRadius: 999,
                                backgroundColor: colors.backgroundTertiary,
                              }}
                            >
                              <View
                                style={{
                                  height: "100%",
                                  width: `${fill * 100}%`,
                                  borderRadius: 999,
                                  backgroundColor: gold,
                                }}
                              />
                            </View>
                            <Text
                              className="font-medium tabular-nums"
                              style={{ fontSize: 11, color: colors.textTertiary }}
                            >
                              {displayLineVolume.toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </GradientCard>
              </View>
            </OnboardingContentReveal>
          ) : null}

          <OnboardingContentReveal delay={REVEAL_STEP_MS * 5}>
            <View style={{ marginTop: SPACE.section }}>
              <SectionHeading
                icon={IconTrophy}
                title="Personal records"
                trailing={summary.prs.length > 0 ? `${summary.prs.length} new` : undefined}
                tint={gold}
              />
              {summary.prs.length > 0 ? (
                <View style={{ gap: SPACE.prCardGap }}>
                  {summary.prs.map((pr) => (
                    <GradientCard
                      key={`${pr.exerciseName}-${pr.detail}`}
                      padding={16}
                      accentColor={gold}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                        <View
                          style={{
                            height: 36,
                            width: 36,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 999,
                            backgroundColor: COACH_GOLD_BG_SUBTLE,
                          }}
                        >
                          <IconTrophy size={17} color={gold} strokeWidth={1.9} />
                        </View>
                        <View style={{ minWidth: 0, flex: 1 }}>
                          <Text
                            className="font-semibold"
                            style={{ fontSize: 15, color: colors.textPrimary }}
                            numberOfLines={1}
                          >
                            {pr.exerciseName}
                          </Text>
                          <Text
                            className="font-semibold tabular-nums"
                            style={{ marginTop: 4, fontSize: 13, color: gold }}
                          >
                            {pr.detail}
                          </Text>
                        </View>
                      </View>
                    </GradientCard>
                  ))}
                </View>
              ) : (
                <GradientCard padding={SPACE.cardPad}>
                  <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>
                    No PRs this session. Add a rep or a little weight next time and this fills up.
                  </Text>
                </GradientCard>
              )}
            </View>
          </OnboardingContentReveal>

          {summary.needsWork.length > 0 ? (
            <OnboardingContentReveal delay={REVEAL_STEP_MS * 6}>
              <View style={{ marginTop: SPACE.section }}>
                <SectionHeading icon={IconChecks} title="Needs work" tint={colors.textTertiary} />
                <GradientCard padding={SPACE.cardPad}>
                  <View style={{ gap: 14 }}>
                    {summary.needsWork.map((row) => (
                      <View key={`${row.exerciseName}-${row.detail}`}>
                        <Text
                          className="font-semibold"
                          style={{ fontSize: 15, color: colors.textPrimary }}
                        >
                          {row.exerciseName}
                        </Text>
                        <Text
                          className="font-medium"
                          style={{ marginTop: 4, fontSize: 13, color: colors.textSecondary }}
                        >
                          {row.detail}
                        </Text>
                      </View>
                    ))}
                  </View>
                </GradientCard>
              </View>
            </OnboardingContentReveal>
          ) : null}
        </ScrollView>

        <BottomActionBar className="px-screen-x pt-3">
          <PrimaryButton block tone="gold" onPress={onDone}>
            Back to workouts
          </PrimaryButton>
        </BottomActionBar>

        {open ? <ConfettiBurst key={summary.title} count={70} /> : null}
      </View>
    </FullScreenOverlay>
  );
}
