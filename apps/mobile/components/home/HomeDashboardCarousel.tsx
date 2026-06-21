import type { CoachContext, HomeCoachPlan } from "@newyouai/core";
import {
  estimateRoutineSessionSeconds,
  formatEstimatedSessionMinutes,
  homePlanSubline,
  nextTrainingDayFrom,
} from "@newyouai/core";
import { useCallback, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Pressable,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { MacroBar } from "@/components/home/MacroBar";
import { MacroRing } from "@/components/home/MacroRing";
import { MACRO_COLORS } from "@/lib/macroColors";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { resolveCoachTaskNavigation } from "@/lib/coachTaskActions";
import { STRETCH_BLOCKS } from "@/lib/stretchRoutine";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { AppState, MacroTotals } from "@newyouai/types";

const CAROUSEL_CARD_HEIGHT = 196;
const SLIDE_COUNT = 2;

const REST_FOCUS_TAGS = [
  { icon: "💧", label: "Hydration" },
  { icon: "🥩", label: "Hit protein" },
  { icon: "😴", label: "8hrs sleep" },
] as const;

type Props = {
  totals: MacroTotals;
  targets: MacroTotals;
  isToday: boolean;
  label?: string;
  coachCtx: CoachContext | null;
  coachPlan: HomeCoachPlan | null;
  state: AppState;
  onLogFuel: () => void;
  onStartWorkout: () => void;
  onReviewWorkout: () => void;
  onOpenMobilityPreview?: () => void;
};

function CarouselCard({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View
      className="rounded-[14px] border px-4 py-[18px]"
      style={{
        height: CAROUSEL_CARD_HEIGHT,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      {children}
    </View>
  );
}

export function HomeDashboardCarousel({
  totals,
  targets,
  isToday,
  label = "Fuel · Today",
  coachCtx,
  coachPlan,
  state,
  onLogFuel,
  onStartWorkout,
  onReviewWorkout,
  onOpenMobilityPreview,
}: Props) {
  const { colors } = useAppTheme();
  const [activeSlide, setActiveSlide] = useState(0);
  const slideWidth = Dimensions.get("window").width - 48;
  const kcalLeft = Math.max(0, targets.cal - totals.cal);
  const proteinLeft = Math.max(0, targets.p - totals.p);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / slideWidth);
    setActiveSlide(Math.max(0, Math.min(SLIDE_COUNT - 1, idx)));
  }, [slideWidth]);

  const slides = [
    <FuelSlide
      key="fuel"
      totals={totals}
      targets={targets}
      label={label}
      kcalLeft={kcalLeft}
      isToday={isToday}
      onLogFuel={onLogFuel}
    />,
    <TrainingSlide
      key="training"
      coachCtx={coachCtx}
      coachPlan={coachPlan}
      state={state}
      isToday={isToday}
      proteinLeft={proteinLeft}
      onStartWorkout={onStartWorkout}
      onReviewWorkout={onReviewWorkout}
      onOpenMobilityPreview={onOpenMobilityPreview}
    />,
  ];

  return (
    <View className="mt-[18px]">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View key={index} style={{ width: slideWidth, paddingHorizontal: 2 }}>
            {slide}
          </View>
        ))}
      </ScrollView>

      <View className="mt-3.5 flex-row items-center justify-center gap-1.5">
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <Pressable
            key={i}
            onPress={() => setActiveSlide(i)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeSlide === i }}
            style={{
              width: activeSlide === i ? 18 : 6,
              height: 6,
              borderRadius: 999,
              backgroundColor: activeSlide === i ? colors.accent : colors.textTertiary,
              opacity: activeSlide === i ? 1 : 0.5,
            }}
          />
        ))}
      </View>
    </View>
  );
}

function FuelSlide({
  totals,
  targets,
  label,
  kcalLeft,
  isToday,
  onLogFuel,
}: {
  totals: MacroTotals;
  targets: MacroTotals;
  label: string;
  kcalLeft: number;
  isToday: boolean;
  onLogFuel: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <CarouselCard>
      <View className="flex-1 flex-row items-center gap-3.5">
        <MacroRing value={totals.cal} target={targets.cal} size={96} stroke={5} />
        <View className="min-w-0 flex-1 gap-1.5">
          <View>
            <Text
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              {label}
            </Text>
            <Text className="mt-1 text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
              {kcalLeft.toLocaleString()} cal left
            </Text>
          </View>
          <MacroBar label="Protein" value={totals.p} target={targets.p} color={MACRO_COLORS.protein} />
          <MacroBar label="Carbs" value={totals.c} target={targets.c} color={MACRO_COLORS.carbs} />
          <MacroBar label="Fat" value={totals.f} target={targets.f} color={MACRO_COLORS.fat} />
        </View>
      </View>
      {isToday ? (
        <Pressable onPress={onLogFuel} testID="home-log-fuel" className="mt-3 flex-row items-center gap-1">
          <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
            + Log fuel →
          </Text>
        </Pressable>
      ) : (
        <View className="mt-3 h-[18px]" />
      )}
    </CarouselCard>
  );
}

function TrainingSlide({
  coachCtx,
  coachPlan,
  state,
  isToday,
  proteinLeft,
  onStartWorkout,
  onReviewWorkout,
  onOpenMobilityPreview,
}: {
  coachCtx: CoachContext | null;
  coachPlan: HomeCoachPlan | null;
  state: AppState;
  isToday: boolean;
  proteinLeft: number;
  onStartWorkout: () => void;
  onReviewWorkout: () => void;
  onOpenMobilityPreview?: () => void;
}) {
  const { colors } = useAppTheme();
  const splitSubline = coachCtx ? homePlanSubline(state, coachCtx.now) : null;
  const template = coachCtx?.todayTemplate ?? null;
  const isTrainingDay = coachCtx?.isTrainingDay ?? false;
  const workoutDone = coachCtx?.workoutCompletedToday ?? false;

  if (isTrainingDay && template && !workoutDone) {
    const durationSec = estimateRoutineSessionSeconds(template);
    const durationLabel = formatEstimatedSessionMinutes(durationSec);
    const exerciseCount = template.exercises.length;
    const subtitleParts: string[] = [];
    if (durationLabel) subtitleParts.push(durationLabel);
    if (exerciseCount > 0) subtitleParts.push(`${exerciseCount} exercises`);

    return (
      <CarouselCard>
        <View className="flex-1 justify-between gap-3">
          <View>
            {isToday ? <TodayLabel /> : null}
            <Text className="text-[22px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              {template.name}
            </Text>
            {subtitleParts.length > 0 ? (
              <Text className="mt-1.5 text-[13px] font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
                {subtitleParts.join(" · ")}
              </Text>
            ) : null}
          </View>
          <View className="gap-2.5">
            {isToday ? (
              <PrimaryButton block onPress={onStartWorkout}>
                Start workout
              </PrimaryButton>
            ) : null}
            {splitSubline ? (
              <Text className="text-center text-[11px] font-medium" style={{ color: colors.textTertiary }}>
                {splitSubline}
              </Text>
            ) : null}
          </View>
        </View>
      </CarouselCard>
    );
  }

  if (isTrainingDay && template && workoutDone) {
    return (
      <CarouselCard>
        <View className="flex-1 justify-between gap-3">
          <View>
            {isToday ? <TodayLabel /> : null}
            <Text className="text-[22px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Session complete
            </Text>
            <Text className="mt-1.5 text-[13px] font-medium" style={{ color: colors.textSecondary }}>
              {template.name} · logged today
            </Text>
          </View>
          <View className="gap-2.5">
            {isToday ? (
              <Pressable
                onPress={onReviewWorkout}
                className="items-center rounded-xl border px-4 py-3"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Review session →
                </Text>
              </Pressable>
            ) : null}
            {splitSubline ? (
              <Text className="text-center text-[11px] font-medium" style={{ color: colors.textTertiary }}>
                {splitSubline}
              </Text>
            ) : null}
          </View>
        </View>
      </CarouselCard>
    );
  }

  const nextSession = nextTrainingDayFrom(state.workoutTemplates, coachCtx?.now ?? new Date());
  const restTask = coachPlan?.tasks.find((t) => t.kind === "rest_day");
  const showStretchCta =
    isToday && STRETCH_BLOCKS.length > 0 && restTask != null && resolveCoachTaskNavigation(restTask) === "stretch";

  return (
    <CarouselCard>
      <View className="flex-1 justify-between gap-3">
        <View>
          {isToday ? <TodayLabel /> : null}
          <Text className="text-[22px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            Rest day
          </Text>
          <Text className="mt-1.5 text-[13px] font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
            {nextSession
              ? `Next session: ${nextSession.fullName} · ${nextSession.template.name}`
              : (restTask?.label ?? "Recovery keeps the habit chain alive.")}
          </Text>
        </View>

        <View className="flex-row justify-between gap-1.5">
          {REST_FOCUS_TAGS.map(({ icon, label }) => (
            <View
              key={label}
              className="min-w-0 flex-1 flex-row items-center justify-center gap-1 rounded-full border px-2 py-1.5"
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
            >
              <Text className="text-xs">{icon}</Text>
              <Text className="text-xs font-medium" style={{ color: colors.textSecondary }} numberOfLines={1}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        <View className="gap-2.5">
          {showStretchCta ? (
            <Pressable
              onPress={onOpenMobilityPreview}
              testID="coach-stretch-cta"
              className="items-center rounded-xl border px-4 py-3"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                Start stretch routine →
              </Text>
            </Pressable>
          ) : isToday ? (
            <Text className="text-center text-[13px] font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
              Focus on fuel today, {Math.round(proteinLeft)}g protein left
            </Text>
          ) : null}
        </View>
      </View>
    </CarouselCard>
  );
}

function TodayLabel() {
  const { colors } = useAppTheme();
  return (
    <Text
      className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: colors.textTertiary }}
    >
      TODAY
    </Text>
  );
}
