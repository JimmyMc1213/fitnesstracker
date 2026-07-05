import type { CoachContext, HomeCoachPlan } from "@newyouai/core";
import {
  homePlanSubline,
  nextTrainingDayFrom,
} from "@newyouai/core";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useState } from "react";
import { Dimensions, ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { MacroBar } from "@/components/home/MacroBar";
import { MacroRing } from "@/components/home/MacroRing";
import { MACRO_COLORS } from "@/lib/macroColors";
import { IconCheck, IconChevR } from "@/components/icons/FitnessIcons";
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
  onLogWeighIn?: () => void;
  onOpenNewYou?: () => void;
};

function CarouselCard({
  children,
  gold = false,
  compactLayout = false,
}: {
  children: React.ReactNode;
  gold?: boolean;
  compactLayout?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      className="overflow-hidden rounded-[14px] border px-4"
      style={{
        height: CAROUSEL_CARD_HEIGHT,
        paddingTop: compactLayout ? 10 : 18,
        paddingBottom: compactLayout ? 12 : 18,
        borderColor: gold ? FUTURE_YOU_GOLD : colors.border,
        backgroundColor: colors.card,
      }}
    >
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
    <Text className="mt-1 text-[13px] font-semibold leading-[1.45]" style={{ color }}>
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
    <View className="mb-1 flex-row items-center justify-between">
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
  onLogWeighIn,
  onOpenNewYou,
}: Props) {
  const { colors } = useAppTheme();
  const [activeSlide, setActiveSlide] = useState(0);
  const slideWidth = Dimensions.get("window").width - 48;
  const kcalLeft = Math.max(0, targets.cal - totals.cal);

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
      newYouProgress={newYouProgress}
      onStartWorkout={onStartWorkout}
      onReviewWorkout={onReviewWorkout}
      onLogFuel={onLogFuel}
      onLogWeighIn={onLogWeighIn}
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
              backgroundColor: activeSlide === i ? colors.textPrimary : colors.textTertiary,
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

type TodoItem = {
  key: string;
  label: string;
  done: boolean;
  onPress?: () => void;
};

function TrainingSlide({
  coachCtx,
  coachPlan,
  state,
  isToday,
  newYouProgress,
  onStartWorkout,
  onReviewWorkout,
  onLogFuel,
  onLogWeighIn,
  onOpenNewYou,
}: {
  coachCtx: CoachContext | null;
  coachPlan: HomeCoachPlan | null;
  state: AppState;
  isToday: boolean;
  newYouProgress: NewYouProgress | null;
  onStartWorkout: () => void;
  onReviewWorkout: () => void;
  onLogFuel: () => void;
  onLogWeighIn?: () => void;
  onOpenNewYou?: () => void;
}) {
  const { colors } = useAppTheme();
  const splitSubline = coachCtx ? homePlanSubline(state, coachCtx.now) : null;
  const template = coachCtx?.todayTemplate ?? null;
  const isTrainingDay = coachCtx?.isTrainingDay ?? false;
  const workoutDone = coachCtx?.workoutCompletedToday ?? false;
  const newYou = newYouProgress != null;

  const proteinTarget = state.nutritionTargets.p;
  const nutritionGoalHit = coachCtx?.nutritionGoalHit ?? false;
  const scheduledWeighInDay = coachCtx?.scheduledWeighInDay ?? false;
  const weighInLoggedToday = coachCtx?.weighInLoggedToday ?? false;

  const title = isTrainingDay ? "Today's workout" : "Rest day";

  const todos: TodoItem[] = [];

  if (isTrainingDay && template) {
    todos.push({
      key: "workout",
      label: template.name,
      done: workoutDone,
      onPress: workoutDone ? onReviewWorkout : onStartWorkout,
    });
  }

  todos.push({
    key: "fuel",
    label: `Hit ${proteinTarget}g protein`,
    done: nutritionGoalHit,
    onPress: onLogFuel,
  });

  if (scheduledWeighInDay) {
    todos.push({
      key: "weigh-in",
      label: coachCtx?.isSunday ? "Sunday weigh-in" : "Log weigh-in",
      done: weighInLoggedToday,
      onPress: onLogWeighIn,
    });
  }

  const restTask = coachPlan?.tasks.find((t) => t.kind === "rest_day");
  const nextSession = nextTrainingDayFrom(state.workoutTemplates, coachCtx?.now ?? new Date());
  const restSubline = nextSession
    ? `Next session: ${nextSession.fullName} · ${nextSession.template.name}`
    : (restTask?.label ?? "Recovery keeps the habit chain alive.");
  const subline = isTrainingDay ? splitSubline : restSubline;

  return (
    <CarouselCard gold={newYou} compactLayout>
      <View className="flex-1 justify-center">
        <SlideTopRow isToday={isToday} newYou={newYou} onOpenNewYou={onOpenNewYou} />
        <Text className="text-[20px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>
          {title}
        </Text>
        {newYouProgress ? (
          <NewYouProgressLine week={newYouProgress.week} totalWeeks={newYouProgress.totalWeeks} />
        ) : subline ? (
          <Text
            className="mt-0.5 text-[12px] font-medium leading-[1.4]"
            style={{ color: colors.textSecondary }}
            numberOfLines={1}
          >
            {subline}
          </Text>
        ) : null}

        <View className="mt-1.5" style={{ gap: 2 }}>
          {todos.map((item) => (
            <TodoRow key={item.key} item={item} interactive={isToday} />
          ))}
        </View>
      </View>
    </CarouselCard>
  );
}

function TodoRow({ item, interactive }: { item: TodoItem; interactive: boolean }) {
  const { colors } = useAppTheme();
  const actionable = interactive && !item.done && Boolean(item.onPress);

  const inner = (
    <View className="flex-row items-center gap-2.5" style={{ paddingVertical: 4 }}>
      <View
        className="items-center justify-center rounded-full border"
        style={{
          height: 20,
          width: 20,
          borderColor: item.done ? colors.accent : colors.border,
          backgroundColor: item.done ? colors.accent : "transparent",
        }}
      >
        {item.done ? <IconCheck size={12} stroke={2.6} color={colors.background} /> : null}
      </View>
      <Text
        className="min-w-0 flex-1 text-[13px] font-semibold tracking-tight"
        numberOfLines={1}
        style={{
          color: item.done ? colors.textTertiary : colors.textPrimary,
          textDecorationLine: item.done ? "line-through" : "none",
        }}
      >
        {item.label}
      </Text>
      {actionable ? <IconChevR size={16} stroke={2.2} color={colors.textTertiary} /> : null}
    </View>
  );

  if (actionable) {
    return (
      <Pressable
        onPress={item.onPress}
        testID={`home-todo-${item.key}`}
        accessibilityRole="button"
        accessibilityLabel={item.label}
      >
        {inner}
      </Pressable>
    );
  }

  return <View testID={`home-todo-${item.key}`}>{inner}</View>;
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
