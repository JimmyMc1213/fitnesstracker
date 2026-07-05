import {
  buildCoachContext,
  dismissSundayCheckIn,
  effectiveNutritionTotalsForDateKey,
  formatDateKeyEyebrow,
  getHomeCoachPlan,
  getWeighInReactionForDisplay,
  homeGreetingTitle,
  localDateKey,
  mergeFutureYouDraft,
  planWeekIndex,
} from "@newyouai/core";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { NestableScrollContainer } from "react-native-draggable-flatlist";
import { TabScreenFade } from "@/components/motion/TabScreenFade";
import { useAuth } from "@/context/AuthContext";
import { hasAuthenticatedUser } from "@/lib/authSession";
import { useTabScreenInsets } from "@/lib/tabScreenInsets";

import { FutureYouSkipperReminderPill } from "@/components/home/FutureYouSkipperReminderPill";
import { HomeDailyHabitsCard } from "@/components/home/HomeDailyHabitsCard";
import { HomeDashboardCarousel } from "@/components/home/HomeDashboardCarousel";
import { HomeNewYouHeaderButton } from "@/components/home/HomeNewYouHeaderButton";
import { HomeSundayCheckInCard } from "@/components/home/HomeSundayCheckInCard";
import {
  activeWeekFocusCommitments,
  HomeWeekFocusCard,
} from "@/components/home/HomeWeekFocusCard";
import { ScreenHeader } from "@/components/home/ScreenHeader";
import { MobilityRoutineFlow } from "@/components/stretch/MobilityRoutineFlow";
import { WeighInCoachReaction } from "@/components/home/WeighInCoachReaction";
import { WeighInSheet } from "@/components/home/WeighInSheet";
import { IconChevR, IconPlus } from "@/components/icons/FitnessIcons";
import { useFitnessState } from "@/context/FitnessContext";
import { useFutureYouEntry } from "@/hooks/useFutureYouEntry";
import { useSundayCheckInHome } from "@/hooks/useSundayCheckInHome";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  shouldShowFutureYouSkipperReminderPill,
  shouldShowHomeNewYouHeaderButton,
} from "@/lib/futureYouHomeEntryModel";
import {
  buildHabitsForDateKey,
  dailyHabitTemplatesFromState,
  habitsForDateKey,
  pruneHabitsDoneByDay,
} from "@/lib/habits";
import { isMobilityHabit } from "@/lib/mobilityHabit";
import type { HabitTemplate } from "@newyouai/types";

export default function HomeScreen() {
  const { session, sessionResolved } = useAuth();
  const { colors, scheme } = useAppTheme();
  const { paddingTop, paddingBottom } = useTabScreenInsets();
  const { state, hydrated, setFitnessState } = useFitnessState();
  const params = useLocalSearchParams<{ mobility?: string }>();

  const [clock, setClock] = useState(() => new Date());
  const dateKeyToday = localDateKey(clock);
  const [viewDateKey, setViewDateKey] = useState(dateKeyToday);
  const activeDateKey = viewDateKey;
  const isViewingToday = activeDateKey === dateKeyToday;

  const [weighInOpen, setWeighInOpen] = useState(false);
  const [mobilityPreviewOpen, setMobilityPreviewOpen] = useState(false);
  const handledMobilityParamRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (viewDateKey > dateKeyToday) setViewDateKey(dateKeyToday);
  }, [dateKeyToday, viewDateKey]);

  const prevTodayKeyRef = useRef(dateKeyToday);
  useEffect(() => {
    const prevToday = prevTodayKeyRef.current;
    if (prevToday !== dateKeyToday) {
      setViewDateKey((vk) => (vk === prevToday ? dateKeyToday : vk));
      prevTodayKeyRef.current = dateKeyToday;
    }
  }, [dateKeyToday]);

  useEffect(() => {
    if (params.mobility !== "1" || handledMobilityParamRef.current) return;
    handledMobilityParamRef.current = true;
    setMobilityPreviewOpen(true);
  }, [params.mobility]);

  const totals = useMemo(() => {
    if (!state) return { cal: 0, p: 0, c: 0, f: 0 };
    return effectiveNutritionTotalsForDateKey(
      state.nutritionManualByDay,
      state.nutritionItemsByDay,
      activeDateKey,
    );
  }, [state, activeDateKey]);

  const dayEntry = state?.weightLog.find((e) => e.dateKey === activeDateKey);
  const greetingName = state?.displayName.trim() ?? "";
  const todayForGreeting = isViewingToday ? clock : new Date(activeDateKey.replace(/-/g, "/"));

  const { coachPlan, coachCtx } = useMemo(() => {
    if (!state) return { coachPlan: null, coachCtx: null };
    const ctx = buildCoachContext(
      state,
      activeDateKey,
      isViewingToday ? clock : new Date(`${activeDateKey}T12:00:00`),
    );
    return {
      coachPlan: isViewingToday ? getHomeCoachPlan(ctx) : null,
      coachCtx: ctx,
    };
  }, [state, activeDateKey, clock, isViewingToday]);

  const weekFocus = useMemo(() => {
    if (!state) return [];
    return activeWeekFocusCommitments(
      state.weekFocusCommitments ?? [],
      state.weekFocusWeekStartKey ?? null,
      dateKeyToday,
    );
  }, [state, dateKeyToday]);

  const weekFocusNumber = state
    ? planWeekIndex(new Date(`${dateKeyToday}T12:00:00`), state.planStartIso)
    : 1;

  const weighInReaction = useMemo(() => {
    if (!isViewingToday || !dayEntry || !coachCtx) return null;
    return getWeighInReactionForDisplay(coachCtx, dayEntry);
  }, [isViewingToday, dayEntry, coachCtx]);

  const sundayCheckIn = useSundayCheckInHome(state);
  const futureYouEntry = useFutureYouEntry(state);

  const futureYouHomeInput = useMemo(
    () => ({
      mode: futureYouEntry.mode,
      photoBlocked: futureYouEntry.photoBlocked,
      onboardingComplete: state?.onboardingComplete ?? false,
      futureYou: state?.futureYou,
      todayDateKey: dateKeyToday,
    }),
    [
      futureYouEntry.mode,
      futureYouEntry.photoBlocked,
      state?.onboardingComplete,
      state?.futureYou,
      dateKeyToday,
    ],
  );

  const showNewYouHeaderButton = shouldShowHomeNewYouHeaderButton(futureYouHomeInput);
  const showWeighInFullCard = isViewingToday && !dayEntry;
  const showNewYouReminderPill =
    isViewingToday &&
    showWeighInFullCard &&
    shouldShowFutureYouSkipperReminderPill(futureYouHomeInput);

  const activeHabits = state ? habitsForDateKey(state, activeDateKey) : [];

  const openNewYou = useCallback(() => {
    const mode = futureYouEntry.mode;
    if (mode === "upload_prompt") {
      router.push({ pathname: "/(tabs)/future-you", params: { openFutureYouUpload: "1" } });
      return;
    }
    if (mode === "reveal") {
      router.push({ pathname: "/(tabs)/future-you", params: { openFutureYouDetail: "1" } });
      return;
    }
    router.push("/(tabs)/future-you");
  }, [futureYouEntry.mode]);

  const patchFutureYou = useCallback(
    (patch: Parameters<typeof mergeFutureYouDraft>[1]) => {
      setFitnessState((s) => ({
        ...s,
        futureYou: mergeFutureYouDraft(s.futureYou, patch),
      }));
    },
    [setFitnessState],
  );

  const dismissNewYouReminderPill = useCallback(() => {
    patchFutureYou({ reminderDismissedDateKey: dateKeyToday });
  }, [patchFutureYou, dateKeyToday]);

  if (sessionResolved && !hasAuthenticatedUser(session)) {
    return <Redirect href="/(auth)" />;
  }

  if (!hydrated || !state) {
    return (
      <View
        testID="tab-home"
        className="flex-1 items-center justify-center px-screen-x"
        style={{ backgroundColor: "transparent", paddingTop }}
      >
        <Text style={{ color: colors.textSecondary }}>Loading…</Text>
      </View>
    );
  }

  const headerEyebrow = formatDateKeyEyebrow(activeDateKey);
  const headerTitle = isViewingToday
    ? homeGreetingTitle(greetingName, todayForGreeting)
    : new Date(activeDateKey.replace(/-/g, "/")).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

  const fuelLabel = isViewingToday ? "Fuel · Today" : "Fuel";

  function toggleHabit(id: string) {
    if (isMobilityHabit(id)) return;
    setFitnessState((s) => {
      const doneMap = s.habitsDoneByDay[activeDateKey] ?? {};
      const nextDone = !doneMap[id];
      const habitsDoneByDay = {
        ...s.habitsDoneByDay,
        [activeDateKey]: { ...doneMap, [id]: nextDone },
      };
      const weightLogged = s.weightLog.some((e) => e.dateKey === activeDateKey);
      const habits =
        activeDateKey === dateKeyToday
          ? buildHabitsForDateKey(s.habitTemplates, habitsDoneByDay, activeDateKey, { weightLogged })
          : s.habits;
      return { ...s, habits, habitsDoneByDay };
    });
  }

  function saveDailyHabitTemplates(templates: HabitTemplate[]) {
    setFitnessState((s) => {
      const mobilityTemplates = s.habitTemplates.filter((t) => isMobilityHabit(t.id));
      const nextTemplates = [...templates, ...mobilityTemplates];
      const templateIds = new Set(nextTemplates.map((h) => h.id));
      const habitsDoneByDay = pruneHabitsDoneByDay(s.habitsDoneByDay, templateIds);
      const weightLogged = s.weightLog.some((e) => e.dateKey === dateKeyToday);
      return {
        ...s,
        habitTemplates: nextTemplates,
        habitsDoneByDay,
        habits: buildHabitsForDateKey(nextTemplates, habitsDoneByDay, dateKeyToday, { weightLogged }),
      };
    });
  }

  return (
    <TabScreenFade style={{ flex: 1 }}>
      <MobilityRoutineFlow
        state={state}
        setState={setFitnessState}
        previewOpen={mobilityPreviewOpen}
        onPreviewOpenChange={setMobilityPreviewOpen}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
      >
      <NestableScrollContainer
        testID="tab-home"
        className="px-screen-x"
        style={{
          flex: 1,
          backgroundColor: "transparent",
          paddingTop,
        }}
        contentContainerStyle={{ paddingBottom }}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          eyebrow={headerEyebrow}
          title={headerTitle}
          right={
            <View className="flex-row items-center gap-2">
              {showNewYouHeaderButton ? <HomeNewYouHeaderButton onPress={openNewYou} /> : null}
              <Pressable
                onPress={() => router.push("/(tabs)/settings")}
                testID="home-settings"
                accessibilityLabel="Settings"
                className="h-11 w-11 items-center justify-center rounded-full border"
                style={{ borderColor: colors.border }}
              >
                <SymbolView
                  name={{ ios: "gearshape", android: "settings", web: "settings" }}
                  tintColor={colors.textSecondary}
                  size={20}
                />
              </Pressable>
            </View>
          }
        />

        {!isViewingToday ? (
          <Pressable onPress={() => setViewDateKey(dateKeyToday)} className="mt-1">
            <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
              Back to today
            </Text>
          </Pressable>
        ) : null}

        {showNewYouReminderPill ? (
          <FutureYouSkipperReminderPill onOpen={openNewYou} onDismiss={dismissNewYouReminderPill} />
        ) : null}

        {isViewingToday && sundayCheckIn.showCard && sundayCheckIn.data ? (
          <HomeSundayCheckInCard
            data={sundayCheckIn.data}
            completed={sundayCheckIn.completed}
            unitPreferences={state.unitPreferences}
            onReview={() => router.push("/(modals)/sunday-check-in")}
            onDismiss={() =>
              setFitnessState((prev) =>
                prev ? dismissSundayCheckIn(prev, new Date(), sundayCheckIn.previewSunday) : prev,
              )
            }
          />
        ) : null}

        {showWeighInFullCard ? (
          <Pressable
            testID="weigh-in-card"
            onPress={() => setWeighInOpen(true)}
            accessibilityLabel="Log morning weigh-in"
            className="mt-[18px] w-full flex-row items-center gap-3.5 rounded-xl border p-4"
            style={{
              borderColor: scheme === "dark" ? "rgba(255, 255, 255, 0.14)" : colors.border,
              backgroundColor: colors.card,
            }}
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{
                backgroundColor: scheme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
              }}
            >
              <IconPlus size={18} stroke={2.5} color={colors.textSecondary} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[13px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                Morning weigh-in
              </Text>
              <Text className="mt-1 text-[11px] font-medium" style={{ color: colors.textTertiary }}>
                Log weight and optional progress photo
              </Text>
            </View>
            <IconChevR size={14} color={colors.textTertiary} />
          </Pressable>
        ) : null}

        {weighInReaction ? (
          <WeighInCoachReaction adjustment={weighInReaction} displayName={greetingName} />
        ) : null}

        {isViewingToday && weekFocus.length > 0 && state.weekFocusWeekStartKey ? (
          <HomeWeekFocusCard
            commitments={weekFocus}
            weekStartKey={state.weekFocusWeekStartKey}
            dateKey={dateKeyToday}
            weekNumber={weekFocusNumber}
          />
        ) : null}

        <HomeDashboardCarousel
          totals={totals}
          targets={state.nutritionTargets}
          isToday={isViewingToday}
          label={fuelLabel}
          coachCtx={coachCtx}
          coachPlan={coachPlan}
          state={state}
          newYou={futureYouEntry.mode === "reveal"}
          onLogFuel={() => router.push("/(tabs)/nutrition")}
          onStartWorkout={() => router.push("/(tabs)/workout")}
          onReviewWorkout={() => router.push("/(tabs)/workout")}
          onLogWeighIn={() => setWeighInOpen(true)}
          onOpenNewYou={openNewYou}
        />

        <HomeDailyHabitsCard
          habits={activeHabits}
          dailyHabitTemplates={dailyHabitTemplatesFromState(state.habitTemplates)}
          stepsTarget={state.stepsTarget}
          planStartIso={state.planStartIso}
          dateKey={activeDateKey}
          readOnly={!isViewingToday}
          onToggle={toggleHabit}
          onMobilityPress={() => setMobilityPreviewOpen(true)}
          onOpenWeighIn={() => setWeighInOpen(true)}
          onSaveHabitTemplates={saveDailyHabitTemplates}
        />

        <View className="h-2" />
      </NestableScrollContainer>

      <WeighInSheet
        open={weighInOpen}
        onClose={() => setWeighInOpen(false)}
        dateKey={dateKeyToday}
        existing={dayEntry}
        unitPreferences={state.unitPreferences}
        setFitnessState={setFitnessState}
      />
      </MobilityRoutineFlow>
    </TabScreenFade>
  );
}
