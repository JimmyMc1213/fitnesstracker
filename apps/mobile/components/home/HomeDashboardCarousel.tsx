import type { CoachContext, HomeCoachPlan } from "@newyouai/core";
import {
  estimateRoutineSessionSeconds,
  formatEstimatedSessionMinutes,
  homePlanSubline,
  nextTrainingDayFrom,
} from "@newyouai/core";
import { IconDroplet, IconMeat, IconZzz } from "@tabler/icons-react-native";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useState } from "react";
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
import { futureYouWeekProgress } from "@/lib/futureYouTimeline";
import {
  FUTURE_YOU_CALLOUT_BG,
  FUTURE_YOU_GOLD,
  FUTURE_YOU_GOLD_DEEP,
  FUTURE_YOU_GOLD_MID,
} from "@/lib/futureYouTokens";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { AppState, MacroTotals } from "@newyouai/types";

type NewYouProgress = { week: number; totalWeeks: number };

const CAROUSEL_CARD_HEIGHT = 196;
const SLIDE_COUNT = 2;

const REST_FOCUS_TAGS = [
  { Icon: IconDroplet, label: "Hydration" },
  { Icon: IconMeat, label: "Hit protein" },
  { Icon: IconZzz, label: "8hrs sleep" },
] as const;

type Props = {
  totals: MacroTotals;
  targets: MacroTotals;
  isToday: boolean;
  label?: string;
  coachCtx: CoachContext | null;
  coachPlan: HomeCoachPlan | null;
  state: AppState;
  /** True when the user has a generated NewYou and should see the gold framing. */
  newYou?: boolean;
  onLogFuel: () => void;
  onStartWorkout: () => void;
  onReviewWorkout: () => void;
  onOpenMobilityPreview?: () => void;
  onOpenNewYou?: () => void;
};

function CarouselCard({ children, gold = false }: { children: React.ReactNode; gold?: boolean }) {
  const { colors, scheme } = useAppTheme();
  return (
    <View
      className="overflow-hidden rounded-[14px] border px-4 py-[18px]"
      style={{
        height: CAROUSEL_CARD_HEIGHT,
        borderColor: gold ? FUTURE_YOU_GOLD : colors.border,
        backgroundColor: colors.card,
      }}
    >
      {gold ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 rounded-[14px]"
          style={{ backgroundColor: scheme === "dark" ? "rgba(201, 168, 118, 0.10)" : "rgba(201, 168, 118, 0.07)" }}
        />
      ) : null}
      {children}
    </View>
  );
}

/** Small glowing gold pill that mirrors the home header NewYou button. */
function NewYouGoldButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open your NewYou"
      testID="home-carousel-newyou-button"
      hitSlop={8}
      className="h-8 flex-row items-center gap-1 rounded-full border px-3"
      style={{
        borderColor: FUTURE_YOU_GOLD,
        backgroundColor: FUTURE_YOU_CALLOUT_BG,
        shadowColor: FUTURE_YOU_GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.32,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <SymbolView
        name={{ ios: "sparkles", android: "auto_awesome", web: "auto_awesome" }}
        tintColor={FUTURE_YOU_GOLD_MID}
        size={12}
      />
      <Text className="text-[12px] font-bold tracking-tight" style={{ color: FUTURE_YOU_GOLD_MID }}>
        NewYou
      </Text>
    </Pressable>
  );
}

/** Gold progress line, e.g. "Week 3 of 13 to reach your NewYou". */
function NewYouProgressLine({ week, totalWeeks }: NewYouProgress) {
  const { scheme } = useAppTheme();
  const color = scheme === "dark" ? FUTURE_YOU_GOLD_MID : FUTURE_YOU_GOLD_DEEP;
  return (
    <Text className="mt-1.5 text-[13px] font-semibold leading-[1.45]" style={{ color }}>
      Week {week} of {totalWeeks} to reach your NewYou
    </Text>
  );
}

/** Top row of a slide: TODAY eyebrow on the left, optional gold button on the right. */
function SlideTopRow({
  isToday,
  newYou,
  onOpenNewYou,
}: {
  isToday: boolean;
  newYou: boolean;
  onOpenNewYou?: () => void;
}) {
  if (!isToday && !newYou) return null;
  return (
    <View className="mb-1.5 flex-row items-center justify-between">
      {isToday ? <TodayLabel gold={newYou} /> : <View />}
      {newYou ? <NewYouGoldButton onPress={onOpenNewYou} /> : null}
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
  newYou = false,
  onLogFuel,
  onStartWorkout,
  onReviewWorkout,
  onOpenMobilityPreview,
  onOpenNewYou,
}: Props) {
  const { colors } = useAppTheme();
  const [activeSlide, setActiveSlide] = useState(0);
  const slideWidth = Dimensions.get("window").width - 48;
  const kcalLeft = Math.max(0, targets.cal - totals.cal);
  const proteinLeft = Math.max(0, targets.p - totals.p);

  const newYouProgress = useMemo<NewYouProgress | null>(() => {
    if (!newYou || !isToday) return null;
    const profile = state.onboardingProfile;
    if (!profile || !state.planStartIso) return null;
    return futureYouWeekProgress(profile, state.planStartIso, coachCtx?.now ?? new Date());
  }, [newYou, isToday, state.onboardingProfile, state.planStartIso, coachCtx?.now]);

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
      newYouProgress={newYouProgress}
      onStartWorkout={onStartWorkout}
      onReviewWorkout={onReviewWorkout}
      onOpenMobilityPreview={onOpenMobilityPreview}
      onOpenNewYou={onOpenNewYou}
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
  newYouProgress,
  onStartWorkout,
  onReviewWorkout,
  onOpenMobilityPreview,
  onOpenNewYou,
}: {
  coachCtx: CoachContext | null;
  coachPlan: HomeCoachPlan | null;
  state: AppState;
  isToday: boolean;
  proteinLeft: number;
  newYouProgress: NewYouProgress | null;
  onStartWorkout: () => void;
  onReviewWorkout: () => void;
  onOpenMobilityPreview?: () => void;
  onOpenNewYou?: () => void;
}) {
  const { colors } = useAppTheme();
  const splitSubline = coachCtx ? homePlanSubline(state, coachCtx.now) : null;
  const template = coachCtx?.todayTemplate ?? null;
  const isTrainingDay = coachCtx?.isTrainingDay ?? false;
  const workoutDone = coachCtx?.workoutCompletedToday ?? false;
  const newYou = newYouProgress != null;

  if (isTrainingDay && template && !workoutDone) {
    const durationSec = estimateRoutineSessionSeconds(template);
    const durationLabel = formatEstimatedSessionMinutes(durationSec);
    const exerciseCount = template.exercises.length;
    const subtitleParts: string[] = [];
    if (durationLabel) subtitleParts.push(durationLabel);
    if (exerciseCount > 0) subtitleParts.push(`${exerciseCount} exercises`);

    return (
      <CarouselCard gold={newYou}>
        <View className="flex-1 justify-between gap-3">
          <View>
            <SlideTopRow isToday={isToday} newYou={newYou} onOpenNewYou={onOpenNewYou} />
            <Text className="text-[22px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              {template.name}
            </Text>
            {newYouProgress ? (
              <NewYouProgressLine week={newYouProgress.week} totalWeeks={newYouProgress.totalWeeks} />
            ) : subtitleParts.length > 0 ? (
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
            {!newYou && splitSubline ? (
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
      <CarouselCard gold={newYou}>
        <View className="flex-1 justify-between gap-3">
          <View>
            <SlideTopRow isToday={isToday} newYou={newYou} onOpenNewYou={onOpenNewYou} />
            <Text className="text-[22px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Session complete
            </Text>
            {newYouProgress ? (
              <NewYouProgressLine week={newYouProgress.week} totalWeeks={newYouProgress.totalWeeks} />
            ) : (
              <Text className="mt-1.5 text-[13px] font-medium" style={{ color: colors.textSecondary }}>
                {template.name} · logged today
              </Text>
            )}
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
            {!newYou && splitSubline ? (
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
    <CarouselCard gold={newYou}>
      <View className="flex-1 justify-between gap-3">
        <View>
          <SlideTopRow isToday={isToday} newYou={newYou} onOpenNewYou={onOpenNewYou} />
          <Text className="text-[22px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            Rest day
          </Text>
          {newYouProgress ? (
            <NewYouProgressLine week={newYouProgress.week} totalWeeks={newYouProgress.totalWeeks} />
          ) : (
            <Text className="mt-1.5 text-[13px] font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
              {nextSession
                ? `Next session: ${nextSession.fullName} · ${nextSession.template.name}`
                : (restTask?.label ?? "Recovery keeps the habit chain alive.")}
            </Text>
          )}
        </View>

        <View className="flex-row justify-between gap-1.5">
          {REST_FOCUS_TAGS.map(({ Icon, label }) => (
            <View
              key={label}
              className="min-w-0 flex-1 flex-row items-center justify-center gap-1 rounded-full border px-2 py-1.5"
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
            >
              <Icon size={13} color={colors.textSecondary} strokeWidth={2} />
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

function TodayLabel({ gold = false }: { gold?: boolean }) {
  const { colors, scheme } = useAppTheme();
  const goldColor = scheme === "dark" ? FUTURE_YOU_GOLD_MID : FUTURE_YOU_GOLD_DEEP;
  return (
    <Text
      className="text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: gold ? goldColor : colors.textTertiary }}
    >
      TODAY
    </Text>
  );
}
