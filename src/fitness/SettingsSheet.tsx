import { useEffect, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";

import { generateDailyTasksForDate, localDateKey } from "./dailyPlan";
import { resolveWorkoutDaysPerWeek } from "./trainingCalendar";
import { buildHabitsForDateKey } from "./data";
import { useFitnessSync } from "./FitnessSyncContext";
import { IconBolt, IconDroplet, IconMoon, IconRun, IconX } from "./icons";
import { useTheme } from "./ThemeContext";
import type { AppTheme } from "./theme";
import { UnitPreferencePicker } from "./UnitPreferencePicker";
import { EquipmentSetupPicker } from "./EquipmentSetupPicker";
import { buildWorkoutTemplates } from "./workoutTemplateBuilder";
import { NotificationPreferencesPicker } from "./NotificationPreferencesPicker";
import { getNotificationPermission } from "./notificationPermission";
import { SectionLabel } from "./shared";
import { FullScreenOverlay } from "./motion";
import { REST_TIMER_PRESETS } from "./restTimerPreferences";
import { PRESET_SELECTED_BG, PRESET_SELECTED_BORDER, PRESET_SELECTED_COLOR } from "./workoutUiTokens";
import {
  formatWaterLitersFromOz,
  normalizeWaterDailyTargetOz,
  WATER_TARGET_PRESETS_OZ,
} from "./waterIntake";
import {
  formatWeightFromLbs,
  heightUnitLabel,
  weightUnitLabel,
} from "./unitPreferences";
import type { AppState, EquipmentSetup, HabitTemplate, MacroTotals, UnitPreferences } from "./types";
import { sanitizeUserText } from "./userText";

function newHabitId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function isValidPlanStartIso(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00`));
}

function iconButton(icon: HabitTemplate["icon"], selected: boolean, onPick: () => void) {
  const Comp = icon === "drop" ? IconDroplet : icon === "run" ? IconRun : icon === "bolt" ? IconBolt : IconMoon;
  return (
    <button
      key={icon}
      type="button"
      className="tap"
      onClick={onPick}
      aria-label={`Icon ${icon}`}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        display: "grid",
        placeItems: "center",
        border: selected ? "1px solid var(--border-strong)" : "0.5px solid var(--border)",
        background: selected ? "var(--surface-4)" : "var(--surface-1)",
        color: selected ? "var(--text-primary)" : "var(--text-faint-soft)",
      }}
    >
      <Comp size={14} stroke={1.6} />
    </button>
  );
}

export function SettingsSheet({
  open,
  state,
  setState,
  onClose,
}: {
  open: boolean;
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  onClose: () => void;
}) {
  const todayKey = localDateKey(new Date());
  const T = state.nutritionTargets;

  const [calIn, setCalIn] = useState(String(T.cal));
  const [pIn, setPIn] = useState(String(T.p));
  const [cIn, setCIn] = useState(String(T.c));
  const [fIn, setFIn] = useState(String(T.f));

  const [waterTargetIn, setWaterTargetIn] = useState(String(state.waterDailyTargetOz));
  const [stepsTargetIn, setStepsTargetIn] = useState(String(state.stepsTarget));

  const sync = useFitnessSync();
  const { theme, setTheme } = useTheme();
  const [syncEmail, setSyncEmail] = useState("");
  const [syncPassword, setSyncPassword] = useState("");
  const [syncHint, setSyncHint] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission);

  useEffect(() => {
    setCalIn(String(T.cal));
    setPIn(String(T.p));
    setCIn(String(T.c));
    setFIn(String(T.f));
  }, [T.cal, T.p, T.c, T.f]);

  useEffect(() => {
    setWaterTargetIn(String(state.waterDailyTargetOz));
  }, [state.waterDailyTargetOz]);

  useEffect(() => {
    setStepsTargetIn(String(state.stepsTarget));
  }, [state.stepsTarget]);

  function commitWaterTarget(raw: string) {
    const n = parseInt(raw, 10);
    const val = normalizeWaterDailyTargetOz(Number.isFinite(n) ? n : undefined);
    setWaterTargetIn(String(val));
    setState((s) => ({
      ...s,
      waterDailyTargetOz: val,
    }));
  }

  function commitStepsTarget(raw: string) {
    const n = parseInt(raw, 10);
    const stepsTarget = Math.min(100_000, Math.max(1000, Number.isFinite(n) ? n : state.stepsTarget));
    setStepsTargetIn(String(stepsTarget));
    setState((s) => ({
      ...s,
      stepsTarget,
      dailyTasks: generateDailyTasksForDate(
        new Date(),
        s.nutritionTargets,
        s.planStartIso,
        stepsTarget,
        s.workoutTemplates,
        resolveWorkoutDaysPerWeek(s.workoutTemplates, s.onboardingProfile?.workoutDaysPerWeek),
      ),
    }));
  }

  function commit(patch: Partial<MacroTotals>) {
    setState((s) => {
      const nutritionTargets = { ...s.nutritionTargets, ...patch };
      return {
        ...s,
        nutritionTargets,
        dailyTasks: generateDailyTasksForDate(
          new Date(),
          nutritionTargets,
          s.planStartIso,
          s.stepsTarget,
          s.workoutTemplates,
          resolveWorkoutDaysPerWeek(s.workoutTemplates, s.onboardingProfile?.workoutDaysPerWeek),
        ),
      };
    });
  }

  function macroFieldProps(key: keyof MacroTotals, raw: string, setRaw: (v: string) => void) {
    return {
      value: raw,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setRaw(v);
        if (v === "" || v === "-") return;
        const n = parseFloat(v);
        if (Number.isFinite(n) && n >= 0) commit({ [key]: n } as Partial<MacroTotals>);
      },
      onBlur: () => {
        const n = parseFloat(raw);
        const val = Number.isFinite(n) && n >= 0 ? n : 0;
        setRaw(String(val));
        commit({ [key]: val } as Partial<MacroTotals>);
      },
      inputMode: "decimal" as const,
      className: "input",
      style: { marginTop: 8, fontVariantNumeric: "tabular-nums" as const },
    };
  }

  return (
    <FullScreenOverlay open={open} zIndex={250}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 4px 10px 16px",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div id="settings-title" style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Settings
        </div>
        <button
          type="button"
          className="tap"
          onClick={onClose}
          aria-label="Close settings"
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            color: "var(--text-secondary)",
          }}
        >
          <IconX size={20} stroke={1.8} />
        </button>
      </div>

      <div className="screen" style={{ flex: 1, overflow: "auto", paddingBottom: 28 }}>
        <SectionLabel>Appearance</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)", fontWeight: 400 }}>
          Choose light or dark mode for the app interface.
        </p>
        <div className="card" style={{ padding: "12px 14px", marginBottom: 18, display: "flex", gap: 8 }}>
          {(["dark", "light"] as AppTheme[]).map((option) => {
            const active = theme === option;
            return (
              <button
                key={option}
                type="button"
                className="tap"
                aria-pressed={active}
                onClick={() => setTheme(option)}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  border: active ? "2px solid #3B82F6" : "1px solid var(--border)",
                  background: active ? "rgba(59, 130, 246, 0.12)" : "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                {option === "dark" ? "Dark" : "Light"}
              </button>
            );
          })}
        </div>

        <SectionLabel>Account</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)", fontWeight: 400 }}>
          Sign in with the same account on your phone and computer. Data merges when both sides edit, and the cloud copy is updated after changes (about a second delay).
        </p>
        {!sync.configured ? (
          <div className="card" style={{ padding: "16px 18px", marginBottom: 18, fontSize: 13, lineHeight: 1.55, color: "var(--text-secondary)" }}>
            <p style={{ margin: "0 0 10px" }}>
              Cloud sync is off, the app does not see valid Supabase env vars. Fix this, then restart{" "}
              <code style={{ fontSize: 12, color: "var(--text-soft)" }}>npm run dev</code>.
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                File must be named <code style={{ fontSize: 12 }}>.env</code> in the project root (same folder as{" "}
                <code style={{ fontSize: 12 }}>package.json</code>), not inside <code style={{ fontSize: 12 }}>src</code>.
              </li>
              <li>
                Exact lines: <code style={{ fontSize: 12 }}>VITE_SUPABASE_URL=https://…supabase.co</code> and{" "}
                <code style={{ fontSize: 12 }}>VITE_SUPABASE_ANON_KEY=…</code> (anon JWT <code style={{ fontSize: 11 }}>eyJ…</code>), or{" "}
                <code style={{ fontSize: 12 }}>VITE_SUPABASE_PUBLISHABLE_KEY=…</code>. Never the secret JWT. No spaces around{" "}
                <code style={{ fontSize: 12 }}>=</code>.
              </li>
              <li>
                URL must start with <code style={{ fontSize: 12 }}>https://</code>. Restart the dev server after saving.
              </li>
              <li style={{ color: "var(--text-ghost)", fontSize: 12 }}>
                Dev hint: open the browser console, if env still fails, you’ll see a short{" "}
                <code style={{ fontSize: 11 }}>[Fitcoach]</code> message about what’s missing.
              </li>
            </ul>
          </div>
        ) : !sync.sessionEmail ? (
          <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Email
              <input
                className="input"
                style={{ marginTop: 8 }}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={syncEmail}
                onChange={(e) => setSyncEmail(e.target.value)}
                aria-label="Email"
              />
            </label>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Password
              <input
                className="input"
                style={{ marginTop: 8 }}
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={syncPassword}
                onChange={(e) => setSyncPassword(e.target.value)}
                aria-label="Password"
              />
            </label>
            {syncHint ? (
              <p style={{ margin: 0, fontSize: 13, color: "rgba(120,200,255,0.95)", lineHeight: 1.45 }}>{syncHint}</p>
            ) : null}
            {sync.lastError ? (
              <p style={{ margin: 0, fontSize: 13, color: "rgba(248,113,113,0.95)", lineHeight: 1.45 }}>{sync.lastError}</p>
            ) : null}
            <button
              type="button"
              className="tap"
              disabled={sync.busy || !syncEmail.includes("@") || !syncPassword}
              onClick={async () => {
                setSyncHint(null);
                const r = await sync.signInWithPassword(syncEmail, syncPassword);
                if (r.error) setSyncHint(r.error);
                else setSyncHint("Signed in. Sync continues automatically.");
              }}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                background: sync.busy || !syncEmail.includes("@") || !syncPassword ? "var(--btn-disabled-bg)" : "var(--surface-selected)",
                color: "var(--text-primary)",
              }}
            >
              Sign in
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Signed in</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{sync.sessionEmail}</div>
            {sync.lastSyncedLabel ? (
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Last uploaded · {sync.lastSyncedLabel}</div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Waiting for first upload…</div>
            )}
            {sync.busy ? (
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Syncing…</div>
            ) : null}
            {sync.lastError ? (
              <p style={{ margin: 0, fontSize: 13, color: "rgba(248,113,113,0.95)", lineHeight: 1.45 }}>{sync.lastError}</p>
            ) : null}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="tap"
                disabled={sync.busy}
                onClick={() => void sync.syncNow()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  background: "var(--surface-selected)",
                  color: "var(--text-primary)",
                }}
              >
                Sync now
              </button>
              <button
                type="button"
                className="tap"
                onClick={() => void sync.signOut()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  border: "none",
                  background: "var(--surface-3)",
                  color: "var(--text-secondary)",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <SectionLabel>You</SectionLabel>
        </div>
        <div className="card" style={{ padding: "16px 18px", marginBottom: 18 }}>
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            First name (home greeting)
            <input
              className="input"
              style={{ marginTop: 8 }}
              value={state.displayName}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  displayName: sanitizeUserText(e.target.value),
                }))
              }
              placeholder="Your name"
              autoCapitalize="words"
              aria-label="Display name"
            />
          </label>
        </div>

        <div style={{ marginTop: 24 }}>
          <SectionLabel>Units</SectionLabel>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)", fontWeight: 400 }}>
          Weight and height display units. Logged values are stored consistently, switching units only changes how numbers are shown.
        </p>
        <div className="card" style={{ padding: "16px 18px", marginBottom: 18 }}>
          <UnitPreferencePicker
            value={state.unitPreferences}
            onChange={(next: UnitPreferences) =>
              setState((s) => ({
                ...s,
                unitPreferences: next,
              }))
            }
          />
        </div>

        <SectionLabel>Rest timer</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)", fontWeight: 400 }}>
          Default rest between sets when you mark a set complete. Override per exercise during a workout from the timer bar.
        </p>
        <div className="card" style={{ padding: "16px 18px", marginBottom: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {REST_TIMER_PRESETS.map((sec) => {
              const selected = state.restTimerDefaultSeconds === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  className="tap"
                  aria-pressed={selected}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      restTimerDefaultSeconds: sec,
                    }))
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: selected ? `0.5px solid ${PRESET_SELECTED_BORDER}` : "0.5px solid var(--border)",
                    background: selected ? PRESET_SELECTED_BG : "var(--surface-1)",
                    color: selected ? PRESET_SELECTED_COLOR : "var(--text-muted-soft)",
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {sec}s
                </button>
              );
            })}
          </div>
        </div>

        <SectionLabel>Reminders</SectionLabel>
        <div style={{ marginBottom: 18 }}>
          <NotificationPreferencesPicker
            value={state.notificationPreferences}
            onChange={(notificationPreferences) =>
              setState((s) => ({
                ...s,
                notificationPreferences,
              }))
            }
            permission={notificationPermission}
            onPermissionChange={setNotificationPermission}
            showPermissionHint
          />
        </div>

        <SectionLabel>Hydration</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)", fontWeight: 400 }}>
          Daily water intake target on the Nutrition tab. Logged in fluid ounces with a metric equivalent.
        </p>
        <div className="card" style={{ padding: "16px 18px", marginBottom: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {WATER_TARGET_PRESETS_OZ.map((oz) => {
              const selected = state.waterDailyTargetOz === oz;
              return (
                <button
                  key={oz}
                  type="button"
                  className="tap"
                  aria-pressed={selected}
                  onClick={() => commitWaterTarget(String(oz))}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: selected ? `0.5px solid ${PRESET_SELECTED_BORDER}` : "0.5px solid var(--border)",
                    background: selected ? PRESET_SELECTED_BG : "var(--surface-1)",
                    color: selected ? PRESET_SELECTED_COLOR : "var(--text-muted-soft)",
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {oz} oz
                </button>
              );
            })}
          </div>
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Custom target (oz)
            <input
              type="number"
              min={16}
              max={256}
              step={1}
              inputMode="numeric"
              className="input"
              style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
              value={waterTargetIn}
              onChange={(e) => {
                const v = e.target.value;
                setWaterTargetIn(v);
                if (v === "" || v === "-") return;
                const n = parseInt(v, 10);
                if (Number.isFinite(n) && n >= 16 && n <= 256) {
                  setState((s) => ({
                    ...s,
                    waterDailyTargetOz: n,
                  }));
                }
              }}
              onBlur={() => commitWaterTarget(waterTargetIn)}
              aria-label="Daily water target in ounces"
            />
          </label>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginTop: 8 }}>
            {formatWaterLitersFromOz(state.waterDailyTargetOz)}
          </div>
        </div>

        <SectionLabel>Equipment</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)", fontWeight: 400 }}>
          Workout templates swap exercises to match what you have available.
        </p>
        <div className="card" style={{ padding: "16px 18px", marginBottom: 18 }}>
          <EquipmentSetupPicker
            value={state.equipmentSetup}
            onChange={(next: EquipmentSetup) =>
              setState((s) => ({
                ...s,
                equipmentSetup: next,
                equipmentSetupChosen: true,
                workoutTemplates: buildWorkoutTemplates(s.experienceLevel, next),
              }))
            }
          />
        </div>

        {state.progressGoal ? (
          <>
            <SectionLabel>Goal range</SectionLabel>
            <div className="card" style={{ padding: "16px 18px", marginBottom: 18, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {formatWeightFromLbs(state.progressGoal.goalWeightLowLbs, state.unitPreferences.weightUnit)}–
              {formatWeightFromLbs(state.progressGoal.goalWeightHighLbs, state.unitPreferences.weightUnit)}{" "}
              {weightUnitLabel(state.unitPreferences.weightUnit)} · height in {heightUnitLabel(state.unitPreferences.heightUnit)}
            </div>
          </>
        ) : null}

        <SectionLabel>Fuel targets</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)", fontWeight: 400 }}>
          Daily calorie and macro goals used on Home, Fuel, habits copy, and weekly review math.
        </p>
        <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Calories (kcal)
            <input aria-label="Target calories" {...macroFieldProps("cal", calIn, setCalIn)} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Protein (g)
              <input aria-label="Target protein grams" {...macroFieldProps("p", pIn, setPIn)} />
            </label>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Carbs (g)
              <input aria-label="Target carbs grams" {...macroFieldProps("c", cIn, setCIn)} />
            </label>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Fat (g)
              <input aria-label="Target fat grams" {...macroFieldProps("f", fIn, setFIn)} />
            </label>
          </div>
        </div>

        <SectionLabel>Habits checklist</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)", fontWeight: 400 }}>
          Rename, pick an icon, or add rows. The runner icon shows your steps goal and program week on the Home daily habits card.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {state.habitTemplates.map((h) => (
            <div key={h.id} className="card" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                className="input"
                value={h.name}
                onChange={(e) => {
                  const name = sanitizeUserText(e.target.value);
                  setState((s) => {
                    const templates = s.habitTemplates.map((x) => (x.id === h.id ? { ...x, name } : x));
                    return {
                      ...s,
                      habitTemplates: templates,
                      habits: buildHabitsForDateKey(templates, s.habitsDoneByDay, todayKey),
                    };
                  });
                }}
                aria-label={`Habit name`}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", marginRight: 4 }}>ICON</span>
                {(["drop", "run", "bolt", "moon"] as const).map((ic) =>
                  iconButton(ic, h.icon === ic, () => {
                    setState((s) => {
                      const templates = s.habitTemplates.map((x) => (x.id === h.id ? { ...x, icon: ic } : x));
                      return {
                        ...s,
                        habitTemplates: templates,
                        habits: buildHabitsForDateKey(templates, s.habitsDoneByDay, todayKey),
                      };
                    });
                  }),
                )}
                <button
                  type="button"
                  className="tap"
                  onClick={() => {
                    setState((s) => {
                      const templates = s.habitTemplates.filter((x) => x.id !== h.id);
                      const nextDoneByDay = { ...s.habitsDoneByDay };
                      for (const dk of Object.keys(nextDoneByDay)) {
                        const m = nextDoneByDay[dk];
                        if (!m || typeof m !== "object") continue;
                        if (h.id in m) {
                          const { [h.id]: _, ...rest } = m;
                          nextDoneByDay[dk] = rest;
                        }
                      }
                      return {
                        ...s,
                        habitTemplates: templates,
                        habitsDoneByDay: nextDoneByDay,
                        habits: buildHabitsForDateKey(templates, nextDoneByDay, todayKey),
                      };
                    });
                  }}
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(248,113,113,0.95)",
                    padding: "6px 10px",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="tap"
            onClick={() => {
              setState((s) => {
                const templates = [...s.habitTemplates, { id: newHabitId(), name: "New habit", icon: "bolt" }];
                return {
                  ...s,
                  habitTemplates: templates,
                  habits: buildHabitsForDateKey(templates, s.habitsDoneByDay, todayKey),
                };
              });
            }}
            style={{
              border: "0.5px dashed var(--border)",
              borderRadius: 12,
              padding: 14,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "transparent",
            }}
          >
            + Add habit
          </button>
        </div>

        <SectionLabel>Program</SectionLabel>
        <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Block start date
            <input
              type="date"
              className="input"
              style={{ marginTop: 8 }}
              value={state.planStartIso}
              onChange={(e) => {
                const v = e.target.value;
                if (!isValidPlanStartIso(v)) return;
                setState((s) => ({
                  ...s,
                  planStartIso: v,
                  dailyTasks: generateDailyTasksForDate(
                    new Date(),
                    s.nutritionTargets,
                    v,
                    s.stepsTarget,
                    s.workoutTemplates,
                    resolveWorkoutDaysPerWeek(s.workoutTemplates, s.onboardingProfile?.workoutDaysPerWeek),
                  ),
                }));
              }}
              aria-label="Program start date"
            />
          </label>
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Steps goal
            <input
              type="text"
              inputMode="numeric"
              className="input"
              style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
              value={stepsTargetIn}
              onChange={(e) => {
                const v = e.target.value;
                if (v !== "" && !/^\d+$/.test(v)) return;
                setStepsTargetIn(v);
                if (v === "") return;
                const n = parseInt(v, 10);
                if (!Number.isFinite(n)) return;
                const stepsTarget = Math.min(100_000, Math.max(1000, n));
                setState((s) => ({
                  ...s,
                  stepsTarget,
                  dailyTasks: generateDailyTasksForDate(
                    new Date(),
                    s.nutritionTargets,
                    s.planStartIso,
                    stepsTarget,
                    s.workoutTemplates,
                    resolveWorkoutDaysPerWeek(s.workoutTemplates, s.onboardingProfile?.workoutDaysPerWeek),
                  ),
                }));
              }}
              onBlur={() => commitStepsTarget(stepsTargetIn)}
              aria-label="Daily steps goal"
            />
          </label>
        </div>
      </div>
      </div>
    </FullScreenOverlay>
  );
}
