import { computeNotificationPatches, localDateKey } from "@newyouai/core";
import type { AppState } from "@newyouai/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState as RNAppState } from "react-native";

import {
  cancelAllFitcoachReminders,
  syncLocalNotifications,
} from "@/lib/localNotifications";
import {
  getNotificationPermission,
  type NotificationPermissionState,
} from "@/lib/notificationPermission";

import { useFitnessState } from "./FitnessContext";

const SYNC_DEBOUNCE_MS = 500;

type NotificationSchedulerContextValue = {
  permission: NotificationPermissionState;
  refreshPermission: () => Promise<NotificationPermissionState>;
  triggerSync: () => Promise<void>;
};

const NotificationSchedulerContext = createContext<NotificationSchedulerContextValue | null>(null);

export function NotificationSchedulerProvider({ children }: { children: ReactNode }) {
  const { state, setFitnessState, hydrated } = useFitnessState();
  const [permission, setPermission] = useState<NotificationPermissionState>("undetermined");
  const reconcileRunningRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const permissionGranted = permission === "granted";

  const refreshPermission = useCallback(async () => {
    const next = await getNotificationPermission();
    setPermission(next);
    return next;
  }, []);

  const runSync = useCallback(async (currentState: AppState | null, granted: boolean) => {
    if (!currentState?.onboardingComplete) return;
    if (!granted) {
      await cancelAllFitcoachReminders();
      return;
    }
    await syncLocalNotifications(currentState, granted);
  }, []);

  const triggerSync = useCallback(async () => {
    const nextPermission = await refreshPermission();
    await runSync(stateRef.current, nextPermission === "granted");
  }, [refreshPermission, runSync]);

  useEffect(() => {
    void refreshPermission();
  }, [refreshPermission]);

  useEffect(() => {
    if (!hydrated || !state?.onboardingComplete) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      void runSync(stateRef.current, permissionGranted);
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [
    hydrated,
    state?.onboardingComplete,
    permissionGranted,
    state?.notificationPreferences,
    state?.workoutsCompletedByDay,
    state?.nutritionItemsByDay,
    state?.nutritionManualByDay,
    state?.workoutTemplates,
    state?.onboardingProfile?.workoutDaysPerWeek,
    runSync,
  ]);

  useEffect(() => {
    if (!state?.onboardingComplete) return;

    const reconcile = async () => {
      if (reconcileRunningRef.current) return;
      reconcileRunningRef.current = true;
      try {
        const granted = (await refreshPermission()) === "granted";
        const currentState = stateRef.current;
        if (!granted || !currentState?.onboardingComplete) return;

        const now = new Date();
        const patches = computeNotificationPatches(currentState, now, granted);

        let Notifications: typeof import("expo-notifications") | null = null;
        try {
          Notifications = await import("expo-notifications");
        } catch {
          return;
        }

        if (patches.workoutPayload) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: patches.workoutPayload.title,
              body: patches.workoutPayload.body,
              data: { tag: patches.workoutPayload.tag },
            },
            trigger: null,
          });
        }

        if (patches.nutritionPayload) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: patches.nutritionPayload.title,
              body: patches.nutritionPayload.body,
              data: { tag: patches.nutritionPayload.tag },
            },
            trigger: null,
          });
        }

        if (patches.notificationPreferences && (patches.workoutPayload || patches.nutritionPayload)) {
          setFitnessState((prev) => ({
            ...prev,
            notificationPreferences: {
              ...prev.notificationPreferences,
              ...patches.notificationPreferences,
            },
          }));
        }

        await syncLocalNotifications(currentState, granted);
      } finally {
        reconcileRunningRef.current = false;
      }
    };

    const sub = RNAppState.addEventListener("change", (next) => {
      if (next === "active") void reconcile();
    });

    return () => sub.remove();
  }, [state?.onboardingComplete, refreshPermission, setFitnessState]);

  useEffect(() => {
    if (!state?.onboardingComplete) return;

    let subscription: { remove: () => void } | undefined;

    void (async () => {
      try {
        const Notifications = await import("expo-notifications");
        subscription = Notifications.addNotificationReceivedListener((notification) => {
          const tag = notification.request.content.data?.tag;
          if (tag !== "fitcoach-workout" && tag !== "fitcoach-nutrition") return;

          const todayKey = localDateKey(new Date());
          setFitnessState((prev) => ({
            ...prev,
            notificationPreferences: {
              ...prev.notificationPreferences,
              ...(tag === "fitcoach-workout"
                ? { lastFiredWorkoutReminderDateKey: todayKey }
                : { lastFiredNutritionReminderDateKey: todayKey }),
            },
          }));
        });
      } catch {
        // expo-notifications unavailable (e.g. web)
      }
    })();

    return () => subscription?.remove();
  }, [state?.onboardingComplete, setFitnessState]);

  const value = useMemo(
    () => ({ permission, refreshPermission, triggerSync }),
    [permission, refreshPermission, triggerSync],
  );

  return (
    <NotificationSchedulerContext.Provider value={value}>{children}</NotificationSchedulerContext.Provider>
  );
}

export function useNotificationScheduler(): NotificationSchedulerContextValue {
  const ctx = useContext(NotificationSchedulerContext);
  if (!ctx) {
    throw new Error("useNotificationScheduler must be used within NotificationSchedulerProvider");
  }
  return ctx;
}
